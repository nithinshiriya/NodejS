/**
 * Created by Nitheen on 3/20/2015.
 */
'use strict';
var mongoose 		    = require('mongoose'),
    packageJson         = require('../../package.json'),
    should              = require('should'),
    constant            = require('../../general/application-constant'),
    appError            = require('../../general/application-logger'),
    underscore        	= require('underscore'),
    dummyAccount        = require('./../create_account'),
    AccountFactory      = require('../../interface_impl/account-factory'),
    patientManager      = require('../../business-logic/patient-manager'),
    patientFactory      = require('../../interface_impl/patient-factory'),
    sampleManager      = require('../../business-logic/sample-manager'),
    sampleFactory      = require('../../interface_impl/sample-factory'),
    dbName              = 'sampleManager';

describe('Sample Manager: Test All sample methods', function () {
    var DummyAccount = dummyAccount(new AccountFactory());
    var PatientMgr =  patientManager(new patientFactory());
    var SampleMgr =  sampleManager(new sampleFactory(), new patientFactory());
    var currentUser  = {};
    var patient1 =  {
        firstName : 'james',
        lastName: 'Bond',
        middleName: 'B',
        gender: 'Male',
        weightInKilograms: 50.26,
        heightInMeters: 100.25,
        legLengthRightInCM: 85,
        legLengthLeftInCM: 85,
        birthDate: new Date()
    };
    var patient2 =  {
        firstName : 'Jimmy',
        lastName: 'Jhon',
        middleName: 'J',
        gender: 'Female',
        weightInKilograms: 50.26,
        heightInMeters: 100.25,
        legLengthRightInCM: 85,
        legLengthLeftInCM: 85,
        birthDate: new Date()
    };
    before(function(done){
        mongoose.connection.on('error', function(err) {});
        mongoose.connect(packageJson.stepscan.mongodbpathtest + dbName , function(err){
            if(err) throw err;
            DummyAccount.addTestAccount()
                .then(function(account){
                    currentUser = account;
                    Promise.all([
                        PatientMgr.addPatient(currentUser, patient1),
                        PatientMgr.addPatient(currentUser, patient2)
                    ])
                        .then(function(patientIds){
                            patient1._Id = patientIds[0];
                            patient2._Id = patientIds[1];
                            done();
                        })
                }, function(error){
                    console.log(error);
                    done(error)
                });
        });
    });
    after(function (done) {
        mongoose.connection.db.dropDatabase(function(err) {
            if(err){console.log(err); }
            mongoose.disconnect(done);
        });
    });

    describe('Test Add Sample', function(){
        describe('Positive Test case', function(){
            it('Should pass sample object with out metadata', function(done){
                var sample  = {
                    type : 'Gait',
                    hasReport: false,
                    patientId:  patient1._Id
                };
                SampleMgr.addSample(currentUser, sample)
                    .then(function(saveSample){
                        should.equal(saveSample.patientId.toString(),patient1._Id );
                        done();
                    }, function(error){
                        done(error);
                    })
            });
            it('Should pass sample object with metadata', function(done){
                var sample  = {
                    type : 'Gait',
                    hasReport: false,
                    patientId:  patient1._Id,
                    metadata: {
                        data: 'test'
                    }
                };
                SampleMgr.addSample(currentUser, sample)
                    .then(function(saveSample){
                        should.equal(saveSample.metadata.data,'test');
                        done();
                    }, function(error){
                        done(error);
                    })
            });
            it('Should pass sample object with metadata has overwrite values', function(done){
                var sample  = {
                    type : 'Gait',
                    hasReport: false,
                    patientId:  patient1._Id,
                    metadata: {
                        data: 'test',
                        weightInKilograms: 100
                    }
                };
                SampleMgr.addSample(currentUser, sample)
                    .then(function(saveSample){
                        should.equal(saveSample.metadata.weightInKilograms, sample.metadata.weightInKilograms);
                        done();
                    }, function(error){
                        done(error);
                    })
            })
        });
        describe('Negative Test case', function(){

        });
    })
});