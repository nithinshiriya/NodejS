/**
 * Created by Nitheen on 3/20/2015.
 */
'use strict';
var underscore        	    = require('underscore');
var appError                = require('../general/application-logger');
var sampleSchema            = require('../models/mongoose-model').Sample;
var HistorySchema           = require('../models/mongoose-model').SampleHistory;
var ISample                = require('./sample-interface').ISample;
var db                     = require("../database/db-connection"); 

var omitFields = ['modifiedBy', 'createdBy', 'modifiedDate', 'isDeleted'];
var selectOmitFields = {modifiedBy:0, createdBy:0, modifiedDate:0, isDeleted:0};
var patientPopulate =  '_id firstName lastName lastVisitDate code project session birthDate gender';
var userPopulate =  'firstName lastName';
/**
 * Create a Sample factory object
 * @constructor
 */
var SampleFactory = function(fileService) {
   this.FileService = fileService;
};

var getNew = {new: true};

/**
 * Implementing ISample interface
 * @type {IPatient}
 */
SampleFactory.prototype = Object.create(ISample);

SampleFactory.prototype.getSampleModel = function(sample, omitFields){
    var tmpSample = underscore.omit(sample, omitFields);
    return new sampleSchema(tmpSample);
};

SampleFactory.prototype.addSample = function(accountId, userId, sample){
    if(!sample) {return Promise.reject(appError.expectionList.NULL_PARAMETER);}    
    var tmpSample = underscore.omit(sample, ['_id', 'accountId', 'createdDate']);
    var _sample = new sampleSchema(tmpSample);    
    _sample.accountId = accountId;
    _sample.createdBy = userId;
    _sample.modifiedBy = userId;
    _sample.versions = [];
    return _sample.save()
        .then(function(sample){
           return underscore.omit(sample.toObject(), omitFields);
        });
};

SampleFactory.prototype.deleteSample = function(userId, sampleId){
    return sampleSchema.findOneAndUpdate({_id: sampleId}, { $set: { isDeleted: true, modifiedBy: userId }}, getNew)
        .exec()
};

SampleFactory.prototype.getAll = function(accountId){
    return this.getSampleByQuery({'accountId': accountId});
};

SampleFactory.prototype.getSampleById =  function(sampleId){
    return this.getSampleByQuery({_id: sampleId})
        .then(function(samples){
            if(samples) return samples[0];
            Promise.reject(appError.expectionList.NOT_FOUND);
        })
};

SampleFactory.prototype.getSampleByAccountId =  function(accountId, sampleId){
    return this.getSampleByQuery({_id: sampleId, accountId: accountId})
        .then(function(samples){
            if(samples) return samples[0];
            Promise.reject(appError.expectionList.NOT_FOUND);
        })
};

SampleFactory.prototype.getSampleByQuery = function(query){
    return sampleSchema.find(query, selectOmitFields)
        .populate('patient', patientPopulate)
        .exec();
};

SampleFactory.prototype.sampleSearch = function(query){
    return sampleSchema.find(query, {modifiedBy:0, modifiedDate:0, isDeleted:0})
        .populate('patient', patientPopulate)
        .populate('createdBy', 'firstName lastName')
        .exec();
};

SampleFactory.prototype.AddNewVersion = function(userId, sampleId, records, description){       
    var version = {
        name : "V1",
        description : description,
        createdBy : userId,
        createdDate : new Date(),
        records : records
    }    

    return this.getSampleById(sampleId)        
    .then((sample) =>{            
        if (!sample) {
            return Promise.reject(appError.expectionList.SAMPLE_NOT_FOUND);
        }            
        var count = sample.versions.length;            

        if(count !== 0){
            count++;
            version.name = "V" + count;   
        }        
        return version;
    })
    .then( (version) => { 
        return sampleSchema.findByIdAndUpdate(sampleId, {$push: {'versions': version}}, getNew)
                .exec()
                .then(sample => {
                    return sample.versions;
                });
    });
}

SampleFactory.prototype.AddSampleFile  = (me, accountId, userId, sampleId, recordType, filePath, hasReport) => {
    var metadata = {
        accountId: accountId,
        sampleId: sampleId,
        createdBy: userId,
        createDate: new Date(),
        modifiedBy: userId,
        modifiedDate: new Date(),
        type : recordType,
        fileExt : "h5"
    }; 
    var fileName = sampleId + '.h5';
    return addFile(me.FileService, metadata, filePath, fileName, null)
    .then((fileInfo) => {
        return fileInfo._id;
    });
}

