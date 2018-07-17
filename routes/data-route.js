/**
 * Created by Nitheen on 2/4/2015.
 */
'use strict';

//Authentication controller
var authController      = require('../authentication/auth-service');
//Rest API
var restErr             = require('restify').errors;
//Application constant
var constant 			= require('../general/application-constant');

module.exports = function(app)
{

    /**
     * [Add new patient information]
     * @param  {[type]} req                                                [description]
     * @param  {[type]} res                                                [description]
     * @param  {[type]} next){}											   [description]
     * @return {[type]}                                                    [description]
     */
    app.post('patient', authController.isAuthenticated, function(req, res, next){
        authController.verifyPermission(req.user, constant.permission_stepscan, function(err){
            if(err) {return next(new restErr.InternalError(err.message));}
            res.send('patient-> post ok');
            next();
        });
    });

    /**
     * [Edit patient information]
     * @param  {[type]} req                                                [description]
     * @param  {[type]} res                                                [description]
     * @param  {[type]} next){} 										   [description]
     * @return {[type]}                                                    [description]
     */
    app.put('patient', authController.isAuthenticated, function(req, res, next){
        authController.verifyPermission(req.user, constant.permission_stepscan, function(err){
            if(err) {return next(new restErr.InternalError(err.message));}
            res.send('patient:ID-> put ok');
            next();
        });
    });

    /**
     * [Get Patient information by ID]
     * @param  {[type]} req                                                [description]
     * @param  {[type]} res                                                [description]
     * @param  {[type]} next){}											   [description]
     * @return {[type]}                                                    [description]
     */
    app.get('patient', authController.isAuthenticated, function(req, res, next){
        authController.verifyPermission(req.user, constant.permission_stepscan, function(err){
            if(err) {return next(new restErr.InternalError(err.message));}
            res.send('patient:ID-> put ok');
            next();
        });
    });

    /**
     * [description]
     * @param  {[type]} req                                                [description]
     * @param  {[type]} res                                                [description]
     * @param  {[type]} next){}											   [description]
     * @return {[type]}                                                    [description]
     */
    app.get('searchPatient', authController.isAuthenticated, function(req, res, next){
        authController.verifyPermission(req.user, constant.permission_stepscan, function(err){
            if(err) {return next(new restErr.InternalError(err.message));}
            res.send('patient:ID-> put ok');
            next();
        });
    });

    /**
     * [Add new project]
     * @param  {[type]} req                                                [description]
     * @param  {[type]} res                                                [description]
     * @param  {[type]} next){}											   [description]
     * @return {[type]}                                                    [description]
     */
    app.post('project', authController.isAuthenticated, function(req, res, next){
        authController.verifyPermission(req.user, constant.permission_stepscan, function(err){
            if(err) {return next(new restErr.InternalError(err.message));}
            res.send('patient-> post ok');
            next();
        });
    });

    /**
     * [Edit Project]
     * @param  {[type]} req                                                [description]
     * @param  {[type]} res                                                [description]
     * @param  {[type]} next){}											   [description]
     * @return {[type]}                                                    [description]
     */
    app.put('project', authController.isAuthenticated, function(req, res, next){
        authController.verifyPermission(req.user, constant.permission_stepscan, function(err){
            if(err) {return next(new restErr.InternalError(err.message));}
            res.send('patient-> post ok');
            next();
        });
    });
};