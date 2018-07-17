/**
 * Created by Nitheen on 2/26/2015.
 */
'use strict';

//Authentication controller
var authController      = require('../authentication/auth-service');
//Rest API
var restErr             = require('restify').errors;
//Application constant
var constant 			= require('../general/application-constant');
//Account Factory
var patientFactory      = require('../interface_impl/patient-factory');
//Account Manager
var patientManager      = require('../business-logic/patient-manager');
//Package Json
var packageJson             = require('../package.json');
//Account Factory
var accountFactory      = require('../interface_impl/account-factory');

module.exports = function(app)
{
    //Initialize the patient manager by passing the factory.
    var PatientManager =  patientManager(new patientFactory(), new accountFactory());
    var basePath = packageJson.stepscan.appBasePath;

    /**
     * Add new patient
     */
    app.post({path: basePath + 'patient', version: '1.0.0'},authController.isAuthenticated, function(req, res, next){
        PatientManager.addPatient(req.user, req.body)
            .then(function(patientId){
                res.send(patientId);
                return next();
            }, function(error){
                return next(new restErr.InternalError(JSON.stringify(error)));
            });
    });

    /**
     * Modify existing patient
     */
    app.put({path: basePath + 'patient', version: '1.0.0'},authController.isAuthenticated, function(req, res, next){
        PatientManager.modifyPatient(req.user, req.body)
            .then(function(patient){
                res.send(patient);
                return next();
            },function(error){
                return next(new restErr.InternalError(JSON.stringify(error)));
            });
    });

    /**
     * Update the patient visit
     */
    app.put({path: basePath + 'patientvisit', version: '1.0.0'},authController.isAuthenticated, function(req, res, next){
        PatientManager.updateVisit(req.user, req.body)
            .then(function(message){                
                res.send(message);
                return next();
            },function(error){
                return next(new restErr.InternalError(JSON.stringify(error)));
            });
    });

    /**
     * Get All patient
     */
    app.get({path: basePath + 'patients', version: '1.0.0'}, authController.isAuthenticated, function(req, res, next){
        PatientManager.getAllPatient(req.user.id)
            .then(function(patients){
                res.send(patients);
                return next();
            }, function(error){
                return next(new restErr.InternalError(JSON.stringify(error)));
            });
    });


    app.del({path: basePath + 'patient/:patientId', version: '1.0.0'},authController.isAuthenticated, function(req, res, next){
        PatientManager.deletePatient(req.user, req.params.patientId)
            .then(function(msg){
                res.send(msg);
                return next();
            }, function(error){
                return next(new restErr.InternalError(JSON.stringify(error)));
            });
    });
       
    /**
     * Get Patient by id
     */
    app.get({path: basePath + 'patient/:patientId', version: '1.0.0'},authController.isAuthenticated, function(req, res, next){
        console.log(req.params.patientId);
        res.send(req.params.patientId);
        next();
/*        PatientManager.getPatientByPatientId(req.params.patientId, function(err, patient){
            if(err) {return next(new restErr.InternalError(err.message));}
            res.send(patient);
            next();
        });*/
    });

};