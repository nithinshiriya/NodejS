'use strict';
var mongoose            = require('mongoose'),
    should              = require('should'),
    packageJson         = require('../../package.json'),
    dbName              = 'SpecificationService',
    dummyAccount        = require('./../create_account'), 
    accountFactory      = require('../../interface_impl/account-factory'),
    specificationSchema     = require('../../models/mongoose-model').Specification,   
    specificationService          = require('../../specification/specification-service');
    
    
describe('ICD Service Test', function() {
    var DummyAccount = dummyAccount(new accountFactory());     
    var SpeciService =   specificationService();
    var currentUser; //currentUser.id, currentUser.userId
    
    before(function(done){
        mongoose.connection.on('error', function(err) {});

        mongoose.connect(packageJson.stepscan.mongodbpathtest + dbName, function(err){
            if(err) throw err;
            DummyAccount.addTestAccount()
                .then(function(account){
                    currentUser = account;                    
                    done();                                        
                }, function(error){                    
                    done(error)
                });            
        });        
    });
      
    after(function (done) {
        mongoose.connection.db.dropDatabase(function (err) {
            if(err){ console.log(err); }
            mongoose.disconnect(done);
        });
    });  
        
    it('Should pass adding new specification.', function(done) {
        var id = mongoose.Types.ObjectId();
        var specification = {            
            short: "test1",
            long: "long test",
            type: "general",            
            key: "key1"
        }
        SpeciService.add(id.toString(), specification)
        .then(function(res){
            should.deepEqual(res.code, 100);
            done();
        },function(error) {                      
             done(error);
         });
    });

    it('Should insert proper code to new specification.', function(done) {
        var id = mongoose.Types.ObjectId();
        var specification = {            
            short: "test1",
            long: "long test",
            type: "general",            
            key: "key2"
        }
        SpeciService.add(id.toString(), specification)
        .then((res) => {
            should.deepEqual(res.code, 100);   
            specification.short = "test2";
            return SpeciService.add(id.toString(), specification);
        })
        .then((res) => {
            should.deepEqual(res.code, 101);   
            done()
        }, (error) =>{
            done(error);
        })
    });    

    it('Should fail on duplicate entry.', function(done) {
        var id = mongoose.Types.ObjectId();
        var specification = {            
            short: "test1",
            long: "long test",
            type: "general",            
            key: "key3"
        }
        SpeciService.add(id.toString(), specification)
        .then((res) => {
            should.deepEqual(res.code, 100);               
            return SpeciService.add(id.toString(), specification);
        })
        .then((res) => {            
            done(res)
        }, (error) =>{
             should.deepEqual(error.code, 511);               
            done();
        })
    });    

    it('Should return all specificatin to the key passed.', function(done) {
        var id = mongoose.Types.ObjectId();
        var specification = {            
            short: "test1",
            long: "long test",
            type: "general",            
            key: "key4"
        }
        SpeciService.add(id.toString(), specification)
        .then((res) => {
            should.deepEqual(res.code, 100);
            specification.short= "test2"               
            return SpeciService.add(id.toString(), specification);
        })
        .then((res) => {            
            should.deepEqual(res.code, 101);
            specification.short= "test3"               
            return SpeciService.add(id.toString(), specification);
        })
        .then( (res)=>{
            should.deepEqual(res.code, 102);    
            return SpeciService.get(specification.key);
        })
        .then((resutls) =>{            
            should.deepEqual(resutls.length, 3);    
            done();
        }, (error) =>{
             should.deepEqual(error.code, 511);               
            done();
        })
    }); 


    it('Should pass get by id.', function(done) {
        var id = mongoose.Types.ObjectId();
        var saveResult = "";
        var specification = {            
            short: "test1",
            long: "long test",
            type: "general",            
            key: "key5"
        }
        SpeciService.add(id.toString(), specification)
        .then((res) => {
            should.deepEqual(res.code, 100);   
            saveResult = res._id;
            return SpeciService.getbyId(res._id);
        })
        .then((res) => {                        
            should.deepEqual(res._id, saveResult);   
            done()
        }, (error) =>{
            done(error);
        })
    });                                                                                 
});    