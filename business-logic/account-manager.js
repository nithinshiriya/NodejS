/**
 * Created by Nitheen on 2/9/2015.
 */
'use strict';
var appError                = require('../general/application-logger');
var constant                = require('../general/application-constant');
//Package Json
var packageJson             = require('../package.json');
var fs                          = require("fs");

module.exports = function(accountFactory, PressureFactory) {
    var AccountFactory = accountFactory;
    
    function getModuleCalCulation(){
        var filePath = packageJson.stepscan.moduleCalculation;
        var content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content)
    }

    return {
        /**
         * Get Account id by email.
         * @param email
         * @param next
         */
        getAccountId: function(email, next){
            AccountFactory.getAccountByEmail(email, function (err, user) {
                return err ? next(err) : next(null, user.accounts[0]._id);
            });
        },

        /**
         * Get Account and user id by email.
         * @param email
         * @param next
         */
        getAccountAndUserId: function(email, next){
            AccountFactory.getAccountByEmail(email, function (err, user) {
                return err ? next(err) : next(null, {id: user.accounts[0]._id, userId: user._id});
            });
        },

        /**
         * Adding New Account
         * @param account
         * @returns Promise
         */
        addAccount: function(account) {
            if(!account) {
                return Promise.reject(appError.expectionList.NULL_PARAMETER);
            }
            
            return AccountFactory.addAccount(account)                                    
                .then(function(){                                  
                    return Promise.resolve(constant.ok);
                }, function(error){
                    return Promise.reject(appError.formatError(error));
                })           
        },

        /**
         * Adding new user to the Account
         * @param userAccount
         * @param user
         * @param next
         */
        addUser: function(userAccount, user, next) {
            if (!user) {
                return next(appError.getError(appError.expectionList.NULL_PARAMETER));
            }
            return AccountFactory.addUser(userAccount.id, user)
                .then(function(user){
                    return user._id;
                }, function(error){
                    return Promise.reject(appError.formatError(error));
                });
        },

        modifyUser: function(userAccount, userId, userData){
            return AccountFactory.modifyUser(userId, userData)
                .then(function(){
                    return constant.ok;
                }, function(error){
                    return Promise.reject(appError.formatError(error));
                });
        },

        deleteUser: function(user, userId){
            return AccountFactory.deleteUser(user.id, userId)
                .then(function(){
                    return constant.ok;
                }, function(error){
                    return Promise.reject(appError.formatError(error));
                })
        },

        setUserStatus: function(user, userId, status){
            var bStatus = (status.toLowerCase() == "true" );
            return AccountFactory.setUserStatus(user.id, userId, bStatus)
                .then(function(){
                    return constant.ok;
                }, function(error){
                    return Promise.reject(appError.formatError(error));
                })
        },

        updateUserPermission : function(user, userId, permission){
            if(!permission.permissions){
                return Promise.reject(appError.getError(appError.expectionList.NULL_PARAMETER));
            }
            return AccountFactory.UpdateUserAccountPermissions(user.id, userId, permission.permissions)
                .then(function(){
                    return constant.ok;
                }, function(error){
                    return Promise.reject(appError.formatError(error));
                })
        },

        getAllUsers: function(user){
            return AccountFactory.getAllUsers(user.id)
                .then(function(users){
                    return users;
                }, function(error){
                    return Promise.reject(appError.formatError(error));
                })
        },

        /**
         * Get Software permissions and user privileges
         * @param user
         */
        getSoftwareSettings: function(user){
            return AccountFactory.getUserAccountByUserId(user.id, user.userId)
                .then(function(account){
                    if(account === null) {return Promise.reject(appError.expectionList.ACCOUNT_NOT_FOUND);}
                    return Promise.resolve({
                        software: account.software,
                        permissions: account.users[0].permissions,
                        entityName : account.entityName,
                        automatedTestList: constant.automatedTestList,
                        moduleCal: getModuleCalCulation()
                    });
                }, function(error){
                    return Promise.reject(appError.formatError(error));
                });
        },

        /**
         * Adding new project to the account
         * @param user
         * @param params
         * @returns {*}
         */
        addProject: function(user, params){
            if(!params) {return Promise.reject(appError.expectionList.NULL_PARAMETER);}
            var name =  params.name;
            var description =  params.description;
            var isDefault = params.isDefault;

            return AccountFactory.addProject(user.id, user.userId, name, description)
                .then(function(projectId){
                    if(isDefault === true){
                        return AccountFactory.setDefaultProject(user.id, user.userId, projectId, true)
                            .then(function(){
                                return projectId;
                            })
                    }
                    return projectId;
                }, function(error){
                    return Promise.reject(appError.formatError(error));
                });
        },

        /**
         * Modify existing project
         * @param user
         * @param params
         * @returns {*}
         */
        modifyProject: function(user, params){
            if(!params) {return Promise.reject(appError.expectionList.NULL_PARAMETER);}
            var name =  params.name;
            var description =  params.description;
            var pId = params._id;
            var isDefault = params.isDefault;

            return AccountFactory.modifyProjectName(user.id, user.userId, pId, name, description)
                .then(function() {
                    return AccountFactory.setDefaultProject(user.id, user.userId, pId, isDefault)
                        .then(function () {
                            return Promise.resolve(constant.ok);
                        })
                }, function(error){
                    return Promise.reject(appError.formatError(error));
                });
        },

        deleteProject: function(user, projectid){
            return AccountFactory.deleteProject(user.id, user.userId, projectid)
                .then(function(){
                    return constant.ok;
                }, function(error){
                    return Promise.reject(appError.formatError(error));
                })
        },

        /**
         * Adding new session to the existing project
         * @param user
         * @param params
         * @returns {*}
         */
        addSession: function(user, params){
            if(!params) {return Promise.reject(appError.expectionList.NULL_PARAMETER);}
            var name =  params.name;
            var description =  params.description;
            var pId = params.projectId;
            var isDefault = params.isDefault;

            return AccountFactory.addSession(user.id, user.userId, pId, name, description)
                .then(function(sessionId){
                    if(isDefault === true){
                        return AccountFactory.setDefaultSession(user.id, user.userId, pId, sessionId, true)
                            .then(function(){
                                return sessionId;
                            })
                    }
                    return sessionId;
                }, function(error){
                    return Promise.reject(appError.formatError(error));
                });
        },

        /**
         * Modify existing session name
         * @param user
         * @param params
         * @returns {*}
         */
        modifySession: function(user, params){
            if(!params) {return Promise.reject(appError.expectionList.NULL_PARAMETER);}
            var sId = params._id;
            var name =  params.name;
            var description =  params.description;
            var pId = params.projectId;
            var isDefault = params.isDefault;

            return AccountFactory.modifySessionName(user.id, user.userId, pId, sId, name , description)
                .then(function(){
                    return AccountFactory.setDefaultSession(user.id, user.userId, pId, sId, isDefault)
                        .then(function(){
                            return Promise.resolve(constant.ok);
                        })
                }, function(error){
                    return Promise.reject(appError.formatError(error));
                });
        },

        deleteSession: function(user, projectid, sessionId){
            return AccountFactory.deleteSession(user.id, user.userId, projectid, sessionId)
                .then(function(){
                    return constant.ok;
                }, function(error){
                    return Promise.reject(appError.formatError(error));
                })
        },

        /**
         * Get All project and session for the account id
         * @param user
         * @returns {*}
         */
        getAllProjectSession: function(user){
            return AccountFactory.getAllProjectSession(user.id)
                .then(function(object){
                    return object;
                }, function(error){
                    return Promise.reject(appError.formatError(error));
                });
        },

        newPressurePoint: function(user, point){
            return PressureFactory.addPoint(user.id, user.userId, point)
                .then(function(newPoint){
                    return newPoint._id;
                }, function(error){
                    return Promise.reject(appError.formatError(error));
                });
        },

        getAllPressurePoints: function(user){
            return PressureFactory.getPoints(user.id)
                .then(function(points){
                    return points;
                }, function(error){
                    return Promise.reject(appError.formatError(error));
                });
        },

        deletePressurePoint: function(user, pointId){
            return PressureFactory.deletePoint(user.id, pointId)
                .then(function(){
                    return constant.ok;
                }, function(error){
                    return Promise.reject(appError.formatError(error));
                });
        },

        getAccountInfo: function(user){
            return AccountFactory.getAccountInfo(user.id)
                .then(function(object){                    
                    return object;
                }, function(error){
                    return Promise.reject(appError.formatError(error));
                });
        },

        updateAccountInfo: function(user, accountId, data){
            if(user.id !== accountId){
                return Promise.reject(appError.expectionList.ACCOUNT_NOT_FOUND);
            }

            return AccountFactory.modifyAccountInfo(user.id, data)
                .then(function(){
                    return constant.ok;
                }, function(error){
                    return Promise.reject(appError.formatError(error));
                });
        }

    }
};
