/**
 * Created by Nitheen on 2/24/2015.
 */
'use strict';

/* library that provides a whole mess of useful functional */
var underscore        	    = require('underscore');
/*Application constant*/
var constant                = require('../general/application-constant');
/*Application error list*/
var appError                = require('../general/application-logger');
//Account mongoose model
var accountSchema           = require('../models/mongoose-model').Account;
//Account mongoose model
var userSchema              = require('../models/mongoose-model').User;
//Application types
var applicationTypes        = require("../general/account-types");
//File System
var fs                      = require("fs");

var IAccount = require('./account-interface').IAccount;

var getNew = {new: true};

var sample_type_path = "./sample_types/";

/**
 * Create a Account factory object
 * @constructor
 */
var AccountFactory  = function() {};

function getMatchingObjectById(itemList, fieldName, fieldValue){
    return underscore.find(itemList, function(item){
        return item[fieldName].toString() === fieldValue.toString()
    });
}

function getMatchingPositionObjectById(itemList, fieldName, fieldValue){
    var position  = -1;
     underscore.find(itemList, function(item,index){
        if(item[fieldName].toString() === fieldValue.toString()){
            position = index;
            return item;
        }
    });
    return position;
}


/**
 * Implementing  Account interface
 * @type {IAccount}
 */
AccountFactory.prototype = Object.create(IAccount);

/**
 * Adding New Account
 * @param account
 */
AccountFactory.prototype.addAccount =  function(account){        
    var type = account.type;
    var tmpAccount = underscore.omit(account, 'roles', 'type');

    //Create account model from the data
    var _account =  new accountSchema(tmpAccount);
    //Create account model from the data
    var _user =  new userSchema(tmpAccount);
    
    try {
        var role = applicationTypes.getAccountOwnerDefaultRole(type);    
        _account.types = [];
        _account.types.push(type);        
    } catch (error) {        
        return Promise.reject(error);
    }
    
    //Software settings
    if(account.tabs){
        account.tabs.forEach(function(tab){
            var content = fs.readFileSync(sample_type_path + tab + '.json', 'utf8');
             _account.software.tabs.push(JSON.parse(content));
        });
    }
        
    if(account.headerColor){
        _account.software.reportHeaderColor = account.headerColor;
    }else {
        _account.software.reportHeaderColor = constant.REPORT_HEADER_COLOR;
    }

    if(account.allowCameraFile){
        _account.software.allowCameraFile = account.allowCameraFile;
    }

    //Add user information and default permission.
    var accountId;        
    
    return accountSchema.count()
    .exec()
    .then(function(count, error) {                   
        if(!count){
            count = 0; 
        }                              
        _account.accountNo =  count + 1;        
        return _account;
    })       
    .then(function(accountCount){                       
        return _account.save();
    })
    .then(function(newAccount){                
            accountId = newAccount._id;
            _user.accounts = [];
            _user.accounts.push(accountId);
            return _user.save();            
        })  
    .then(function(newUser) {
                        
        var accountId = newUser.accounts[0];  
        var pushUser = {
            user : newUser._id,
            role : role,
            permissions : constant.PERMISSIONS.allPermissions,
            isMaster:  true
        };
                 
        return accountSchema.findByIdAndUpdate(accountId.toString(),
            {$push: {'users': pushUser}}, getNew).exec(); 
    })         
};


/**
 * Adding new user and update user with account id.
 * @param accountId
 * @param user
 * @returns {*}
 */
AccountFactory.prototype.addUser =  function(accountId, user){

    var tmp = underscore.omit(user, ['_id', 'isActive', 'accounts']);

    //Create user model from the data
    var _user =  new userSchema(tmp);
    
    //Push the account id
    _user.accounts.push(accountId);

    return _user.save()
        .then(function(newUser){
           return newUser;
        })
        .then(function(newUser){
            var pushUser = {
                user : newUser._id,
                role : constant.ROLE_TYPES.rl_User,
                permissions : []
            };
            
            if(user.permissions &&  Array.isArray(user.permissions)){
                pushUser.permissions = user.permissions;
            }
            return accountSchema.findByIdAndUpdate(accountId,
                {$push: {'users': pushUser}}, getNew)
                .exec()
                .then(function(){
                   return newUser;
                });
        });
};

function saveModifyUser(user){
    return user.save().then(function(modifieduser){
        return modifieduser;
    })
}


