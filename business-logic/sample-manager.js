/**
 * Created by Nitheen on 3/20/2015.
 */
'use strict';
/*Application error list*/
var appError                = require('../general/application-logger');
/*Application constant*/
var constant                = require('../general/application-constant');
var underscore        	    = require('underscore');
var Promise                 = require('bluebird');

module.exports = function(sampleFactory, patientFactory, accountFactory, Transaction, ICDService) {
    function getMatchingObjectById(itemList, fieldName, fieldValue){
        return underscore.find(itemList, function(item){
            return item[fieldName].toString() === fieldValue.toString()
        });
    }

    function updateMatchingProjectAndSampleNames(sample, projectSessions){
        var projectValue = {
            _id:   sample.project,
            name: ''
        };
        var sessionValue = {
            _id:   sample.session,
            name: ''
        };

        var project = getMatchingObjectById(projectSessions, '_id', sample.project);
        if(project){
            projectValue.name = project.name;
            var session  = getMatchingObjectById(project.sessions, '_id', sample.session);
            if(session){
                sessionValue.name = session.name;
            }
        }
        var newSample = sample.toObject();
        newSample.project =   projectValue;
        newSample.session =   sessionValue;

        return newSample;
    }

    function InvoiceSample(user, sampleId){
        return new Promise(function(resolve, reject) {
            if (Transaction) {
                Transaction.addTransaction(user, sampleId)
                    .then(function(transId){
                        resolve(transId);
                    }, function(error){
                        reject(error);
                    })
            } else {
                resolve("0");
            }
        });
    }

    function validateVersion(sample){
        return new Promise((resolve, reject) => {
            if(sample.objVersion === "V1"){
                return resolve(sample);
            }

            if(sample['versions'] === undefined || sample.versions.length === 0){                                
                var version = [{
                    fileId: sample.fileId,
                    cameraFileId :  sample.cameraFileId,
                    name : "V1",
                    description : "Source",
                    createdBy : sample.modifiedBy,
                    createdDate : sample.createdDate                                
                }]
                sample.versions = version;
            }
            Promise.each(sample.versions, (version) => {    
                if(version.records === undefined || version.records.length === 0 ){
                    var record = {
                        type : sample.type,
                        gasApi : sample.type,
                        fileId : version.fileId,
                        cameraFileId : version.cameraFileId,
                        hasReport : sample.hasReport
                    }
                    return sampleFactory.getHistory(sample._id, version.fileId)
                    .then(userAction => {                        
                        record.useracion = userAction;
                        version.records= [];
                        version.records.push(record)
                    });
                }                                
            })
            .then(result => {
                return resolve(sample);
            });
        });        
    }

    function getRecord(records, fileName){
        var fileType = "";
        var r = records.find(r => {
            if (r.FileName  === fileName){
                fileType = 'file';
                return r;                
            }
            if (r.CameraFileName  === fileName){
                fileType = 'camera';
                return r;
            }
        });

        return {record: r, type: fileType};
    }

    function AddSampleFile(factory, user, sampleId, file, records){
        var rObj = getRecord(records, file.name);  
        var r = rObj.record;
        if (rObj.type === 'file'){
            return factory.AddSampleFile(factory, user.id, user.userId, sampleId, r.type, file.path, r.hasReport)
            .then( (fileId) => {
                r.fileId = fileId;
                return fileId;
            })
        }           
    }

    return {
        addSample: function(user, sample){
            if (!sample) { return Promise.reject(appError.expectionList.NULL_PARAMETER); }
            var patientId =  sample.patientId;
            if(!patientId){ return Promise.reject(appError.expectionList.PATIENT_NOT_FOUND); }

            return patientFactory.getById(patientId)
                .then(function(patient){
                    sample.patient = patientId;

                    if(!sample.metadata) {sample.metadata = {}}
                    var metadata= sample.metadata;
                    if(!metadata.hasOwnProperty('weightInKilograms')){
                        metadata.weightInKilograms = patient.weightInKilograms;
                    }
                    if(!metadata.hasOwnProperty('heightInMeters')){
                        metadata.heightInMeters = patient.heightInMeters;
                    }
                    if(!metadata.hasOwnProperty('legLengthRightInCM')){
                        metadata.legLengthRightInCM = patient.legLengthRightInCM;
                    }
                    if(!metadata.hasOwnProperty('legLengthLeftInCM')){
                        metadata.legLengthLeftInCM = patient.legLengthLeftInCM;
                    }
                    if(sample.metadata.icdCodes){
                        ICDService.addList(user.id, sample.metadata.icdCodes);
                    }
                    return sample;
                })
                .then(function(newSample){
                    return sampleFactory.addSample(user.id, user.userId, newSample);
                })
                .then(function(savedSample){
                    return InvoiceSample(user, savedSample._id)
                        .then(function(transId){
                            patientFactory.updateLastVisitDate(user.userId, patientId);
                            return  savedSample._id;
                        }, function(error){
                            sampleFactory.deleteSample(user.userId, savedSample._id);
                            return Promise.reject(appError.formatError(error))
                        });
                }, function(error){
                    return Promise.reject(appError.formatError(error));
                })
        },

        addSampleNew(user, body, files, setCameraFileID){
            if (!body) { 
                return Promise.reject(appError.expectionList.NULL_PARAMETER); 
            }
            if(!files) {
                return Promise.reject(appError.expectionList.SAMPLE_FILE_NOT_FOUND);
            }  

            var fileCount = Object.keys(files).length;
            var sample = JSON.parse(body['application/json']);
            var returnSampleId;
            
            var setCamerId = (setCameraFileID.toLowerCase() == "true" );
            if(setCamerId){
                sample.records.forEach( (r) => {
                    if (r.CameraFileName && r.CameraFileName !== ""){
                         r.cameraFileId = sampleFactory.getDBId();
                    }
                });
            }
            
            return this.addSample(user, sample)
            .then( (sampleId) => {
                returnSampleId = sampleId;
        
                var filePromise = [];          
                for(var i = 0; i<fileCount; i++){
                    filePromise.push(i);
                }

                return Promise.each(filePromise, (index) => {
                    var file  = files[Object.keys(files)[index]];  
                    var rObj = getRecord(sample.records, file.name);  
                    var r = rObj.record;
                    if (rObj.type === 'file'){
                        return this.addSampleFileByPath(user, sampleId, r.type, r.hasReport, file.path , false, "Source");
                    }else{
                        return this.addCameraFileByPath(user, sampleId, r.type, file.path );
                    }
                    
                })
                .then( result => {
                    return sampleFactory.createSourceVersion(user.userId, returnSampleId);
                })
                .then (samepleVersion => {
                    return returnSampleId;
                })
            })
        },


        createVersion(user, sampleId, body, files){

            var desc =  body.desc;
            var records = JSON.parse(body['application/json']);

            if (!records) { 
                return Promise.reject(appError.expectionList.NULL_PARAMETER); 
            }
            if(!files) {
                return Promise.reject(appError.expectionList.SAMPLE_FILE_NOT_FOUND);
            } 

            return sampleFactory.getSampleById(sampleId)
            .then(sample => {
                if (!sample) {
                    return Promise.reject(appError.expectionList.SAMPLE_NOT_FOUND);
                }

                var fileCount = Object.keys(files).length;
                var filePromise = [];          
                for(var i = 0; i<fileCount; i++){
                    filePromise.push(i);
                }

                return Promise.each(filePromise, (index) =>{
                    var file  = files[Object.keys(files)[index]];                                      
                    return AddSampleFile(sampleFactory, user, sampleId, file, records);                                                           
                })
                .then (fileIds => {
                    return sampleFactory.AddNewVersion(user.userId, sampleId, records, desc);
                })

            })
        },

        copySample:  function(user, sampleId, desc, files){
            if(!files) {
                return Promise.reject(appError.expectionList.SAMPLE_FILE_NOT_FOUND);
            }            
            return this.addSampleFile(user, sampleId, "true", files, true, desc)
            .then((fileId) =>{
                return sampleFactory.getSampleById(sampleId)
                .then((sample) => {                    
                    var versions = sample.versions;
                     for (var i = 0, len = versions.length; i < len; i++) {        
                            if(versions[i].fileId.toString() === fileId.toString()){                                
                                return versions[i];
                            }
                     }
                });
            });
        },

        updateVersion(user, sampleId, description, records){
            if(!records) {
                return Promise.reject(appError.expectionList.SAMPLE_FILE_NOT_FOUND);
            }              

            return this.AddNewSampleVersion(user.userId, sampleId, records, description)
            .then ( (result) => {
                return "OK"
            });
        },

        addSampleFileByPath :  function(user, sampleId, recordType, hasReport, filePath, isversion, desc){
            return sampleFactory.SampleFile(user.id, user.userId, sampleId, filePath, recordType, hasReport, isversion)
                .then((sampleFileId) => {              
                    return sampleFileId;
                });
        },

        addCameraFileByPath: function(user, sampleId, recordType, filePath){
            return sampleFactory.CameraFile(user.id, user.userId, sampleId, filePath, recordType)
                .then(cameraFileId =>{
                    return cameraFileId;
                });
        },


        // ---------



        addSampleFile :  function(user, sampleId, recordType, hasReport, files, isversion, desc){
            if(!files) {
                return Promise.reject(appError.expectionList.SAMPLE_FILE_NOT_FOUND);
            }
            var file  = files[Object.keys(files)[0]];
            var filePath =  file.path;
            var bHasReport = (hasReport.toLowerCase() == "true" );
            return this.addSampleFileByPath(user, sampleId, recordType, bHasReport, filePath, isversion, desc);            
        },

        addReportFile: function(user, files, sampleId, key, type, description){
            if(!files) {
                return Promise.reject(appError.expectionList.SAMPLE_FILE_NOT_FOUND);
            }
            var file  = files[Object.keys(files)[0]];
            var filePath =  file.path;
                    
            return sampleFactory.ReportFile(user.id, user.userId, sampleId, filePath, key, type, description)
                .then((sampleFileId) => {                    
                    return sampleFileId;
                }, (error) => {
                    console.log(error);
                    return Promise.reject(appError.formatError(error));
                });                                    
        },



        addCameraFile: function(user, sampleId, recordType, files){
            if(!files) {
                return Promise.reject(appError.expectionList.CAMERA_FILE_NOT_FOUND);
            }
            var file  = files[Object.keys(files)[0]];
            var filePath =  file.path;
            return sampleFactory.CameraFile(user.id, user.userId, sampleId, filePath, recordType)
                .then(function(cameraFileId){
                    return cameraFileId;
                }, function(error){
                    return Promise.reject(appError.formatError(error));
                })
        },
        
        setCameraFile: function(user, sampleId, recordType){
            return sampleFactory.SetCameraFile(user.id, user.userId, sampleId, recordType)
                .then(function(cameraFileId){
                    return cameraFileId;
                }, function(error){
                    return Promise.reject(appError.formatError(error));
                })            
        },
        
        getAllSample: function(user){
            return Promise.all([
                sampleFactory.getAll(user.id),
                accountFactory.getAllProjectSession(user.id)
            ])
                .then(function(results){
                    return results;
                },function(err){
                    return Promise.reject(appError.formatError(err));
                });
        },

        getSampleFile : function(user, sampleId, fileId, type, res){
            type =  type.toLowerCase();

            if (type !== constant.FILE_TYPE.tile &&  type !== constant.FILE_TYPE.camera){
                return Promise.reject(appError.expectionList.INVALID_FILE_TYPE);
            }

            return sampleFactory.getSampleByAccountId(user.id, sampleId)
                .then(function(sample){
                    if (!sample) {return Promise.reject(appError.expectionList.SAMPLE_NOT_FOUND);}
                    return sampleFactory.SampleFileStream(fileId, res);

                    // if(type === constant.FILE_TYPE.tile ) {
                    //     return sampleFactory.SampleFileStream(fileId, res);
                    // } else {
                    //     return sampleFactory.SampleFileStream(fileId, res);
                    // }
                }, function(error){
                    return Promise.reject(appError.formatError(error));
                })
        },
        getPatientAllSamples: function(user, patientId){
            return sampleFactory.getPatientsAllSample(patientId)
                .then(function(sampleList){                    
                    for (var i = 0, len = sampleList.length; i < len; i++) {                        
                        var sample = sampleList[i];    
                        validateVersion(sample);
                    }
                    return sampleList;
                }, function(error){
                    return Promise.reject(appError.formatError(error));
                });
        },

        getPatientsSamples: function(user, patientId){
            return sampleFactory.getPatientsAllSample(patientId)
                .then(function(sampleList){                                       
                    return Promise.each(sampleList, (sample) => {
                        return validateVersion(sample);
                    })
                    .then( result => {
                        return sampleList;
                    });
                }, function(error){
                    return Promise.reject(appError.formatError(error));
                });
        },

        getSampleInfo: function(user, sampleId){
            return sampleFactory.getSampleByAccountId(user.id, sampleId)
                .then(function(sample){       
                    validateVersion(sample);                   
                    return sample;
                });
        },
        
        getLastVisitSample: function(user, patientId){            
            return sampleFactory.getPatientLastVisitSample(user.id, patientId)
                .then(function(sample){
                    if(sample){
                        validateVersion(sample);
                        return sample;
                    }
                    return Promise.reject(appError.expectionList.NOT_FOUND);
                }, function(error){                    
                    return Promise.reject(appError.formatError(error));
                });            
        },
        
        addSampleHistory: function(user, sampleId, history){
           if(!history) {
                return Promise.reject(appError.expectionList.NULL_PARAMETER);
            }
            if(history.sampleId === sampleId){
                return sampleFactory.addHistory(user.userId, history)                
                .then(function(id){
                    return id;
                }, function(error){
                    return Promise.reject(appError.formatError(error));
                })                               
            }
            
            return Promise.reject("Invalid Sample Id");
        },
        
        getSampleHistory: function(user, sampleId, fileId){
            return sampleFactory.getHistory(sampleId, fileId)
            .then(function(histories){
                return histories;
            }, function(error){
                return Promise.reject(appError.formatError(error));
            })
        }                
    }
};