/**
 * Created by Nitheen on 4/7/2015.
 */
'use strict';

//Authentication controller
var authController          = require('../authentication/auth-service');
//Rest API
var restErr                 = require('restify').errors;
//Application constant
var constant 			    = require('../general/application-constant');
var standardFactory         = require('../interface_impl/standard-factory');
var standardManager         = require('../business-logic/standard-manager');
//Package Json
var packageJson             = require('../package.json');
var fileService             = require('../database/file-service');

module.exports = function(app, dbConnection){
    var FileService = new fileService(dbConnection.getMongoose());
    var StandardManager =  standardManager(new standardFactory(FileService));
    var basePath = packageJson.stepscan.appBasePath;

    app.get({path: basePath + 'standards', version: '1.0.0'},authController.isAuthenticated, function(req, res, next){
        StandardManager.getAllStandards(req.user)
            .then(function(standardList){                
                res.send(standardList);
                return next();
            }, function(error){
                return next(new restErr.InternalError(JSON.stringify(error)));
            });
    });

    app.get({path: basePath + 'standard/:standardId', version: '1.0.0'}, authController.isAuthenticated, function(req, res, next){
        StandardManager.getStandardById(req.user, req.params.standardId)
            .then(function(standard){
                res.send(standard);
                return next();
            }, function(error){
                return next(new restErr.InternalError(JSON.stringify(error)));
            });
    });

    app.post({path: basePath + 'standard/:reportType', version: '1.0.0'}, authController.isAuthenticated, function(req, res, next){        
        StandardManager.saveStandard(req.user, req.params.reportType, req.body)
            .then(function(id){
                res.send(id);
                return next();
            }, function(error){
                return next(new restErr.InternalError(JSON.stringify(error)));
            });
    });

    app.put({path: basePath + 'standard/:standardId', version: '1.0.0'}, authController.isAuthenticated, function(req, res, next){        
        StandardManager.editStandard(req.user, req.params.standardId, req.body)
            .then(function(msg){
                res.send(msg);
                return next();
            }, function(error){
                return next(new restErr.InternalError(JSON.stringify(error)));
            });
    });

    app.del({path: basePath + 'standard/:standardId', version: '1.0.0'}, authController.isAuthenticated, function(req, res, next){
        StandardManager.deleteStandard(req.user, req.params.standardId)
            .then(function(msg){
                res.send(msg);
                return next();
            }, function(error){
                return next(new restErr.InternalError(JSON.stringify(error)));
            });
    });

    app.get({path: basePath + 'standard/file/:normativeId', version: '1.0.0'},authController.isAuthenticated, function(req, res, next){
        StandardManager.getNormativeFile(req.user, req.params.normativeId, res)
            .then(function(){
                return next();
            }, function(error){
                return next(new restErr.InternalError(JSON.stringify(error)));
            });
    });    
};