AccountFactory.prototype.modifyUser = function(userid, userData){
    return userSchema.findOne({_id:  userid, isActive: true})
        .exec()
        .then(function(user) {
            if (!user) {
                return Promise.reject(appError.expectionList.USER_NOT_FOUND);
            }
            if (userData.password) {
                user.password = userData.password;
            }
            if (userData.phoneNo) {
                user.phoneNo = userData.phoneNo;
            }
            if (userData.firstName) {
                user.firstName = userData.firstName;
            }
            if (userData.lastName) {
                user.lastName = userData.lastName;
            }
            user.modifiedDate = Date.now();
            return user;
        })
        .then(function(user){                        
            return user.save().then(function (modifieduser) {
                return modifieduser;
            })
        })
};

AccountFactory.prototype.deleteUser = function(accountId, userId){
    return accountSchema.findOne({_id: accountId, users: {$elemMatch: {user: userId}}}, {'users.$': 1})
        .exec()
        .then(function(userData) {
            if (userData) {                   
                if (!userData.users[0].isMaster) {                    
                    return accountSchema.findOneAndUpdate({_id: accountId},
                        {$pull: {'users': {'user': userId}}})    
                        .exec()                    
                        .then((account) => {                            
                            return userSchema.findOneAndUpdate({_id: userId},
                                {$pull: {accounts: accountId}}, getNew)
                                .exec();
                        })
                        .then(function (user) {
                            if (user.accounts.length === 0) {
                                return userSchema.findByIdAndUpdate(userId, {
                                    $set: {
                                        isActive: false,
                                        userName: 'DELETED_' + user.userName
                                    }
                                }, getNew).exec();
                            }
                            return user;
                        });
                }else {
                    return Promise.reject(appError.expectionList.MASTER_USER_DELETE);
                }
            } else {
                return Promise.reject(appError.expectionList.USER_NOT_FOUND);
             }
        });
};

AccountFactory.prototype.UpdateUserAccountPermissions = function(accountId, userId, permissions){
    if(!permissions) {
        return Promise.reject(appError.expectionList.NULL_PARAMETER);
    }
    if(Array.isArray(permissions)) {
        var update = {};
        update['users.$.permissions'] = permissions;
        return accountSchema.findOne({_id: accountId, users: {$elemMatch: {user: userId}}}, {'users.$': 1})
            .exec()
            .then(function (userData) {
                if (userData) {
                    if (!userData.users[0].isMaster) {
                        return accountSchema.findOneAndUpdate({_id: accountId, users: {$elemMatch: {user: userId}}},
                            {$set: update}, getNew)
                            .exec();
                    } else {
                        return Promise.reject(appError.expectionList.MASTER_USER_PERMISSION);
                    }
                } else {
                    return Promise.reject(appError.expectionList.USER_NOT_FOUND);
                }
            });
    }
    return Promise.reject(appError.expectionList.INVALID_ARGUMENT_TYPE);
};

AccountFactory.prototype.setUserStatus = function(accountId, userId, status) {
    return accountSchema.findOne({_id:  accountId, users: {$elemMatch: {user: userId}}}, {'users.$': 1})
        .exec()
        .then(function(userData) {
            if(userData) {
                if (!userData.users[0].isMaster) {
                    return accountSchema.findOneAndUpdate({_id: accountId,  'users.user': userId},
                        {$set: {
                            'users.$.isActive' : status
                        }}, getNew)
                        .exec()
                }
                else{
                    return Promise.reject(appError.expectionList.MASTER_USER_DEACTIVATE);
                }
            }
            else{
                return Promise.reject(appError.expectionList.USER_NOT_FOUND);
            }
        })
};

AccountFactory.prototype.getAllUsers = function(accountId){
        return accountSchema.findById(accountId)
            .populate('users.user', '_id firstName lastName userName phoneNo')
            .exec()
            .then(function(account){
                var users =  account.users;
                var allUsers = [];
                users.forEach(function(user){
                    var tmpUser =  user.user.toObject();
                    tmpUser.role = user.role;
                    tmpUser.permissions = user.permissions;
                    tmpUser.isActive =  user.isActive;
                    allUsers.push(tmpUser);
                });
                return allUsers;
            })
};

/*TODO Convert to promise**/

AccountFactory.prototype.addAccountToUser =  function(accountId, userId, next){
    userSchema.findById(userId, function (err, user) {
        if(err){return next(err); }
        if(underscore.contains(user.accounts, accountId)){
            return next(appError.getError(appError.expectionList.USER_NOT_FOUND));
        }else{
            var pushUser = {
                user : userId,
                role : constant.ROLE_TYPES.rl_User,
                permission : []
            };
            accountSchema.findByIdAndUpdate(accountId, {$push: {users: pushUser}}, getNew, function (err, account){
                if(err){return next(err); }
                if(account.isActive){
                    userSchema.findByIdAndUpdate(userId, {$push : {accounts : accountId}}, getNew, next)
                }else{
                    return next(appError.getError(appError.expectionList.ACCOUNT_NOT_FOUND));
                }
            });
        }
    });
};

