/**
 * Created by Nitheen on 3/24/2015.
 */
'use strict';

//http://excellencenodejsblog.com/gridfs-using-mongoose-nodejs/
//https://www.npmjs.com/package/gridfs-stream

var fs = require('fs');
var Grid = require('gridfs-stream');

module.exports = function(mongoose) {

    Grid.mongo = mongoose.mongo;

    /*For saving files to mongo db*/

    function writeFile(path, fileName, fileId, options, next){
        var gfs = Grid(mongoose.connection.db);        
        var writeStream = gfs.createWriteStream({
            _id: fileId,
            filename: fileName,
            metadata: options
        });
        var readStream = fs.createReadStream(path).pipe(writeStream);
        writeStream.on('close', function (file) {
            return next(null, file);
        });
        writeStream.on('error', function (error) {
            console.log('writeStream:' + error);
            return next(error);
        });
        readStream.on('error', function(err) {
            console.log('readStream' + err);
            return next(error);
        });
    }

    return {
        addFileByPath : function(fileid, path, fileName, options, next){
            if(!fileid) {
                fileid = new mongoose.Types.ObjectId();
            }
            writeFile(path, fileName, fileid, options, next);
        },
        
        findByQuery : function(query, next){
            var gfs = Grid(mongoose.connection.db);
            gfs.files.findOne(query, function(err, file){
                 if(err){
                     return next(err);
                 }
                 next(err, file);
             }); 
        },

        streamFile : function(fileId, res, next){
            var gfs = Grid(mongoose.connection.db);
            var readStream = gfs.createReadStream({_id: fileId});
            readStream.pipe(res);
            readStream.on('close', function () {
                next(null, 'OK');
            });
            readStream.on('error', function (error) {
                next(error);
            });
        },

        deleteFile: function(fileId, next){
            return next(null);
        }
    }
};