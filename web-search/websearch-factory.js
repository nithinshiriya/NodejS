/**
 * Created by Nitheen on 7/10/2017.
 */
'use strict';
var appError                = require('../general/application-logger');
var constant                = require('../general/application-constant');
var sampleSchema            = require('../models/mongoose-model').Sample;
var patientSchema           = require('../models/mongoose-model').Patient;
var icdMasterSchema         = require('../models/mongoose-model').ICDMaster;
var accountSchema           = require('../models/mongoose-model').Account;
var specificationSchema     = require('../models/mongoose-model').Specification;
var userSchema              = require('./web-user').WebUser;
var underscore              = require('underscore');
var fs                      = require('fs');
var Grid                    = require('gridfs-stream');
var pLimit                  = require('p-limit');
var archiver                = require('archiver');
var userSchema1             = require('../models/mongoose-model').User;
var FileTable               =  require("../storage/filetable").FileTable;
var path                    = require('path');
var packageJson             = require('../package.json');
var mongoose = require('mongoose');

module.exports = function(dbConnection) {
    
    var selectOmitFields = {modifiedBy:0, createdBy:0, modifiedDate:0, isDeleted:0};
    var patientPopulate =  '_id  lastVisitDate code project session birthDate gender';
    var accountPopulate =  '_id  entityName';
    var icdSelectField =  {code: -1, short: -1 };
    var accountSelectField = {entityName: -1, address1: -1, city: -1, state: -1, zip: -1};
    var userSelectField = {role: 0, accounts: 0, createdDate: 0, modifiedDate:0, password:0};
    var fileSampleSelectField = {reports: 0, cameraFileId: 0, createdBy: 0, modifiedBy: 0, __v: 0 };   
    var specificationOmitFields = {accountId:0, createdDate:0}; 

    function getQuery(tableName, criteriaList){
        
        var pList = [];
        criteriaList.forEach( (c) => {
            if(c.table === tableName){
                pList.push(c);
            }
        });
        

        if(pList.length == 0){
            return;
        }

        var query = {};
        pList.forEach( (p) => {
            var val = p.value;
            var obj = query[p.fieldId];
            if(obj === undefined){
                obj =  query[p.fieldId] = {};                               
            }
            
            if(p.arrayFieldName && p.arrayFieldName !== ""){
                 let elm = obj["$elemMatch"]  = {};
                 let arField = elm[p.arrayFieldName] = {};
                 arField[p.dbOperator] = val;                      

            }else{
                
                if(p.dataType === "date") {
                    val =  new Date(Date.parse(p.value))
                }    

                if(p.dataType ==="number"){
                    val = parseFloat(p.value);
                }
                
                obj[p.dbOperator] = val;     
            }                            
        });                

        return query;
    }


    function getPatientIdList(criteriaList){
               
        var query = getQuery("patient", criteriaList);        
        if(query){
            return  patientSchema.find(query, {_id: 1})
                .then((patients) => {           
                    var pList = [];
                    patients.forEach((p) => pList.push(p._id));
                    return  {hasdata: true, data: pList};
            });
        }else{
            return Promise.resolve({hasdata: false});
        }
    }

    function getNameResult(results){
        var len = results.length;
        var list = [];
        for(var i=0; i < len; i++){
            list.push({
                name: results[i].short,
                subTitle: results[i].code,
                key:  results[i].code
            });
        }
        return list;
    }

    function getCodeResult(results){
        var len = results.length;        
        var list = [];
        for(var i=0; i < len; i++){
            list.push({
                name: results[i].code,
                subTitle: results[i].short,
                key: results[i].code
            });
        }
        return list;
    }    

    function populateAccountResult(results){
        var len = results.length;        
        var list = [];
        for(var i=0; i < len; i++){
            let subTitle = "-";
            if(results[i].address1){
                subTitle =  results[i].address1
            }

            if(results[i].city){
                subTitle =  subTitle + ", " + results[i].city
            }

            if(results[i].state){
                subTitle =  subTitle + ", " + results[i].state
            }            

            if(results[i].zip){
                subTitle =  subTitle + ", " + results[i].zip
            }           

            list.push({
                name: results[i].entityName,
                subTitle: subTitle,
                key: results[i]._id
            });
        }
        return list;
    }

    function saveSampleFile(sampleId, zip){
        return new Promise(function(resolve, reject){                               
            sampleSchema.findById(sampleId, fileSampleSelectField)
                .populate('patient', patientPopulate)
                .populate('accountId', accountPopulate)            
                .then(sample => {   
                    
                        if(!sample) return reject(sampleId + " : Sample id not found");                            
                        if(!sample.fileId) {                               
                            return reject(sampleId + " : Sample file id not found");                      
                        }

                        let filename =  sample._id + ".h5";
                        let metadataFileName =  sample._id + ".json";      
                        let fileStorage = packageJson.stepscan.fileStorage.toLowerCase();

                        saveH5FileToZip(fileStorage, sample.fileId, filename, zip , (error, status) => {                            
                            if(error){                                                                                    
                                return reject(sampleId + " : " + error);                  
                            }
                            zip.append(JSON.stringify(sample, null, 4), {name: metadataFileName});
                            return resolve(sampleId + " : Ok");                       
                        });                         
                    });                    
            }, error =>{                               
                return reject(sampleId + " : "   + error);  
            });        
    }    

    function saveH5FileToZip(fileStorage, fileId, name, zip, next){        
        switch (fileStorage){
                 case "database":
                        return saveDBH5FileToZip(fileId, name, zip, next);
                 default:        
                        return saveDirectoryH5FileToZip(fileStorage, fileId, name, zip, next);                                                    
            }        
    }

   function saveDirectoryH5FileToZip(directoryPath, fileId, name, zip, next){
        FileTable.findOne({ '_id': fileId}, function(err, file){
                if(err){
                   return next("File not found");
                }      

                var filePath = path.join(directoryPath, file.filePath);                          
                var readStream = fs.createReadStream(filePath);  
                writeToZip(readStream, name, zip, next);              
        }); 
    } 

    function saveDBH5FileToZip(fileId, name, zip, next){
        var gfs = Grid(dbConnection.getMongoose().connection.db);  
            gfs.exist({_id: fileId}, (error, found) => { 
                if(error || !found){                               
                    return next("File not found");
                }                           
                var readStream = gfs.createReadStream({_id: fileId});
                writeToZip(readStream, name, zip, next);
                                   
            });      
    }  

    function writeToZip(readStream,  name, zip, next){
        readStream.on('close', function () {
            next(null, 'OK');
        });
        readStream.on('error', function (error) {            
            next(error);
        });        
        zip.append(readStream, {name: name});         
    }


    function streamReport(id, reportKey, next){
        let fileStorage = packageJson.stepscan.fileStorage.toLowerCase();
        switch (fileStorage){
                 case "database":
                        return streamDBReport(id, reportKey, next);
                 default:        
                        return streamFileReport(fileStorage, id, reportKey, next);                                                    
            }          
    }

   function streamFileReport(directoryPath, id, reportKey, next){
        FileTable.findOne({ _id : id, 'metadata.type' : "reports", 'metadata.key': reportKey}, function(err, file){
                if(err){
                   return next(err);
                }      
                var filePath = path.join(directoryPath, file.filePath);                          
                var readStream = fs.createReadStream(filePath);  
                next(null, readStream);
        });        
   } 

   function streamDBReport(reportFileId, reportKey, next){
        var gfs = Grid(dbConnection.getMongoose().connection.db);                  
        var id = mongoose.Types.ObjectId(reportFileId);
        gfs.files.find({ _id : id, 'metadata.type' : "reports", 'metadata.key': reportKey})
        .toArray(function (err, files) {
            if (err) {
                return next(err);
            }
            if(files.length == 0){
                return next("Report not found");
            }

            var readStream = gfs.createReadStream({_id: reportFileId});
            next(null, readStream);            
        });
   }

   function deleteSample(sampleID, accountID){       
        let userId = packageJson.stepscan.id;
        return sampleSchema.findOneAndUpdate( {"_id" : sampleID, "accountId" : accountID}, { $set: { isDeleted: true, modifiedBy: userId }}, {new: true})
        .exec()
        .then(result => {            
            return "Deleted";
        }, (error)=>{                
                return error;
        });
   }


    return {

        /**
         * Add user
         */
        addUser: function(user, role){
            var saveUser = underscore.omit(user,  '_id', 'role', 'accounts');
            var mUser =  new userSchema(saveUser);
            mUser.role = role;
            return mUser.save()
            .then(newUser => {                         
                return "Done";
            });
        },

        getUser: function(){
            return userSchema.find({}, userSelectField);
        },

        actiavte(id, isActive){
            return userSchema.findOneAndUpdate({_id: id, role: 'user'} , {isActive: isActive})
            .exec();
        },   

        changePassowrd(userId, password){
            return userSchema.findOne({_id: userId})
            .then(user =>{
                if (!user) {
                    return Promise.reject(appError.expectionList.USER_NOT_FOUND);
                }                
                user.password = password;
                user.modifiedDate = Date.now();

                return user.save().then(function (modifieduser) {
                    return modifieduser;
                });                            
            });           
        },

        /**
         * Edit user
         * @param {UserID} userId 
         * @param {save User data} eUser 
         */
        edituser(userId, eUser){
            return userSchema.findOne({_id: userId})
            .then(user =>{
                if (!user) {
                    return Promise.reject(appError.expectionList.USER_NOT_FOUND);
                }                
                user.firstName = eUser.firstName;
                user.lastName = eUser.lastName;
                user.phoneNo = eUser.phoneNo;
                user.modifiedDate = Date.now();

                return user.save().then(function (modifieduser) {
                    return modifieduser;
                });                            
            });   
        },

        downloadSampleFiles(sampleIds, res){
            return new Promise(function(resolve, reject){                      
                    res.header('Content-Type', 'application/zip');                    
                    res.header('Content-disposition', 'attachment; filename=myFile.zip');                    
                                        
                    var archive = archiver('zip');
                    res.on('close', function () {
                        console.log(archive.pointer() + ' total bytes');
                        console.log('archiver has been finalized and the output file descriptor has closed.');
                        resolve("Ok");
                    });

                    archive.on('error', function(err){                        
                        console.log(err);                        
                    });                
                    
                    archive.pipe(res);                                                        
                    let limit = pLimit(1);
                    let run = [];
                    sampleIds.forEach(id => {
                        run.push(saveSampleFile(id, archive));
                    });
                    let results = [];
                    let hasRejection  = 0;

                    Promise.all(run.map(p => {            
                        return p.then( resolved => {                    
                            results.push(resolved);                    
                            return results;
                        }, rejected =>{                                            
                            results.push(rejected);       
                            hasRejection++;             
                            return results;
                        });
                    }))
                    .then((data)=>{                              
                        if(hasRejection === sampleIds.length){
                             reject(results);
                        }

                        let str = "";
                        results.forEach( (d, i) =>{
                            str  = str + "[" + i + "] " + d + "\r\n";
                        })                
                        archive.append(str, {name: "result.txt"});
                        return archive.finalize()                                                                        
                    })
                    .then( () =>{                        
                        resolve(results);
                    })
                    .catch( error => {                        
                        reject(error);
                    })
            });                              
        },                

        /**
         * Advance Search.
         * @param criteria         
         */
        advanceSearch: function(criteriaList){                  
            return  getPatientIdList(criteriaList)            
            .then((patientResult) =>{             

                var query = {
                    isDeleted : false,
                    hasReport : true,                                
                }      

                var sampleQuery = getQuery("sample", criteriaList);                
                
                if(patientResult.hasdata){
                    query["patient"] = {
                        $in : patientResult.data
                    }
                };                
                
                Object.assign(query, sampleQuery);                                
                return sampleSchema.find( query, selectOmitFields)
                    .populate('patient', patientPopulate)
                    .populate('accountId', accountPopulate)
                    .exec();
            }, (error) =>{
                console.log(error);
            });                    
        },

        ICDNameSearch: function(searchText){
            if(searchText === "*" || searchText === ""){
                    return icdMasterSchema.find({},icdSelectField).limit(50)
                    .then(results =>{
                        return getNameResult(results);
                    });
            }else{
                return icdMasterSchema.find({short : new RegExp(searchText,'i')}, icdSelectField)
                .exec()
                .then(results =>{
                    return getNameResult(results);
                });                
            }
        },   

        ICDCodeSearch: function(searchText){
            if(searchText === "*" || searchText === ""){
                return icdMasterSchema.find({}, icdSelectField).limit(50)
                .then(results =>{                    
                    return getCodeResult(results);
                });                
            }else{
                return icdMasterSchema.find({code : new RegExp(searchText,'i')}, icdSelectField)
                .exec()
                .then(results =>{                
                    return getCodeResult(results);
                });                
            }
        },

        accountSearch: function(searchText){
            if(searchText === "*" || searchText === ""){
                return accountSchema.find({}, accountSelectField).limit(50)
                .then(results =>{                    
                    return populateAccountResult(results);
                });                
            }else{
                return accountSchema.find({name : new RegExp(searchText,'i')}, accountSelectField)
                .exec()
                .then(results =>{                
                    return populateAccountResult(results);
                });                
            }

        },

        specificationByName(key,searchText){                
            if(searchText === "*" || searchText === ""){
                return specificationSchema.find({key: key}, specificationOmitFields).limit(50)
                .then(results =>{                    
                    return getNameResult(results);
                });                
            }else{
                return specificationSchema.find({key: key, short : new RegExp(searchText,'i')}, specificationOmitFields)
                .exec()
                .then(results =>{                
                    return getNameResult(results);
                });                
            }
        },
         
        specificationByCode(key,searchText){
            if(searchText === "*" || searchText === ""){
                return specificationSchema.find({key: key}, specificationOmitFields).limit(50)
                .then(results =>{                    
                    return getCodeResult(results);
                });                
            }else{
                return specificationSchema.find({key: key, code : new RegExp(searchText,'i')}, specificationOmitFields)
                .exec()
                .then(results =>{                
                    return getCodeResult(results);
                });                
            }
        },                

        test(){
                return userSchema1.findOne({'userName': 'test@email.com'})
                .populate('accounts')
                .then(results =>{                                        
                    return results;
                });             
        },

        getReport(reportFileId, reportKey, res ){

            return new Promise(function(resolve, reject){
                streamReport(reportFileId, reportKey, (err, stream) => {
                    if(err){
                        return reject(err);
                    }
                    res.header('Content-Type', 'application/pdf');                    
                    res.header('Content-disposition', 'attachment; filename=report.pdf');                     
                    stream.pipe(res);
                    stream.on('close', function () {
                        return resolve('OK');
                    });
                    stream.on('error', function (error) {
                        return reject(error);
                    });                     
                });
            });        
        },

        deleteSampleFiles(sampleObjects){                        
            let limit = pLimit(1);
            let run = [];            
            sampleObjects.forEach(obj => {                
                run.push(deleteSample(obj.sampleId, obj.accountId));
            });            
            
            var results = [];
            var hasRejection  = 0;

            return Promise.all(run.map(p => {                      
                return p.then( resolved => {                    
                    results.push(resolved);                    
                    return results;
                }, rejected =>{                                            
                    results.push(rejected);       
                    hasRejection++;             
                    return results;
                });
            }))
            .then((data)=>{     
                if(hasRejection === sampleObjects.length){
                    return results;
                }
                
                let str = "";
                results.forEach( (d, i) =>{
                    str  = str + "[" + i + "] " + d + "\r\n";
                })                           
                return {status: "done", response: str}
            });
        }                  
    }
};
