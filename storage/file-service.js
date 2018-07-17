/**
 * Created by Nitheen on 3/24/2015.
 */
'use strict';

//http://excellencenodejsblog.com/gridfs-using-mongoose-nodejs/
//https://www.npmjs.com/package/gridfs-stream

var rfs = require('node-fs');
var fs = require('fs');
var path = require('path');
var FileTable =  require("./filetable").FileTable;
var logger =  require("../general/application-logger");

/**
 * mongoose : Mongoose connetion.
 * directoryPath : File storage base directory path.
 */
module.exports = function(directoryPath) {
    
    function directioryExist(path) {
        try{
            var fs = require('fs');         
            var stat = fs.statSync(path);
            return true;
        }catch(ex){            
            return false;
        }
    }    

    function writeFile(sourceFile, fileName, fileId, options, next){
        var _fileTable = new FileTable();
        if(fileId){
            _fileTable._id = fileId;
        }
        _fileTable.metadata =  options;
                                       
        var year = options.modifiedDate.getFullYear();        
        var month = options.modifiedDate.getMonth() + 1;
        var day = options.modifiedDate.getDate();                
        var saveFileName = options.modifiedDate.getTime() + "." +  options.fileExt;        
        
        var filePath = year + "/" + month + "/" + day + "/"  + options.accountId + "/" +  options.patientId;        
        _fileTable.filePath = path.join(filePath, saveFileName);
        
        filePath = path.join(directoryPath , filePath);                
        if(!directioryExist(filePath)){
            rfs.mkdirSync(filePath, "0777", true);            
        }
                
        filePath =  path.join(filePath, saveFileName);   
                   
               
        var readStream = fs.createReadStream(sourceFile);
        readStream.on('error', function(err) {
            return next(error);
        });
        
        var writeStream = fs.createWriteStream(filePath);                              
        writeStream.on('close', function (file) {                                    
            _fileTable.save(function(err, file) {                                
                 return next(err, file);
            });                       
        });
        writeStream.on('error', function (error) {            
            return next(error);
        });
        readStream.pipe(writeStream);
    }

    return {
        addFileByPath : function(fileid, path, fileName, options, next){
            writeFile(path, fileName, fileid, options, next);
        },

        findByQuery : function(query, next){
             FileTable.findOne(query, function(err, file){
                 if(err){
                     return next(err);
                 }
                 next(err, file);
             })
        },

        streamFile : function(fileId, res, next){                        
            FileTable.findOne({ '_id': fileId}, function(err, file){                
                if(err){
                   return next(err);
                }                
                var filePath = path.join(directoryPath, file.filePath);                
                var readStream = fs.createReadStream(filePath);                
                readStream.on('close', function () {
                    next(null, 'OK');
                });
                readStream.on('error', function (error) {
                    next(error);
                });             
                readStream.pipe(res);
            });            
        },

        deleteFile: function(fileId, next){
            return next(null);
        }
    }
};