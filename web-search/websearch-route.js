/**
 * Created by Nitheen on 1/13/2016.
 */

//Websearch Router
var restErr             = require('restify').errors;
    searchFactory       = require('./websearch-factory'),    
    authController      = require('./authentication');    

module.exports = function(app, basePathOriginal, dbConnection) {
    var basePath = basePathOriginal + 'search/';
    var SearchFactory = new searchFactory(dbConnection);

    app.post({path: basePathOriginal + 'login', version: '1.0.0'}, authController.Login, function(req, res, next){                    
        res.send(req.user);
        next();
    });

    app.post({path: basePathOriginal + 'user', version: '1.0.0', role: 'admin'}, authController.isRoleAuthenticated, function(req, res, next){                            
        SearchFactory.addUser(req.body, 'user')
            .then(results =>{                    
                res.send(results);
                return next();
            }, (error) => {
                return next(new restErr.InternalError(JSON.stringify(error)));
            });            
    });    

    app.get({path: basePathOriginal + 'user', version: '1.0.0', role: 'admin'}, authController.isRoleAuthenticated, function(req, res, next){                                            
        SearchFactory.getUser()
            .then(results =>{                        
                res.send(results);
                return next();
            }, (error) => {
                return next(new restErr.InternalError(JSON.stringify(error)));
            });            
    });   

 

    app.post({path: basePathOriginal + 'user/:id', version: '1.0.0', role: 'admin'}, authController.isRoleAuthenticated, function(req, res, next){                            
        SearchFactory.edituser(req.params.id, req.body)
            .then(results =>{                        
                res.send("Ok");
                return next();
            }, (error) => {
                return next(new restErr.InternalError(JSON.stringify(error)));
            });            
    });   

    app.post({path: basePathOriginal + 'user/activate/:id', version: '1.0.0', role: 'admin'}, authController.isRoleAuthenticated, function(req, res, next){                    
        SearchFactory.actiavte(req.params.id, true)
            .then(results =>{                        
                res.send("Ok");
                return next();
            }, (error) => {
                return next(new restErr.InternalError(JSON.stringify(error)));
            });                    
    }); 

    app.post({path: basePathOriginal + 'user/deactivate/:id', version: '1.0.0', role: 'admin'}, authController.isRoleAuthenticated, function(req, res, next){                    
        SearchFactory.actiavte(req.params.id, false)
            .then(results =>{                        
                res.send("Ok");
                return next();
            }, (error) => {
                return next(new restErr.InternalError(JSON.stringify(error)));
            });            
    });  


    app.post({path: basePathOriginal + 'user/password/:id/:password', version: '1.0.0', role: 'admin'}, authController.isRoleAuthenticated, function(req, res, next){                    
        SearchFactory.changePassowrd(req.params.id, req.params.password)
            .then(results =>{                        
                res.send("Ok");
                return next();
            }, (error) => {
                return next(new restErr.InternalError(JSON.stringify(error)));
            });            
    });               

    app.post({path: basePath + 'advance', version: '1.0.0'}, authController.isAuthenticated, function(req, res, next){                    
        SearchFactory.advanceSearch(req.body)
            .then((results) => {     
                res.send(results);
                return next();
            }, (error) => {
                return next(new restErr.InternalError(JSON.stringify(error)));
            });
    });

    app.get({path: basePath + 'icd/name/:searchText', version: '1.0.0'}, authController.isAuthenticated, function(req, res, next){
        SearchFactory.ICDNameSearch(req.params.searchText)
            .then((results) => {
                res.send(results);
                return next();
            }, (error) => {
                return next(new restErr.InternalError(JSON.stringify(error)));
            });
    });  
    app.get({path: basePath + 'icd/code/:searchText', version: '1.0.0'}, authController.isAuthenticated, function(req, res, next){
        SearchFactory.ICDCodeSearch(req.params.searchText)
            .then((results) => {
                res.send(results);
                return next();
            }, (error) => {
                return next(new restErr.InternalError(JSON.stringify(error)));
            });
    });
    app.get({path: basePath + 'accounts/:searchText', version: '1.0.0'}, authController.isAuthenticated, function(req, res, next){        
        SearchFactory.accountSearch(req.params.searchText)
            .then((results) => {                
                res.send(results);
                return next();
            }, (error) => {
                return next(new restErr.InternalError(JSON.stringify(error)));
            });
    });
    app.get({path: basePath + 'specification/name/:key/:searchText', version: '1.0.0'}, authController.isAuthenticated, function(req, res, next){
        SearchFactory.specificationByName(req.params.key, req.params.searchText)
            .then((results) => {
                res.send(results);
                return next();
            }, (error) => {
                return next(new restErr.InternalError(JSON.stringify(error)));
            });
    });      
    app.get({path: basePath + 'specification/code/:key/:searchText', version: '1.0.0'}, authController.isAuthenticated, function(req, res, next){
        SearchFactory.specificationByCode(req.params.key, req.params.searchText)
            .then((results) => {
                res.send(results);
                return next();
            }, (error) => {
                return next(new restErr.InternalError(JSON.stringify(error)));
            });
    });    
    app.post({path: basePathOriginal + 'samples/download', version: '1.0.0'}, authController.isAuthenticated, function(req, res, next){                
        SearchFactory.downloadSampleFiles(req.body, res)
            .then((results) => {                     
                return next();
            }, (error) => {
                return next(new restErr.InternalError(JSON.stringify(error)));
            });
    });

    app.get({path: basePathOriginal + 'report/:reportId/:reportKey', version: '1.0.0'}, authController.isAuthenticated, function(req, res, next){                
        SearchFactory.getReport(req.params.reportId, req.params.reportKey, res)
            .then((results) => {                     
                return next();
            }, (error) => {
                console.log(error);
                return next(new restErr.InternalError(error));
            });
    });    

    app.post({path: basePathOriginal + 'samples/delete', version: '1.0.0', role: 'admin'}, authController.isAuthenticated, function(req, res, next){                     
        SearchFactory.deleteSampleFiles(req.body)
            .then((results) => { 
                res.send(results);
                return next();
            }, (error) => {
                return next(new restErr.InternalError(JSON.stringify(error)));
            });
    });
          
};