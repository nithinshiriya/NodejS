/**
 * Created by Nitheen on 2/25/2015.
 */
'use strict';
var mongoose 		    = require('mongoose'),
    packageJson         = require('../package.json'),
    should              = require('should'),
    constant            = require('../general/application-constant'),
    appError            = require('../general/app-exception'),
    underscore        	= require('underscore'),
    accountManager      = require('../business-logic/account-manager'),
    accountFactory      = require('../interface_impl/account-factory'),
    patientManager      = require('../business-logic/patient-manager'),
    patientFactory      = require('../interface_impl/patient-factory'),
    emailId             = "testpatient@email.com",
    dbName              = 'patient';


describe('Patient : Test All patient methods', function () {
    var PatientMgr =  patientManager(new patientFactory());
    var AccountMgr =  accountManager(new accountFactory());
    var currentUser  = {};
    before(function(done){
        mongoose.connect(packageJson.stepscan.mongodbpathtest + dbName , function(err){
            if(err) throw err;
            addNewTestAccount(function(){
                setAccountAndUserId(emailId,function(){
                    done();
                });
            });
        });
    });
    after(function (done) {
        mongoose.connection.db.dropDatabase(function(err) {
            if(err){
                console.log(err);
            }
            mongoose.disconnect(done);
        });
    });

    function addNewTestAccount(next){
        var account =  {
            entityName  : 'GLOBAL Account addUser',
            userName	: 	emailId,
            password	: 	'password',
            firstName	: 	'Global',
            lastName	: 	'account'
        };
        AccountMgr.addAccount(account, function(err, message){
            should.equal(err, null);
            should.equal(message, constant.ok);
            next();
        });
    }

    function setAccountAndUserId(email, next){
        AccountMgr.getAccountAndUserId(email, function(err, user){
            should.equal(err, null);
            currentUser = user;
            next();
        })
    }

    describe('addPatient : Test case', function () {
        describe('Positive test case', function () {
            it('Should pass adding new patient', function (done) {
                var patient = {
                    firstName: 'James',
                    lastName: 'Bond',
                    middleName: 'T',
                    gender: 'Male',
                    weightInKilograms: 50.26,
                    heightInMeters: 100.25,
                    LegLengthRightInCM: 85,
                    LegLengthLeftInCM: 85,
                    birthDate: new Date()
                };
                PatientMgr.addPatient(currentUser, patient, function (err, msg) {
                    should.equal(err, null);
                    should.ok((msg).should.be.a.String);
                    done();
                });
            });
        });

        describe('Negative test case', function () {
            it('Should fail if null patient information passed', function (done) {
                var patient = null;
                PatientMgr.addPatient(currentUser, patient, function (err, msg) {
                    should.notEqual(err, null);
                    should.equal(err.message, appError.NULL_PARAMETER.value);
                    should.equal(msg, null);
                    done();
                });
            });
        });
    });

    describe('modifyPatient : Test case', function () {
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
});