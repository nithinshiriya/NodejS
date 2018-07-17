'use strict';
var mongoose            = require('mongoose');
var should              = require('should');
var packageJson         = require('../../package.json');
var fileService         = require('../../storage/file-service');
var dbName              = 'sampleFactory';

describe('Storage File Service Test', function() {
    var FileService = new fileService("D:/TEMP/sample");
    before(function(done){
        mongoose.connection.on('error', function(err) {});
        mongoose.connect(packageJson.stepscan.mongodbpathtest + dbName , function(err){
            if(err) throw err;
            done();
        });        
    });
      
    after(function (done) {
        mongoose.connection.db.dropDatabase(function (err) {
            if(err){ console.log(err); }
            mongoose.disconnect(done);
        });
    });    
    
    it('Should create Directory and Update database', function(done) {        
            var options = {
                accountId: 200000,
                patientId: 100000,
                createdBy: 'Test',
                createDate: new Date(),
                modifiedBy: 100,
                modifiedDate: new Date(),
                hasReport : true,
                fileExt: "h5"                    
            };     
            FileService.addFileByPath(null, "D:/TEMP/sample/balance.h5", "balance.h5", options, function(file, error){                                        
                    should.equal(error, null);
                    should.notEqual(file, null);                    
                    done(); 
            });   
    });
    
    it('Should return metadata info', function(done) {        
            var options = {
                accountId: 200000,
                patientId: 100000,
                createdBy: 'Test',
                createDate: new Date(),
                modifiedBy: 100,
                modifiedDate: new Date(),
                hasReport : true,
                fileExt: "h5"                    
            };     
            FileService.addFileByPath(null, "D:/TEMP/sample/balance.h5", "balance.h5", options, function(file, error){                                        
                    should.equal(error, null);
                    should.notEqual(file, null);    
                    FileService.findByQuery( {_id: file._id }, function(err, metadata){
                          should.equal(err, null); 
                          should.notEqual(metadata, null);
                          done();                                         
                    })                                                        
            });   
    });    
})