/**
 * Add new project
 * @param accountId
 * @param userId
 * @param name
 * @param description
 */
AccountFactory.prototype.addProject = function(accountId, userId, name, description){
    return accountSchema.findOne({_id: accountId, 'project_session.projects': {$elemMatch:{name: name, isActive:true}}}, {'project_session.projects.$': 1}).exec()
        .then(function(project){
            if(project){
                return Promise.reject(appError.expectionList.DUPLICATE);
            }
            var newProject = {
                sessions: [],
                name: name,
                description: description,
                createdBy: userId,
                modifiedBy: userId,
                defSessionId: ''
            };
            var update = { $push: {'project_session.projects': newProject} };

            return accountSchema.findByIdAndUpdate(accountId, update, getNew).exec()
                 .then(function(projectObject){                    
                    var projects = projectObject.project_session.projects;
                     return projects[projects.length-1]._id;
                 })
        })
};

/**
 * Modify Existing project name
 * @param accountId
 * @param userId
 * @param projectId
 * @param description
 * @param name
 */
AccountFactory.prototype.modifyProjectName = function(accountId, userId, projectId, name, description){
    if(!name){
        return Promise.reject(appError.expectionList.NULL_PARAMETER);
    }
    return accountSchema.findOne({_id: accountId, 'project_session.projects': {$elemMatch:{_id: projectId}}},
        {'project_session.projects': 1}).exec()
        .then(function(projectObject){
            if(!projectObject){
                return Promise.reject(appError.expectionList.NOT_FOUND);
            }
            var projects =  projectObject.project_session.projects;
            var result = underscore.findWhere(projects, {name: name, isActive:true});
            if(result){
                if(result._id.toString() === projectId){
                    if(result.description !== description){
                        result = null;
                    }else{
                        return getMatchingObjectById(projectObject.project_session.projects, '_id', projectId);
                    }
                }
            }

            if(!result){
                return accountSchema.findOneAndUpdate({_id: accountId, 'project_session.projects._id': projectId},
                    {$set: {
                        'project_session.projects.$.name' : name,
                        'project_session.projects.$.description' : description,
                        'project_session.projects.$.modifiedBy' : userId,
                        'project_session.projects.$.modifiedDate' : Date.now()
                    }}, getNew)
                    .select({'project_session.projects': 1})
                    .exec()
                    .then(function(projectObject){
                        return getMatchingObjectById(projectObject.project_session.projects, '_id', projectId);
                    });
            }else{
                return Promise.reject(appError.expectionList.DUPLICATE);
            }
        })
};

/**
 * Setting default project in the account
 * @param accountId
 * @param userId
 * @param projectId
 * @param status
 */
AccountFactory.prototype.setDefaultProject = function(accountId, userId, projectId, status){
    return accountSchema.findOne({_id: accountId, 'project_session.projects': {$elemMatch:{_id: projectId}}}, {'project_session.projects.$': 1}).exec()
        .then(function(projectObject){
            if(!projectObject){
                return Promise.reject(appError.expectionList.NOT_FOUND);
            }

            var id = projectObject.project_session.projects[0]._id;
            if(status === false){
                if(id.toString() === projectId){
                    id = '';
                }else{
                    return constant.ok;
                }
            }
            return accountSchema.findByIdAndUpdate(accountId, {$set: {'project_session.defProjectId': id }}, getNew)
                .exec()
                .then(function(){
                    return constant.ok;
                })
        })
};

AccountFactory.prototype.deleteProject = function(accountId, userId, projectId){
    return accountSchema.findOneAndUpdate({_id: accountId, 'project_session.projects._id': projectId},
        {$set: {
            'project_session.projects.$.isActive' : false,
            'project_session.projects.$.modifiedBy' : userId,
            'project_session.projects.$.modifiedDate' : Date.now()
        }},getNew)
        .exec();
};

/**
 * Add Session to the project
 * @param accountId
 * @param userId
 * @param projectId
 * @param name
 * @param description
 * @returns {*}
 */
