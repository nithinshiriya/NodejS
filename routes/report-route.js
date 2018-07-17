/**
 * Created by Nitheen on 4/1/2015.
 */
//Authentication controller
var authController      = require('../authentication/auth-service');
//Rest API
var restErr             = require('restify').errors;
//Application constant
var constant 			= require('../general/application-constant');
//Account Factory
var accountFactory      = require('../interface_impl/account-factory');
//Report Factory
var reportFactory      = require('../interface_impl/report-factory');
//Report Manager
var reportManager      = require('../business-logic/report-manager');
//Package Json
var packageJson             = require('../package.json');

module.exports = function(app) {
    //Initialize the Report manager by passing the factory.
    var ReportManager =  reportManager(new accountFactory(), new reportFactory());
    var basePath = packageJson.stepscan.appBasePath;

    app.get({path: basePath + 'report/:key',version: '1.0.0'}, authController.isAuthenticated, function(req, res, next){
        ReportManager.getReportByKey(req.user, req.params.key)
            .then(function(report){
                res.send(report);
                return next();
            }, function(error){
                return next(new restErr.InternalError(JSON.stringify(error)));
            });
    });
};