SampleFactory.prototype.SampleFile =  function(accountId, userId, sampleId, filePath, recordType, hasReport, isVersion){
    var me  = this;
    return this.getSampleByAccountId(accountId, sampleId)
        .then((sample) => {
            if (!sample) {
                return Promise.reject(appError.expectionList.SAMPLE_NOT_FOUND);
            }
            
            var record  = GetRecord(sample, recordType, hasReport);            
            let fileId = record.fileId;
            var records = sample.records;
            return getMetadata(me.FileService, fileId, isVersion, hasReport, accountId, userId, recordType)
                .then( (metadata) => {
                    var fileName = sampleId + '.h5';
                    return addFile(me.FileService, metadata, filePath, fileName, fileId);
                })
                .then((fileInfo) =>{
                    if(isVersion === false){
                        record.fileId = fileInfo._id;                                            
                        return sampleSchema.findOneAndUpdate({_id: sampleId}, { $set: { records: records, hasReport: hasReport }}, getNew)
                            .exec()
                            .then(() =>{
                                return fileInfo._id;
                            })
                    }
                    else{
                        return fileInfo._id;
                    }                        
                });
        });
};



SampleFactory.prototype.CameraFile =  function(accountId, userId, sampleId, filePath, recordType){
    var me  = this;    
    return this.getSampleByAccountId(accountId, sampleId)
        .then(function(sample) {
            if (!sample) {
                return Promise.reject(appError.expectionList.SAMPLE_NOT_FOUND);
            }

            var record  = GetRecord(sample, recordType);
            let fileId = record.cameraFileId;
            var records = sample.records;
            
            if(fileId) {
                deleteFile(me.FileService, fileId)
            }

            return  getMetadata(me.FileService, fileId, true, true, accountId, userId, recordType)
            .then ((metadata) => {
                const fileName = sampleId + '.h5';
                return addFile(me.FileService, metadata, filePath, fileName, null);
            })
            .then ((fileInfo) =>{
                record.cameraFileId = fileInfo._id;
                return sampleSchema.findOneAndUpdate({_id: sampleId}, { $set: { records: records}}, getNew)
                .exec()
                .then(function(){
                    return fileInfo._id;
                })                    
            });
        });
};

SampleFactory.prototype.ReportFile =  function(accountId, userId, sampleId, filePath, key, type, description){
    var me  = this;    
    return this.getSampleByAccountId(accountId, sampleId)
        .then(function(sample) {
            if (!sample) {
                return Promise.reject(appError.expectionList.SAMPLE_NOT_FOUND);
            }            

            return new Promise(function(resolve, reject){
                var reports = sample.reports;
                if(sample.reports){
                    reports.forEach(r => {
                        if(r.key === key){
                            deleteFile(me.FileService, r.fileId);
                            return sampleSchema.update({_id: sample._id }, { $pull  : { reports: { _id: r._id}}})
                            .exec()
                            .then( result =>{
                                console.log(result);
                                return resolve();
                            })                      
                        }
                    });
                }
                return resolve();
            })
            .then( () => {
                var fileName = sampleId + "_" + key +'.' + type;
                var metadata = {
                    accountId: accountId,
                    createdBy: userId,
                    createDate: new Date(),
                    modifiedBy: userId,
                    modifiedDate: new Date(),
                    type: "reports",
                    key: key,
                    fileExt: type,
                };                
                return addFile(me.FileService, metadata, filePath, fileName, null);
            })
            .then( (fileInfo) =>{
            
                var reports = {
                    key				: key,	
                    description		: description,	
                    fileId   		: fileInfo._id,
                    type			: type                    
                }

                return sampleSchema.findOneAndUpdate({_id: sampleId}, { $push: { 'reports': reports}}, getNew)
                    .exec()
                    .then(function(){
                        return fileInfo._id;
                    });
            });
        });
};

SampleFactory.prototype.AddNewSampleVersion = function(userId, sampleId, records, description){    
    return this.getSampleById(sampleId)
    .then( (sample) => {

        var versions = sample.versions;
        var count = 0;
        if(versions){
            count = versions.length;    
        }else{
            versions = [];
        }    
        count++;

        var version = sampleVerionsObject(count, description, userId, records);
        versions.push(version);
        return updateSampleVersion(sampleId, versions);

    });    
}

function sampleVerionsObject(versionCount, description, userId, records){
    return {
        name : "V" + versionCount,
        description : description,
        createdBy : userId,
        createdDate : new Date(),
        records: records
    }  
}

function updateSampleVersion(sampleId, versions){
    return sampleSchema.findOneAndUpdate({_id: sampleId}, { $set: { versions: versions}}, getNew)
    .exec()
    .then((newSample) => {
        return newSample.versions;
    });       
}


SampleFactory.prototype.createSourceVersion = function(userId, sampleId){
    var version = {
        name : "V1",
        description : 'Source',
        createdBy : userId,
        createdDate : new Date()
    };
    return this.getSampleById(sampleId)
        .then(sample => {
            if (!sample) {
                return Promise.reject(appError.expectionList.SAMPLE_NOT_FOUND);
            }  
            version.records = sample.records;        
            var versions = [];
            versions.push(version);
            return sampleSchema.findOneAndUpdate({_id: sampleId}, { $set: { 'versions': versions}}, getNew)
            .exec()
            .then( newSample => {               
                return newSample;
            });            
        });      
}