AccountFactory.prototype.addSession = function(accountId, userId, projectId, name, description){
    if(!name){
        return Promise.reject(appError.expectionList.NULL_PARAMETER);
    }
    return accountSchema.findOne({_id: accountId, 'project_session.projects': {$elemMatch:{_id: projectId, sessions : {$elemMatch : {name: name, isActive: true}}}}},
        {'project_session.projects.$': 1}).exec()
        .then(function(projectObject){
            if(projectObject){
                return Promise.reject(appError.expectionList.DUPLICATE);
            }
            var session = {
                name          : name,
                description   : description,
                createdBy     : userId,
                modifiedBy    : userId
            };

            var update = { $push: {'project_session.projects.$.sessions': session} };
            return accountSchema.findOneAndUpdate({_id: accountId, 'project_session.projects._id': projectId}, update, getNew).select('-_id project_session')
                .exec()
                .then(function(projectObject){
                    var project = getMatchingObjectById(projectObject.project_session.projects, '_id', projectId);
                    return project.sessions[project.sessions.length-1]._id;
                })
        })
};

/**
 * Modify the session name
 * @param accountId
 * @param userId
 * @param projectId
 * @param sessionId
 * @param name
 * @param description
 * @returns {*}
 */
AccountFactory.prototype.modifySessionName = function(accountId, userId, projectId, sessionId, name, description){
    if(!name){
        return Promise.reject(appError.expectionList.NULL_PARAMETER);
    }
    return accountSchema.findOne({_id: accountId, 'project_session.projects': {$elemMatch:{_id: projectId, sessions : {$elemMatch : {_id: sessionId}}}}}).exec()
        .then(function(projectObject){
            if(!projectObject){
                return Promise.reject(appError.expectionList.NOT_FOUND);
            }
            var projects = projectObject.project_session.projects;


            //Get Matching project object from project id.
            var matchProject =  getMatchingObjectById(projects, '_id', projectId);

            //Get session position from matching session id.
            var position = getMatchingPositionObjectById(matchProject.sessions, '_id',sessionId);

            //Validate duplicate session name
            var result = underscore.findWhere(matchProject.sessions, {name: name, isActive:true});

            if(result){
                if(result._id.toString() === sessionId){
                    if(result.description !== description){
                        result = null;
                    }else{
                        return result;
                    }
                }
            }

            if(!result){
                var update = {};
                update['project_session.projects.$.sessions.' + position + '.name'] = name;
                update['project_session.projects.$.sessions.' + position + '.description'] = description;
                update['project_session.projects.$.sessions.' + position + '.modifiedBy'] = userId;
                update['project_session.projects.$.sessions.' + position + '.modifiedDate'] =Date.now();
                return accountSchema.findOneAndUpdate({_id: accountId, 'project_session.projects._id': projectId},
                    {$set: update}, getNew).select('project_session -_id')
                    .exec()
                    .then(function(projectObject){
                        var project = getMatchingObjectById(projectObject.project_session.projects, '_id', projectId);
                        return getMatchingObjectById(project.sessions,'_id', sessionId);
                    })
            }
            return Promise.reject(appError.expectionList.DUPLICATE);
        })
};

AccountFactory.prototype.setDefaultSession =  function(accountId, userId, projectId, sessionId, status){
    return accountSchema.findOne({_id: accountId, 'project_session.projects': {$elemMatch:{_id: projectId, sessions : {$elemMatch : {_id: sessionId}}}}}).exec()
        .then(function(projectObject){
            if(!projectObject){
                return Promise.reject(appError.expectionList.NOT_FOUND);
            }
            var projectList = projectObject.project_session.projects;

            //Get matching project object from project id.
            var matchProject = getMatchingObjectById(projectList, '_id', projectId);
            //Get matching session object from project id.
            var session = getMatchingObjectById( matchProject.sessions, '_id', sessionId);

            var id;
            if(session) {
                if (status === true) {
                    id = session._id;
                } else {
                    if (matchProject.defSessionId === sessionId) {
                        id = '';
                    }
                    return constant.ok;
                }
                return accountSchema.findOneAndUpdate({
                        _id: accountId,
                        'project_session.projects._id': projectId
                    },
                    {
                        $set: {
                            'project_session.projects.$.defSessionId': id,
                            'project_session.projects.$.modifiedBy': userId,
                            'project_session.projects.$.modifiedDate': Date.now()
                        }
                    })
                    .exec()
                    .then(function () {
                        return constant.ok;
                    })
            }
            return Promise.reject(appError.expectionList.NOT_FOUND);
        });
};

