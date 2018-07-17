/**
 * Created by Nitheen on 3/6/2015.
 */
'use strict';
var mongoose            = require('mongoose'),
    should              = require('should'),
    dummyAccount        = require('./../create_account'),    
    packageJson         = require('../../package.json'),
    patientFactory      = require('../../interface_impl/patient-factory'),
    accountFactory      = require('../../interface_impl/account-factory'),
    appError            = require('../../general/application-logger'),
    dbName              = 'patientFactory';

describe('Patient Factory testing', function () {
    var PatientFactory =  new patientFactory();
    var DummyAccount = dummyAccount(new accountFactory());
    var currentUser;

    var patient = {
     firstName : 'james',
     lastName: 'Bond',
     middleName: 'T',
     gender: 'Male',
     weightInKilograms: 50.26,
     heightInMeters: 100.25,
     legLengthRightInCM: 85,
     legLengthLeftInCM: 85,
     birthDate: new Date()
     };

    beforeEach(function(done){
        mongoose.connection.on('error', function(err) {});

        mongoose.connect(packageJson.stepscan.mongodbpathtest + dbName , function(err){
            if(err) throw err;
            DummyAccount.addTestAccount()
                .then(function(account){
                    currentUser = account;
                    done();
                }, function(error){
                    console.log(error);
                    done(error)
                });
        });

    });
    afterEach(function (done) {
        mongoose.connection.db.dropDatabase(function (err) {
            if(err){ console.log(err); }
            mongoose.disconnect(done);
        });
    });

    describe('AddPatient:', function () {
        describe('Positive Testing', function () {
            it('Should pass when required information passed', function(done){
                PatientFactory.addPatient(currentUser.id, currentUser.userId, patient)
                    .then(function(newPatient){
                        should.notEqual(null, newPatient);
                        should.deepEqual(newPatient.accountId, currentUser.id);
                        done();
                    },function(err){
                        done(err);
                    });
            });
        });
        describe('Negative Testing', function () {
            it('Should fail if Patient is null', function(done){
                PatientFactory.addPatient(currentUser.id, currentUser.userId, null)
                    .then(function(patient){
                        done(patient);
                    },function(err){
                        should.equal(err, appError.expectionList.NULL_PARAMETER);
                        done();
                    });
            });
            it('Should fail if required field is not passed', function(done){
                var _patient = {
                    middleName: 'T',
                    gender: 'Male',
                    weightInKilograms: 50.26,
                    heightInMeters: 100.25,
                    LegLengthRightInCM: 85,
                    LegLengthLeftInCM: 85,
                    birthDate: new Date()
                };
                PatientFactory.addPatient(currentUser.id, currentUser.userId, _patient)
                    .then(function(newPatient){
                        should.fail(newPatient);
                        done();
                    },function(err){
                        should.equal('ValidationError', err.name);
                        done();
                    });
            });
        });
    });

    describe('ModifyPatient', function(){
        describe('Positive Testing', function () {
            it('should pass modified patient', function(done){
            PatientFactory.addPatient(currentUser.id, currentUser.userId, patient)
                .then(function(newPatient){
                    var modPatient = {
                        _id : newPatient._id,
                        firstNam : 'Modified',
                        weightInKilograms : 200
                    };
                    modPatient.firstName = 'Modified';
                    modPatient.weightInKilograms = 200;
                    PatientFactory.modifyPatient(currentUser.userId, modPatient)
                        .then(function (modifiedPatient) {
                            should.equal(modifiedPatient.firstName, 'Modified');
                            should.equal(modifiedPatient.weightInKilograms, 200);
                            should.equal(modifiedPatient.lastName, 'Bond');
                            done();
                        })
                },function(err) {
                    should.fail(err);
                    done();
                });
            });
        });
        describe('Negative Testing', function () {
            it('should fail modified patient does not have id field', function(done){
                PatientFactory.modifyPatient(currentUser.userId, patient)
                    .then(function (modifiedPatient) {
                        should.fail(modifiedPatient);
                        done();
                    },function(err) {
                        should.deepEqual(err, appError.expectionList.NOT_FOUND);
                        done();
                    });
            });
        });
    });
});