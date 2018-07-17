/**
 * Created by Nitheen on 1/13/2016.
 */

//Sample Manager
var authController      = require('../authentication/auth-service'),
    restErr             = require('restify').errors;

module.exports = function(app, basePath, transManager) {
    basePath = basePath + 'transactions/';

    app.get({path: basePath + 'query/:startDate/:endDate', version: '1.0.0'}, authController.isAuthenticated, function(req, res, next){
        transManager.getTransactionList(req.user, req.params.startDate, req.params.endDate)
            .then(function(transactions){
                res.send(transactions);
                return next();
            }, function(error){
                return next(new restErr.InternalError(JSON.stringify(error)));
            });
    });

    app.get({path: basePath + ':id', version: '1.0.0'}, authController.isAuthenticated, function(req, res, next){
        transManager.getTransactionById(req.user, req.params.id)
            .then(function(transaction){
                res.send(transaction);
                return next();
            }, function(error){
                return next(new restErr.InternalError(JSON.stringify(error)));
            });
    });

    app.get({path: basePath, version: '1.0.0'}, authController.isAuthenticated, function(req, res, next){        
       var message = {};     
       
       if(req.user.payPerUse){
            message = {
                generateStat : true,
                message: "Sample will be invoiced. Are you sure to proceed?",
                payPerUse: req.user.payPerUse
            };           
       } else {
            message = {
                generateStat : false,
                message: "",
                payPerUse: req.user.payPerUse
            };         
       }

        res.send(message);
        return next();
    });
        
};