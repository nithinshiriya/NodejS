var standardFactory  = require('../interface_impl/standard-factory'),
        accountSchema    = require('../models/mongoose-model').Account,
        fs = require("fs"),
        path = require('path'),
        fileService = require('../database/file-service'),
        dbConnection = require('../database/db-connection');


var FileService = new fileService(dbConnection.getMongoose());
var Normative = new standardFactory(FileService);

module.exports = function(grunt) {
     grunt.registerTask("normativeTask", function(args){
         var task = grunt.config('normativeTask').task;     
         var done = this.async();
         var fileBasePath =  task.filePath;
         var allAcoounts;
         var version = "v1";
          accountSchema.find()
            .select("_id users")
            .then((accounts)=>{
                allAcoounts=  accounts;
                var promiseArray = [];
                accounts.forEach((account) => {
                    if (account.users.length !== 0){
                        promiseArray.push(cleanOldNormatives(account._id, account.users[0].user, version));                    
                    }
                });               
                grunt.log.ok("cleanOldNormatives");
                return Promise.all(promiseArray);
            })
            .then((results) =>{
                grunt.log.ok("Total Delete count => " , results.length);
                grunt.log.ok("Delete Result => " , results );
                
                var promiseArray = [];
                allAcoounts.forEach((account) => {
                    if (account.users.length !== 0){
                        promiseArray.push(deleteMasterNormatives(account._id, account.users[0].user, version));
                    }
                });  

                grunt.log.ok("deleteMasterNormatives");
                return Promise.all(promiseArray);                
            })
            .then((results) =>{
                grunt.log.ok("Total Delete count => " , results.length);
                grunt.log.ok("Delete Result => " , results );

                var promiseArray = [];
                allAcoounts.forEach((account) => {
                    if (account.users.length !== 0){
                        promiseArray.push(saveAllNormatives(fileBasePath, account._id, account.users[0].user, version));                    
                    }
                });
                grunt.log.ok("saveAllNormatives");
                return Promise.all(promiseArray);                 
            })
            .then((results) =>{
                  grunt.log.ok("Number of files updated => " , results.length );
                  done();
            }, (error) =>{
                 grunt.log.error(error); 
                 done();
            });
     });
}


function getAllFiles(filePath){     
    return new Promise((resolve, reject) => {
        var files = [];
        fs.readdirSync(filePath).forEach((file) => {
            if (path.extname(file) === ".json") {
                files.push(filePath + file);
            }
        });        
        resolve(files);
    });
}


function cleanOldNormatives(accountId, userId, versionNo){
     Normative.getStandardList(accountId)
     .then((list) =>{
         list.forEach((item) =>{
            if(!item.version || item.version !== versionNo){
               return Normative.deleteStandard(accountId, userId, item._id);
            }
         });
     })
}

function deleteMasterNormatives(accountId, userId, versionNo){
     Normative.getStandardList(accountId)
     .then((list) =>{
         list.forEach((item) =>{
             if(item.type === "Global"){            
               return Normative.deleteStandard(accountId, userId, item._id);
            }
         });
     })    
}

function saveAllNormatives(fileBasePath, accountid, userId, version){
    return getAllFiles(fileBasePath)
    .then((files)=>{
        var promiseRange = [];
        files.forEach((file) =>{
            promiseRange.push(saveNormative(file, accountid, userId, version));
        });
        return Promise.all(promiseRange);
    });
}

function saveNormative(file, accountid, userId, version){
    return new Promise((resolve, reject) => {
        var content = fs.readFileSync(file, 'utf8');
        fs.readFile(file, 'utf8', (err, data) =>{
            if(err){
                return reject(err);
            }
            var normative = JSON.parse(content);
            var type = normative.moduleType;
            var h5FileName =  normative.h5FileName;             
            
            delete normative.moduleType;                            
            delete normative.h5FileName;
            //if(normative.Height === "Unknown") normative.Height  = 0;
            //if(normative.Age === "Unknown") normative.Age  = 0;
            //if(normative.Weight === "Unknown") normative.Weight  = 0;

            normative.version = version;

            return Normative.saveStandard(accountid, userId, type,  normative, "Global")
                .then((n) => {         
                    if (h5FileName) {
                        var replaceFileName = path.basename(file);                        
                        var uploadFilePath = file.replace(replaceFileName, h5FileName);                                                
                        return Normative.AddFile(accountid, userId, n._id, uploadFilePath)
                            .then((fileId) => {                                
                                if (fileId) {
                                    return resolve(n);
                                } else {                                    
                                    return resolve(n);
                                }
                            });
                    } else {
                        return resolve(n);
                    }
                
            });
        });
    });
}