SampleFactory.prototype.getDBId = function(){
    return db.getId();
}

SampleFactory.prototype.SetCameraFile = function(accountId, userId, sampleId, recordType){
    return this.getSampleByAccountId(accountId, sampleId)
    .then(function(sample) {
        if (!sample) {
            return Promise.reject(appError.expectionList.SAMPLE_NOT_FOUND);
        }

        var record  = GetRecord(sample, recordType);
        var fileId = db.getId();

        record.cameraFileId = fileId;
        records = sample.records;
        return sampleSchema.findOneAndUpdate({_id: sampleId}, { $set: { records: records}}, getNew)
        .exec()
        .then(function(){
            return fileId;
        });          
    });
}

SampleFactory.prototype.SampleFileStream = function(fileId, res){
    var me  = this;
    return new Promise(function(resolve, reject){
        me.FileService.streamFile(fileId, res, function(error, msg){
            if (error)  {
                reject(error);
            } else {
                resolve(msg);
            }
        })
    });
};


/**
 * Get all sample that are associated with patient id.
 * @param patientId
 */
SampleFactory.prototype.getPatientsAllSample = function(patientId){
    return sampleSchema.find({patient : patientId})
        .sort({modifiedDate : -1})
        .populate('patient', patientPopulate)
        .exec();
};

SampleFactory.prototype.getPatientLastVisitSample = function(accountId, patientId){
    return sampleSchema.findOne({accountId: accountId, patient : patientId})
        .sort({modifiedDate : -1})
        .limit(1)
        .populate('patient', patientPopulate)
        .exec();
};

/**
 * Add new Sample editing histories to the list.
 */
SampleFactory.prototype.addHistory = function(userId, history) {
    if(!history) {return Promise.reject(appError.expectionList.NULL_PARAMETER);}    
    var tmpHistory = underscore.omit(history, ['_id', 'modifiedDate', 'modifiedBy']);
    var _history = new HistorySchema(tmpHistory);        
    _history.modifiedBy = userId;    
    
    return _history.save()
        .then(function(h){
           return h._id;
        });    
}

/**
 * Get All Sample editing histories.
 */
SampleFactory.prototype.getHistory = function(sampleId, fileId) {
    return HistorySchema.find({sampleId : sampleId, fileId: fileId})
        .sort({modifiedDate : -1})
        .populate('modifiedBy', userPopulate)
        .exec()
        .then((history) =>{
            if(history){                
                return history;
            }            
            return HistorySchema.find({sampleId : sampleId})
                .sort({modifiedDate : -1})
                .populate('modifiedBy', userPopulate)
                .exec();               
        });
}


function addFile(fs, metadata, filePath, fileName, fileid){
    return new Promise(function(resolve, reject){        
        fs.addFileByPath(fileid, filePath, fileName, metadata, function(err, fileInfo) {            
            if (err)  {
                reject(err);
            } else {
                resolve(fileInfo);
            }
        });
    });
}

function deleteFile(fs, fileId){
    return new Promise(function(resolve, reject){
        fs.deleteFile(fileId, function(err){
            if(err){
                console.log(err);
                reject(err);
            } else {
                resolve();
            }
        })
    })
}

function getSampleFileMetadata(fs, fileId){
    return new Promise(function(resolve, reject){
        fs.findByQuery({_id: fileId}, function(err, metdata){
            if (err)  {
                reject(err);
            } else {
                resolve(metdata);
            }
        });
    });
}

function populateMetadata(metadata, sample){
    metadata.type = sample.type;
    metadata.dateOfBirth = sample.patient.birthDate;    
    metadata.patientId = sample.patient._id;
    metadata.fileExt = "h5";
}

function getMetadata(fileService, fileId, isVersion, accountId, userId, recordType){
            
    if(fileId && isVersion === false){
        return getSampleFileMetadata(me.FileService, sample.fileId)
            .then(function(fileMetadata){
                var newMetadata = fileMetadata.metadata;
                newMetadata.modifiedBy = userId;
                newMetadata.modifiedDate = new Date();
                return newMetadata;
            });
    }else{                
        return new Promise(function(resolve, reject){
            var metadata = {
                accountId: accountId,
                createdBy: userId,
                createDate: new Date(),
                modifiedBy: userId,
                modifiedDate: new Date(),
                type : recordType,
                fileExt : "h5"
            };              
            resolve(metadata);                
        });
    }
}

function GetRecord(sample, recordType, hasReport){
    var record;
    if (sample.records){
        record = sample.records.find( (r) =>{
            if (r.type === recordType){
                return r;
            }
        });            
    }
    else{
        sample.records = [];                
    }   
    
    if (!record){
        record = {
            type 			: recordType,	
            hasReport		: hasReport                    
        }; 
        sample.records.push(record);
    }    
    return record;
}


// Promise.promisifyAll(SampleFactory);
// Promise.promisifyAll(SampleFactory.prototype);

module.exports = SampleFactory;