AccountFactory.prototype.deleteSession = function(accountId, userId, projectId, sessionId){
    return accountSchema.findOne({_id: accountId, 'project_session.projects': {$elemMatch:{_id: projectId, sessions : {$elemMatch : {_id: sessionId}}}}}).exec()
        .then(function(projectObject){
            if(!projectObject){
                return Promise.reject(appError.expectionList.NOT_FOUND);
            }
            var projects = projectObject.project_session.projects;

            //Get Matching project object from project id.
            var matchProject =  getMatchingObjectById(projects, '_id', projectId);

            //Get session position from matching session id.
            var position = getMatchingPositionObjectById(matchProject.sessions, '_id',sessionId);

                var update = {};
                update['project_session.projects.$.sessions.' + position + '.isActive'] = false;
                update['project_session.projects.$.sessions.' + position + '.modifiedBy'] = userId;
                update['project_session.projects.$.sessions.' + position + '.modifiedDate'] =Date.now();
                return accountSchema.findOneAndUpdate({_id: accountId, 'project_session.projects._id': projectId},
                    {$set: update}, getNew)
                    .exec();
        })
};


/**
 * Get Project Session that are associated with account.
 * @param accountId
 */
AccountFactory.prototype.getAllProjectSession = function(accountId){
    return accountSchema.findById(accountId, {project_session: 1, _id: 0})
        .exec()
        .then(function(projectSessions){
            var projectSession = projectSessions.project_session;
            var projects =  projectSession.projects;
            var activeProjects = underscore.filter(projects, function(project){
                return project.isActive;
            });
        if(activeProjects.length === 0){
            return { projects: []};
        }else{
            activeProjects.forEach(function(project){
                var sessions = project.sessions;
                var activeSessions = underscore.filter(sessions, function(session){
                    return session.isActive;
                });
                if(activeSessions !== 0){
                    project.sessions = activeSessions;
                }else{
                    project.sessions = [];
                }
            });
            return { defProjectId: projectSession.projectSession, projects: activeProjects  };
        }
    })
};

/**
 * Get All project
 * @param accountId
 * @param projectId
 */
AccountFactory.prototype.getProjectById = function(accountId, projectId){
    return accountSchema.findOne({_id: accountId, 'project_session.projects._id': projectId}, {'project_session.projects.$': 1, 'project_session.defProject' : 1})
        .exec()
        .then(function(projectObject){
            if(!projectObject){
                return Promise.reject(appError.expectionList.NOT_FOUND);
            }
            return projectObject.project_session;
        })
};

AccountFactory.prototype.getSessionById =  function(accountId, projectId, sessionId){
    return accountSchema.findOne({_id: accountId, 'project_session.projects': {$elemMatch:{_id: projectId, sessions : {$elemMatch : {_id: sessionId}}}}},
        {'project_session.projects.$': 1})
        .exec()
        .then(function(projectObject){
            return getMatchingObjectById(projectObject.project_session.projects[0].sessions, '_id', sessionId);
        });
};

/**
 * Get Account by email id.
 * @param email
 * @param next
 */
AccountFactory.prototype.getAccountByEmail =  function(email, next){
   userSchema.findOne({'userName' : email})
        .populate('accounts', '_id')
        .exec(next);
};


AccountFactory.prototype.getAccountInfo =  function(accountId){
    return accountSchema.findById(accountId)
        .select({_id:1, accountNo:1, entityName:1, phoneNo: 1, address1:1, address2:1, city:1, state:1, zip:1, logo:1, 'software.reportHeaderColor':1})
        .exec()
        .then(function(account){
            var newAccount =  account.toObject();
            //newAccount.id = newAccount._id;
            //delete newAccount._id;            
            var accNo = "S" +  ('00000'+(newAccount.accountNo)).slice(-5);
            delete newAccount.accountNo;
            newAccount.accNo = accNo;            
            
            newAccount.reportHeaderColor = newAccount.software.reportHeaderColor;
            delete newAccount.software;
            return newAccount;
        })
};

AccountFactory.prototype.modifyAccountInfo = function(accountId, data){
    var set = {};
    if(data.entityName){set.entityName = data.entityName;}
    if(data.phoneNo){set.phoneNo = data.phoneNo;}
    if(data.address1){set.address1 = data.address1;}
    if(data.address2){set.address2 = data.address2;}
    if(data.city){set.city = data.city;}
    if(data.state){set.state = data.state;}
    if(data.zip){set.zip = data.zip;}
    if(data.logo){set.logo = data.logo;}
    if(data.reportHeaderColor){set['software.reportHeaderColor'] = data.reportHeaderColor;}

    set.modifiedDate = Date.now();
    return  accountSchema.findByIdAndUpdate(accountId, {$set : set}).exec();

};

AccountFactory.prototype.getUserAccountByUserId =  function(accountId, userId){
    return accountSchema.findOne({_id : accountId, users: {$elemMatch: {user : userId}}}, {software:1, 'users.$': 1, entityName:1}).exec();
};



// Promise.promisifyAll(AccountFactory);
// Promise.promisifyAll(AccountFactory.prototype);

module.exports = AccountFactory;