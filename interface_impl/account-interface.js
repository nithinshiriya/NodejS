/**
 * Created by Nitheen on 2/24/2015.
 */
'use strict';

var AccountInterface = {
    addAccount: function(account){},
    addUser: function(accountId, user){},
    modifyUser: function(userid, userData){},
    deleteUser : function(accountId, userId) {},
    addAccountToUser: function (accountId, userId, next){},
    getAccountByEmail: function(email,next){},
    getUserAccountByUserId:  function(accountId, userId){},
    addProject: function(accountId, userId, name, description) {},
    modifyProjectName: function(accountId, userId, projectId, name, description) {},
    setDefaultProject: function(accountId, userId, projectId, status) {},
    deleteProject:  function(accountId, userId, projectId){},
    addSession: function(accountId, userId, projectId, name, description) {},
    modifySessionName: function(accountId, userId, projectId, sessionId, name, description) {},
    setDefaultSession: function(accountId, userId, projectId, sessionId, status) {},
    deleteSession : function(accountId, userId, projectId, sessionId){},
    getAllProjectSession: function(accountId) {},
    getProjectById: function(accountId, projectId){},
    getSessionById: function(accountId, projectId, sessionId){},
    getAllUsers: function(accountId){},
    UpdateUserAccountPermissions : function(accountId, userId, permissions){},
    setUserStatus: function(accountId, userId, status ){}
};

exports.IAccount = AccountInterface;