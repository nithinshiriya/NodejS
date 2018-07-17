/**
 * Created By Nitheen Rao T On 1/16/2016
 */
'use strict';

var restErr                 = require('restify').errors,    
    authController          = require('../authentication/auth-service'),
    appError                = require('../general/application-logger'),
    constant                = require('../general/application-constant');
       
module.exports = function(app, basePath, specificationService){        
    var routeName = "specification";

    app.put({path: basePath + routeName, version: '1.0.0'},authController.isAuthenticated,function(req, res, next){
        specificationService.add(req.user.id, req.body)
            .then(function(specification){
                res.send(specification._id);
                return next();
            }, function(error){
                var err = appError.formatError(error)
                return next(new restErr.InternalError(JSON.stringify(err)));
            });
    });

    app.del({path: basePath + routeName +'/:id', version: '1.0.0'},authController.isAuthenticated,function(req, res, next){
        specificationService.delete(req.user.id, req.params.id)
            .then(function(specification){
                res.send(constant.ok);
                return next();
            }, function(error){
                var err = appError.formatError(error)
                return next(new restErr.InternalError(JSON.stringify(err)));
            });
    });

    app.get({path: basePath + routeName, version: '1.0.0'},authController.isAuthenticated,function(req, res, next){
        specificationService.get(req.params.key)
            .then(function(specifications){
                res.send(specifications);
                return next();
            }, function(error){
                var err = appError.formatError(error)
                return next(new restErr.InternalError(JSON.stringify(err)));
            });
    });        

    app.get({path: basePath + routeName + '/key/:key', version: '1.0.0'},authController.isAuthenticated,function(req, res, next){
        specificationService.getByKey(req.params.key)
            .then(function(specifications){
                res.send(specifications);
                return next();
            }, function(error){
                var err = appError.formatError(error)
                return next(new restErr.InternalError(JSON.stringify(err)));
            });
    });

    app.get({path: basePath + routeName + '/id/:id', version: '1.0.0'},authController.isAuthenticated,function(req, res, next){
        specificationService.getById(req.params.id)
            .then(function(specification){
                res.send(specification);
                return next();
            }, function(error){
                var err = appError.formatError(error)
                return next(new restErr.InternalError(JSON.stringify(err)));
            });
    });      
                    
}