/**
 * Created by Nitheen on 3/13/2015.
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
    dbName              = 'patientManager';


describe('Patient Manager: Test All patient methods', function () {
    var DummyAccount = dummyAccount(new AccountFactory());
    var PatientMgr =  patientManager(new patientFactory());
    var currentUser  = {};
    before(function(done){
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
    after(function (done) {
        mongoose.connection.db.dropDatabase(function(err) {
            if(err){console.log(err); }
            mongoose.disconnect(done);
        });
    });

    describe('addPatient : Test case', function () {
        describe('Positive test case', function () {
            it('Should pass adding new patient', function (done) {
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
                PatientMgr.addPatient(currentUser, patient)
                    .then(function(patient){
                        should.ok((patient).should.be.a.String);
                        done();
                    }, function(error){
                        done(error);
                    });
            });
        });

        describe('Negative test case', function () {
            it('Should fail and valid the the error code', function (done) {
                var patient = {
                    ID: null,
                    FirstName: 'Jimmy',
                    LastName: 'Jhon',
                    MiddleInitial: 's',
                    Gender: null,
                    Code: '3545f',
                    Birthdate: '0001-01-09T04:00:00Z',
                    WeightInKilograms: 0,
                    HeightInMeters: 0,
                    LegLengthRightMeasuredInCM: 0,
                    LegLengthLeftMeasuredInCM: 0,
                    Ethnicity: 'dfd',
                    Description: 'fgfg'
                };
                PatientMgr.addPatient(currentUser, patient)
                    .then(function(patient){
                        done(patient);
                    }, function(error){
                        should.equal(error.code, 2000);
                        done();
                    });
            });
            it('Should fail if null patient information passed', function(done){
                PatientMgr.addPatient(currentUser, null)
                .then(function(patient){
                    done(patient);
                },function (error) {
                    should.equal(error, appError.expectionList.NULL_PARAMETER);
                    done();
                });
            });
            it('Should fail invalid gender passed and valid the error', function (done) {
                var patient = {
                    "_id": null,
                    "firstName": "Jimmy",
                    "lastName": "Jhon",
                    "middleName": "J",
                    "gender": "M",
                    "code": "1245255",
                    "birthDate": "0001-01-17T00:00:00",
                    "weightInKilograms": 0,
                    "heightInMeters": 0,
                    "legLengthRightInCM": 0,
                    "legLengthLeftInCM": 0,
                    "ethnicity": "NJJJ",
                    "description": "test",
                    "ValidateError": null
                };
                PatientMgr.addPatient(currentUser, patient)
                    .then(function(patient){
                        done(patient);
                    }, function(error){
                        should.equal(error.code, 2000);
                        done();
                    });
            });

        });
    });

/*    describe('modifyPatient : Test case', function () {
        function addPatient(next){
            var patient = {
                firstName: 'modifyPatient',
                lastName: 'MP',
                middleName: 'M',
                gender: 'Male',
                weightInKilograms: 60.26,
                heightInMeters: 110.25,
                LegLengthRightInCM: 90,
                LegLengthLeftInCM: 90,
                birthDate: new Date()
            };
            PatientMgr.addPatient(currentUser, patient, function (err, msg) {
                should.equal(err, null);
                should.ok((msg).should.be.a.String);
                next(msg);
            });
        }

        describe('Positive test case', function () {
            it('Should pass if partial data passed in modified patient', function (done) {
                addPatient(function(patientId){
                    PatientMgr.getPatientByPatientId(patientId, function(err, patient){
                        should.equal(err, null);
                        var modPatient = {
                            _id: patient._id,
                            firstName: 'TestName',
                            lastName: 'TM',
                            gender: 'Female',
                            birthDate: new Date()
                        };
                        PatientMgr.modifyPatient(currentUser, modPatient, function(err, msg){
                            should.equal(err, null);
                            PatientMgr.getPatientByPatientId(patientId, function(err, modifiedpatient){
                                should.equal(err, null);
                                should.equal(modifiedpatient.firstName, modPatient.firstName);
                                done();
                            });
                        });
                    });
                });
            });
        });

        describe('Negative test case', function () {
            it('Should fail if modified patient does not have id field', function (done){
                addPatient(function(patientId){
                    PatientMgr.getPatientByPatientId(patientId, function(err){
                        should.equal(err, null);
                        var modPatient = {
                            firstName: 'TestName',
                            lastName: 'TM',
                            gender: 'Female',
                            birthDate: new Date()
                        };
                        PatientMgr.modifyPatient(currentUser, modPatient, function(err){
                            should.notEqual(err, null);
                            should.equal(err.code, appError.ID_FIELD_NOT_FOUND.code);
                            done();
                        });
                    });
                });
            });
            it('Should not take extra fields in modified patient', function (done){
                addPatient(function(patientId){
                    PatientMgr.getPatientByPatientId(patientId, function(err, patient){
                        should.equal(err, null);
                        var modPatient = {
                            _id: patient._id,
                            firstName: 'TestFieldTest',
                            lastName: 'TM',
                            gender: 'Female',
                            birthDate: new Date(),
                            testField: 'testField' //New Field
                        };
                        PatientMgr.modifyPatient(currentUser, modPatient, function(err){
                            should.equal(err, null);
                            PatientMgr.getPatientByPatientId(patientId, function(err, modifiedPatient){
                                should.equal(err, null);
                                modifiedPatient.should.not.have.property('testField');
                                done();
                            });
                        });
                    });
                });
            });
        });
    });

    describe('getPatientById : Test case', function () {

    });

    describe('getPatientById : Test case', function () {

    });*/
});