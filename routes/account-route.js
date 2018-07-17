/**
 * Created by Nitheen on 2/4/2015.
 */
'use strict';

//Authentication controller
var authController      = require('../authentication/auth-service');
//Rest API
var restErr             = require('restify');
//Application constant
var constant 			= require('../general/application-constant');
//Account Factory
var accountFactory      = require('../interface_impl/account-factory');
//Account Manager
var accountManager      = require('../business-logic/account-manager');
//Package Json
var packageJson             = require('../package.json');
//Pressure Factory
var pressurePointFactory      = require('../interface_impl/pressure-point-factory');

module.exports = function(app)
{
    //Initialize the account manager by passing the factory.
    var AccountManager =  accountManager(new accountFactory(), new pressurePointFactory());
    var basePath = packageJson.stepscan.appBasePath;

    /**
     * [Register new account. Require Stepscan admin permission]
     * @param  {[type]} req                                                [description]
     * @param  {[type]} res                                                [description]
     * @param  {[type]} next){}                                            [description]
     * @return {[type]}                                                    [description]
     */
/*    app.post({path: basePath +'register', authController.isAuthenticated, function(req, res, next){
        authController.verifyPermission(req.user, constant.permission_stepscan, function(err){
            if(err) {return next(new restErr.InternalError(err.message));}
            res.send('ok');
            next();
        });
    });*/
         
    app.post({path: basePath + 'register', version: '1.0.0'}, function(req, res, next){
        AccountManager.addAccount(req.body)
            .then(function(msg){                
                res.send(msg);
                return next();
            }, function(error){
                return next(new  restErr.InternalError(error));
            });
    });

    /**
     * [Login and get the token]
     * @param  {[type]} req                                      [description]
     * @param  {[type]} res                                      [description]
     * @param  {[type]} next){}                                  [description]
     * @return {[type]}                                          [description]
     */
    app.post({path: basePath +'login', version: '1.0.0'}, authController.Login, function(req, res, next){
        res.send(req.user);
        next();
    });

    /**
     * Get Software and user permissions
     */
    app.get({path: basePath +'softwarePermissions', version: '1.0.0'},authController.isAuthenticated, function(req, res, next){        
        AccountManager.getSoftwareSettings(req.user)
            .then(function(permission){
                res.send(permission);
                return next();
            },function(error){
                return next(new restErr.InternalError(JSON.stringify(error)));
            });
    });

    app.post({path: basePath +'project',version: '1.0.0'}, authController.isAuthenticated, function(req, res, next){
        AccountManager.addProject(req.user, req.body)
            .then(function(result){
                res.send(result);
                return next();
            },function(error){
                return next(new restErr.InternalError(JSON.stringify(error)));
            });
    });

    app.put({path: basePath +'project', version: '1.0.0'}, authController.isAuthenticated, function(req, res, next){
        AccountManager.modifyProject(req.user, req.body)
            .then(function(result){
                res.send(result);
                return next();
            },function(error){
                console.log(error);
                return next(new restErr.InternalError(JSON.stringify(error)));
            });
    });

    app.del({path: basePath + 'project/:projectId',version: '1.0.0'}, authController.isAuthenticated, function(req, res, next){
        AccountManager.deleteProject(req.user, req.params.projectId)
            .then(function(result){
                res.send(result);
                return next();
            },function(error){
                console.log(error);
                return next(new restErr.InternalError(JSON.stringify(error)));
            });
    });

    app.post({path: basePath +'session',version: '1.0.0'}, authController.isAuthenticated, function(req, res, next){
        AccountManager.addSession(req.user, req.body)
            .then(function(result){
                res.send(result);
                return next();
            },function(error){
                return next(new restErr.InternalError(JSON.stringify(error)));
            });
    });

    app.put({path: basePath +'session',version: '1.0.0'}, authController.isAuthenticated, function(req, res, next){
        AccountManager.modifySession(req.user, req.body)
            .then(function(result){
                res.send(result);
                return next();
            },function(error){
                return next(new restErr.InternalError(JSON.stringify(error)));
            });
    });

    app.del({path: basePath +'session/:projectId/:sessionId',version: '1.0.0'},authController.isAuthenticated, function(req, res, next){
        AccountManager.deleteSession(req.user, req.params.projectId, req.params.sessionId)
            .then(function(result){
                res.send(result);
                return next();
            },function(error){
                console.log(error);
                return next(new restErr.InternalError(JSON.stringify(error)));
            });
    });

    app.get({path: basePath +'projectsessions', version: '1.0.0'},authController.isAuthenticated, function(req, res, next){
        AccountManager.getAllProjectSession(req.user)
            .then(function(result){
                res.send(result);
                return next();
            },function(error){
                return next(new restErr.InternalError(JSON.stringify(error)));
            });
    });

    app.get(basePath + 'roles', function(req, res, next){        
        res.send(constant.ROLE_TYPES.rolesList);
        return next();
    });
    
    app.get(basePath + 'ethnicity', function(req, res, next){        
        res.send(constant.ethnicity);
        return next();
    });    

    app.get(basePath +'permissions', authController.isAuthenticated, function(req, res, next){
        var permissions;
        
        if(req.user.payPerUse){
            permissions = constant.PERMISSIONS.permissionListInvoice
        }else{
             permissions = constant.PERMISSIONS.permissionList
        }
        
        res.send(permissions);
        return next();
    });

    app.post({path: basePath +'user', version: '1.0.0'},authController.isAuthenticated, function(req, res, next){
        AccountManager.addUser(req.user, req.body)
            .then(function(result){
                res.send(result);
                return next();
            },function(error){
                return next(new restErr.InternalError(JSON.stringify(error)));
            });
    });

    app.put({path: basePath +'user/:userId', version: '1.0.0'},authController.isAuthenticated, function(req, res, next){
        AccountManager.modifyUser(req.user, req.params.userId, req.body)
            .then(function(result){
                res.send(result);
                return next();
            },function(error){
                return next(new restErr.InternalError(JSON.stringify(error)));
            });
    });

    app.put({path: basePath +'user/status/:userId/:status', version: '1.0.0'},authController.isAuthenticated, function(req, res, next){
        AccountManager.setUserStatus(req.user, req.params.userId, req.params.status)
            .then(function(result){
                res.send(result);
                return next();
            },function(error){
                return next(new restErr.InternalError(JSON.stringify(error)));
            });
    });

    app.put({path: basePath +'user/permission/:userId', version: '1.0.0'},authController.isAuthenticated, function(req, res, next){
        AccountManager.updateUserPermission(req.user, req.params.userId, req.body)
            .then(function(result){
                res.send(result);
                return next();
            },function(error){
                return next(new restErr.InternalError(JSON.stringify(error)));
            });
    });

    app.del({path: basePath +'user/:userId',version: '1.0.0'}, authController.isAuthenticated, function(req, res, next){
        AccountManager.deleteUser(req.user, req.params.userId)
            .then(function(result){
                res.send(result);
                return next();
            },function(error){
                return next(new restErr.InternalError(JSON.stringify(error)));
            });
    });

    app.get({path: basePath +'users',version: '1.0.0'}, authController.isAuthenticated, function(req, res, next){
        AccountManager.getAllUsers(req.user)
            .then(function(result){
                res.send(result);
                return next();
            },function(error){
                return next(new restErr.InternalError(JSON.stringify(error)));
            });
    });

    app.put({path: basePath +'point',version: '1.0.0'}, authController.isAuthenticated, function(req, res, next){
        AccountManager.newPressurePoint(req.user, req.body)
            .then(function(result){
                res.send(result);
                return next();
            },function(error){
                return next(new restErr.InternalError(JSON.stringify(error)));
            });
    });

    app.get({path: basePath +'points',version: '1.0.0'}, authController.isAuthenticated, function(req, res, next){
        AccountManager.getAllPressurePoints(req.user)
            .then(function(results){
                res.send(results);
                return next();
            },function(error){
                return next(new restErr.InternalError(JSON.stringify(error)));
            });
    });

    app.del({path: basePath +'point/:pointId',version: '1.0.0'}, authController.isAuthenticated, function(req, res, next){
        AccountManager.deletePressurePoint(req.user, req.params.pointId)
            .then(function(result){
                res.send(result);
                return next();
            },function(error){
                return next(new restErr.InternalError(JSON.stringify(error)));
            });
    });

    app.get({path: basePath +'account',version: '1.0.0'}, authController.isAuthenticated, function(req, res, next){
        AccountManager.getAccountInfo(req.user)
            .then(function(results){
                res.send(results);
                return next();
            },function(error){
                return next(new restErr.InternalError(JSON.stringify(error)));
            });
    });

    app.put({path: basePath +'account/:accountId',version: '1.0.0'}, authController.isAuthenticated, function(req, res, next){
        AccountManager.updateAccountInfo(req.user, req.params.accountId, req.body)
            .then(function(results){
                res.send(results);
                return next();
            },function(error){
                return next(new restErr.InternalError(JSON.stringify(error)));
            });
    });

};