
/**
 * Created by Nitheen on 3/23/2015.
 */
'use strict';
//Authentication controller
var authController      = require('../authentication/auth-service');
//Rest API
var restErr             = require('restify').errors;
//Application constant
var constant 			= require('../general/application-constant');
//patient Factory
var accountFactory      = require('../interface_impl/account-factory');
//patient Factory
var patientFactory      = require('../interface_impl/patient-factory');
//Sample Factory
var sampleFactory      = require('../interface_impl/sample-factory');
//Account Factory
var sampleManager      = require('../business-logic/sample-manager');
//Package Json
var packageJson        = require('../package.json');
//Logger
var logger             =  require("../general/application-logger");

module.exports = function(app, dbConnection, transactionClass, ICDService) {
    var SampleManager;
    var basePath = packageJson.stepscan.appBasePath;
    init();
    
    function directioryExist(path) {
        try{
            var fs = require('fs');         
            var stat = fs.statSync(path);                   
            return true;
        }catch(ex){
            logger.logError(ex, "directioryExist");
            return false;
        }
    }    
    
    function init() {
        var FileService;
        var fileStorage = packageJson.stepscan.fileStorage.toLowerCase();
        try{
             switch (fileStorage){
                 case "database":
                    var fileService  = require('../database/file-service');
                    FileService = new fileService(dbConnection.getMongoose());
                    break;
                 default:        
                    if(directioryExist(fileStorage)){
                        var fileTableService  = require('../storage/file-service');
                        FileService = new fileTableService(fileStorage);                               
                    }else{
                        logger.logError("File storage type not found", "Sample Route");
                        return;                         
                    }                                                       
             }                                        
             
             if(FileService){
                 SampleManager =  sampleManager(new sampleFactory(FileService), new patientFactory(), new accountFactory(), transactionClass, ICDService);
                 return;
             }             
             logger.logError("File storage type not found", "Sample Route");                                       
        } catch(err){
            logger.logError(err, "Sample Route");
        }
    }

    /**
     * Adding new Sample
     */
    app.post({path: basePath + 'sample', version: '1.0.0'}, authController.isAuthenticated, function(req, res, next){
        SampleManager.addSample(req.user, req.body)
            .then(function(sampleId){
                res.send(sampleId);
                return next();
            }, function(error){
                return next(new restErr.InternalError(JSON.stringify(error)));
            });
    });

    /**
     * Sample Copying as new Sample with Versioning
     */
    app.post({path: basePath + 'sample/copy/:sampleId/:desc', version: '1.0.0'}, authController.isAuthenticated, function(req, res, next){        
        SampleManager.copySample(req.user, req.params.sampleId,  req.params.desc, req.files)
            .then(function(fileId){                
                res.send(fileId);                
                return next();
            }, function(error){
                return next(new restErr.InternalError(JSON.stringify(error)));
            });
    });    

    /**
     * Sample Version update
     */
    app.post({path: basePath + 'sample/version/:sampleId/:desc', version: '1.0.0'}, authController.isAuthenticated, function(req, res, next){        
        SampleManager.updateVersion(req.user, req.params.sampleId, req.params.desc,  req.body)
            .then(function(fileId){                
                res.send(fileId);                
                return next();
            }, function(error){
                return next(new restErr.InternalError(JSON.stringify(error)));
            });
    });

    app.post({path: basePath + 'sample/file/:sampleId/:recordType/:hasReport', version: '1.0.0'}, authController.isAuthenticated, function(req, res, next){
        SampleManager.addSampleFile(req.user, req.params.sampleId, req.params.recordType, req.params.hasReport, req.files, false, "Source")
            .then(function(fileId){
                res.send(fileId);
                return next();
            }, function(error){
                return next(new restErr.InternalError(JSON.stringify(error)));
            });
    });

    app.post({path: basePath + 'sample/camera/:sampleId/:recordType', version: '1.0.0'}, authController.isAuthenticated, function(req, res, next){                
        if(req.files){
            if(!req.user.allowCamera){
                 return next(new restErr.InternalError("Uploading camera file is not allowed."));    
            }
            
            SampleManager.addCameraFile(req.user, req.params.sampleId,  req.params.recordType, req.files)
                .then(function(fileId){
                    res.send(fileId);
                    return next();
                }, function(error){
                    return next(new restErr.InternalError(JSON.stringify(error)));
                });              
        }else{
            SampleManager.setCameraFile(req.user, req.params.sampleId, req.params.recordType)
                .then(function(fileId){
                    res.send(fileId);
                    return next();
                }, function(error){
                    return next(new restErr.InternalError(JSON.stringify(error)));
                });    
        }
                             
    });

    app.post({path: basePath + 'sample/report/:sampleId/:reportKey/:reportType/:reportDescription', version: '1.0.0'}, authController.isAuthenticated, function(req, res, next){
        SampleManager.addReportFile(req.user, req.files, req.params.sampleId, req.params.reportKey, req.params.reportType, req.params.reportDescription)
            .then(function(fileId){
                console.log(fileId);
                res.send(fileId);
                return next();
            }, function(error){
                return next(new restErr.InternalError(JSON.stringify(error)));
            });
    });    

    /**
     * Get All samples
     */
    app.get({path: basePath + 'samples', version: '1.0.0'},authController.isAuthenticated, function(req, res, next){        
        SampleManager.getAllSample(req.user)
            .then(function(samples){
                res.send(samples);
                return next();
            }, function(error){
                return next(new restErr.InternalError(JSON.stringify(error)));
            });
    });

    /**
     * Get All samples
     */
    app.get({path: basePath + 'samples/:sampleId', version: '1.0.0'},authController.isAuthenticated, function(req, res, next){
        SampleManager.getSampleInfo(req.user, req.params.sampleId)
            .then(function(samples){
                res.send(samples);
                return next();
            }, function(error){
                return next(new restErr.InternalError(JSON.stringify(error)));
            });
    });

    /**
     * Get All samples
     */
    app.get({path: basePath + 'samplefile/:sampleId', version: '1.0.0'},authController.isAuthenticated, function(req, res, next){
        SampleManager.getSampleFile(req.user, req.params.sampleId, 'tile', res)
            .then(function(){
                return next();
            }, function(error){
                return next(new restErr.InternalError(JSON.stringify(error)));
            });
    });

    app.get({path: basePath + 'sample/file/:sampleId/:fileId/:type', version: '1.0.0'},authController.isAuthenticated, function(req, res, next){
        SampleManager.getSampleFile(req.user, req.params.sampleId, req.params.fileId, req.params.type, res)
            .then(function(){
                return next();
            }, function(error){
                return next(new restErr.InternalError(JSON.stringify(error)));
            });
    });

    app.get({path: basePath + 'patientsamples/:patientId', version: '1.0.0'},authController.isAuthenticated, function(req, res, next){        
        SampleManager.getPatientAllSamples(req.user, req.params.patientId)
            .then(function(sampleList){                
                res.send(sampleList);
                return next();
            }, function(error){
                return next(new restErr.InternalError(JSON.stringify(error)));
            });
    });

    app.get({path: basePath + 'samples/patients/:patientId', version: '2.0.0'},authController.isAuthenticated, function(req, res, next){        
        SampleManager.getPatientsSamples(req.user, req.params.patientId)
            .then(function(sampleList){                
                res.send(sampleList);
                return next();
            }, function(error){
                return next(new restErr.InternalError(JSON.stringify(error)));
            });
    });
    
    app.get({path: basePath + 'sample/patient/lastvisit/:patientId', version: '1.0.0'},authController.isAuthenticated, function(req, res, next){
        SampleManager.getLastVisitSample(req.user, req.params.patientId)
            .then(function(sample){                  
                res.send(sample);
                return next();
            }, function(error){                     
                return next(new restErr.InternalError(JSON.stringify(error)));
            });
    });    


    app.put({path: basePath + 'sample/history/:sampelId', version : '1.0.0'}, authController.isAuthenticated, function (req, res, next) {
        SampleManager.addSampleHistory(req.user, req.params.sampelId, req.body)
            .then(function(id){
                res.send(id);
                return next();
            }, function(error){
                return next(new restErr.InternalError(JSON.stringify(error)));
            });        
        });
        
    app.get({path: basePath + 'sample/history/:sampleId/:fileId', version: '1.0.0'},authController.isAuthenticated, function(req, res, next){
        SampleManager.getSampleHistory(req.user, req.params.sampleId, req.params.fileId)
            .then(function(histories){
                res.send(histories);
                return next();
            }, function(error){
                return next(new restErr.InternalError(JSON.stringify(error)));
            });
    });   



    app.post({path: basePath + 'sample/:setCameraFileID', version: '2.0.0'}, authController.isAuthenticated, function(req, res, next){
        SampleManager.addSampleNew(req.user, req.body, req.files, req.params.setCameraFileID)
        .then(function(sampleId){
            res.send(sampleId);
            return next();
        }, function(error){
            console.log(error);
            return next(new restErr.InternalError(JSON.stringify(error)));
        })
        .catch( (error) => {
            console.log(error);
            return next(new restErr.InternalError(JSON.stringify(error)));
        });
    });
    
    app.post({path: basePath + 'sample/version/:sampleId', version: '2.0.0'}, authController.isAuthenticated, function(req, res, next){
        SampleManager.createVersion(req.user,  req.params.sampleId, req.body,  req.files)
        .then(function(sampleId){
            res.send(sampleId);
            return next();
        }, function(error){
            console.log(error);
            return next(new restErr.InternalError(JSON.stringify(error)));
        })
        .catch( (error) => {
            console.log(error);
            return next(new restErr.InternalError(JSON.stringify(error)));
        });
    });

    
};