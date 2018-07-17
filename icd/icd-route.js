/**
 * Created By Nitheen Rao T On 4/27/2016
 */

'use strict';

var restErr                 = require('restify').errors,    
    authController          = require('../authentication/auth-service'),
    appError                = require('../general/application-logger'),
    constant                = require('../general/application-constant');
       
module.exports = function(app, basePath, ICDService){        
        
    app.put({path: basePath + 'icds', version: '1.0.0'},authController.isAuthenticated,function(req, res, next){
        ICDService.add(req.user.id, req.body)
            .then(function(icd){
                res.send(icd._id);
                return next();
            }, function(error){
                var err = appError.formatError(error)
                return next(new restErr.InternalError(JSON.stringify(err)));
            });
    });

    app.del({path: basePath + 'icds/:id', version: '1.0.0'},authController.isAuthenticated,function(req, res, next){
        ICDService.deleteById(req.user.id, req.params.id)
            .then(function(icd){
                res.send(constant.ok);
                return next();
            }, function(error){
                var err = appError.formatError(error)
                return next(new restErr.InternalError(JSON.stringify(err)));
            });
    });
        
    app.get({path: basePath + 'icds', version: '1.0.0'},authController.isAuthenticated,function(req, res, next){
        ICDService.get(req.user.id)
            .then(function(icds){
                res.send(icds);
                return next();
            }, function(error){
                var err = appError.formatError(error)
                return next(new restErr.InternalError(JSON.stringify(err)));
            });
    });    
    
    
    app.get({path: basePath + 'icds/search/:search', version: '1.0.0'},authController.isAuthenticated,function(req, res, next){
        ICDService.search(req.params.search)
            .then(function(icds){
                res.send(icds);
                return next();
            }, function(error){
                var err = appError.formatError(error)
                return next(new restErr.InternalError(JSON.stringify(err)));
            });
    });    
                    
}