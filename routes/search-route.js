/**
 * Created by Nitheen on 5/14/2015.
 */

'use strict';
//Authentication controller
var authController      = require('../authentication/auth-service');
//patient Factory
var patientFactory      = require('../interface_impl/patient-factory');
//Sample Factory
var sampleFactory      = require('../interface_impl/sample-factory');
//Sample Manager
var searchManager      = require('../business-logic/search-manager');
//Rest API
var restErr             = require('restify').errors;

module.exports = function(app, basePath) {

    basePath = basePath + 'search/';

    var SearchManager = searchManager(new sampleFactory(null), new patientFactory());

    app.get({path: basePath + 'projectsession/:project/:session/:type', version: '1.0.0'}, authController.isAuthenticated, function(req, res, next){
        var params = req.params;
        SearchManager.project_session(req.user.id, params.project, params.session)
            .then(function(results){
                res.send(results);
                return next();
            }, function(error){
                return next(new restErr.InternalError(JSON.stringify(error)));
            });
    });

    app.get({path: basePath + 'date/:startDate/:endDate', version: '1.0.0'}, authController.isAuthenticated, function(req, res, next){
        SearchManager.byDate(req.user.id, req.params.startDate, req.params.endDate)
            .then(function(results){
                res.send(results);
                return next();
            }, function(error){
                return next(new restErr.InternalError(JSON.stringify(error)));
            })
    });

    app.get({path: basePath + 'user/:userId', version: '1.0.0'}, authController.isAuthenticated, function(req, res, next){
        SearchManager.byUser(req.user.id, req.params.userId)
            .then(function(results){
                res.send(results);
                return next();
            }, function(error){
                return next(new restErr.InternalError(JSON.stringify(error)));
            })
    });

    app.get({path: basePath + 'patient/:query', version: '1.0.0'}, authController.isAuthenticated, function(req, res, next){
        SearchManager.byPatient(req.user.id, req.params.query)
            .then(function(results){
                res.send(results);
                return next();
            }, function(error){
                return next(new restErr.InternalError(JSON.stringify(error)));
            })
    });


};