/**
 * Created by Nitheen on 4/7/2015.
 */
'use strict';
var underscore        	    = require('underscore');
var appError                = require('../general/application-logger');
var standardSchema          = require('../models/mongoose-model').Standard;
var IStandard               = require('./standard-interface').IStandard;
var fileService             = require('../database/file-service');


var selectOmitFields = {modifiedBy:0, createdBy:0, modifiedDate:0, isDeleted:0};
var omitFields = ['modifiedBy', 'createdBy', 'modifiedDate', 'type', 'accountId', 'isDeleted'];

/**
 * Create a Standard factory object
 * @constructor
 */
var StandardFactory = function(fileService) {
     this.FileService = fileService;
};

var getNew = {new: true};

/**
 * Implementing ISample interface
 * @type {IPatient}
 */
StandardFactory.prototype = Object.create(IStandard);

StandardFactory.prototype.getStandardList = function(accountId){
    if(!accountId) {return Promise.reject(appError.expectionList.NULL_PARAMETER);}    
    var query = ({isDeleted : false, accountId: accountId});
    return standardSchema.find(query, selectOmitFields).exec();
};


StandardFactory.prototype.getStandardById = function(standardId){
    if(!standardId) {return Promise.reject(appError.expectionList.NULL_PARAMETER);}
    return standardQuery({_id: standardId})
        .then(function(standard){
                if(standard) return standard[0];
                Promise.reject(appError.expectionList.NOT_FOUND);
        });
};

StandardFactory.prototype.saveStandard = function(accountId, userId, moduleType, standard, standardType){
    return CheckDuplicateEntry(accountId, moduleType, standard.Title, standard.Gender)
    .then(() =>{
        var _standard = new standardSchema();
        _standard.accountId = accountId;
        _standard.type = standardType;
        _standard.moduleType = moduleType;
        _standard.createdBy = userId;
        _standard.modifiedBy = userId;
        _standard.data = standard;
        return _standard.save()
            .then(function(newStandard){
                return underscore.omit(newStandard.toObject(), omitFields);
            });
    });
};

StandardFactory.prototype.editStandard = function(accountId, userId, standardId , modifyStandard){

    return standardQuery({_id: standardId, isDeleted: false})
        .then(function(standard){
            if(!standard)  {return Promise.reject(appError.expectionList.NOT_FOUND);}

            if(standard.accountId.toString() !== accountId){
                return Promise.reject(appError.expectionList.NOT_FOUND);
            }

            if(standard.type === "Global"){                
               return Promise.reject(appError.expectionList.GLOBAL_DATA_EDIT);
            }            

            var data = underscore.omit(modifyStandard, ['_id', 'accountId', 'isDeleted']);
            return standardSchema.findByIdAndUpdate(standardId, {$set: {data: data}}, getNew).exec();
        });
};

StandardFactory.prototype.delete = function(accountId, userId, standardId){
    return standardQuery({_id: standardId})
        .then((std) =>{            
            if(!std){
               return Promise.reject(appError.expectionList.NOT_FOUND);
            }

            if(std.type === "Global"){                
               return Promise.reject(appError.expectionList.GLOBAL_DATA_DELETE);
            }

            var update = {$set: {isDeleted: true, modifiedBy: userId, modifiedDate: Date.now()}};        
            return standardSchema.findOneAndUpdate( {accountId: accountId, _id: standardId}, update, getNew).exec();            
        });
};

StandardFactory.prototype.deleteStandard = function(accountId, userId, standardId){
    var update = {$set: {isDeleted: true, modifiedBy: userId, modifiedDate: Date.now()}};        
    return standardSchema.findOneAndUpdate( {accountId: accountId, _id: standardId}, update, getNew).exec();
};

StandardFactory.prototype.AddFile = function(accountId, userId, normativeId, filePath){
 var me  = this;    
 return standardQuery({_id: normativeId, isDeleted: false})
        .then(function(standard){
             if(!standard)  {return Promise.reject(appError.expectionList.NOT_FOUND);}

             var fileName = normativeId + '.h5';

            if(standard.fileId) {
                deleteFile(me.FileService, sample.fileId)
            }             

            var metadata = {
                accountId: accountId,
                createdBy: userId,
                createDate: new Date(),
                modifiedBy: userId,
                modifiedDate: new Date(),
                type: "normative",
                normativeId: normativeId,
                fileExt: "h5",
            };
            return addFile(me.FileService, metadata, filePath, fileName, null);
        })
        .then(function(fileInfo){
            return standardSchema.findOneAndUpdate({_id: normativeId}, { $set: { fileId: fileInfo._id}}, getNew)
                .exec()
                .then(function(){
                    return fileInfo._id;
                })
        });        
}

StandardFactory.prototype.DeleteFile = function(accountId, normativeId){
    var me  = this;    
    return standardQuery({_id: normativeId, isDeleted: false})
        .then(function(standard){
             if(!standard)  {return Promise.reject(appError.expectionList.NOT_FOUND);}
             
            if(standard.accountId.toString() !== accountId){
                return Promise.reject(appError.expectionList.NOT_FOUND);
            }

            if(standard.fileId) {
                deleteFile(me.FileService, sample.fileId)
            }   
            return standardSchema.findOneAndUpdate({_id: normativeId}, { $set: { fileId: null}}, getNew)
                .exec()
                .then(function(){
                    return "OK";
                });            
        });    
}

StandardFactory.prototype.NormativeFileStream = function(standardId, res){
    var me  = this;
    return standardQuery({_id: standardId, isDeleted: false})
        .then((st) =>{
             if(!st)  {return Promise.reject(appError.expectionList.NOT_FOUND);}

            return new Promise(function(resolve, reject){
                me.FileService.streamFile(st.fileId, res, function(error, msg){
                    if (error)  {
                        reject(error);
                    } else {
                        resolve(msg);
                    }
                })
            });
        });


};


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

function standardQuery(query){
    return standardSchema.findOne(query, selectOmitFields)
        .exec();
}

/**
 * Check duplicate patient code in same account
 * @param {*} savePatient 
 * @param {*} accountId 
 */
function CheckDuplicateEntry(accountId, moduleType, title, gender){
    return new Promise(function(resolve, reject){
                standardSchema.findOne({accountId: accountId, isDeleted: false, moduleType: moduleType, 'data.Title' : title, 'data.Gender' : gender})
                .exec()
                .then((normative)=>{
                    if(normative){                                                  
                         return reject(appError.expectionList.DUPLICATE);                           
                    }
                    return resolve();
                });            
    });
}

// Promise.promisifyAll(StandardFactory);
// Promise.promisifyAll(StandardFactory.prototype);

module.exports = StandardFactory;