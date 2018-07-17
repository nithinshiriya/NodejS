/**
 * Created by Nitheen on 3/5/2015.
 */
'use strict';
var mongoose 		    = require('mongoose'),
    packageJson         = require('../package.json'),
    should              = require('should'),
    constant            = require('../general/application-constant'),
    appError            = require('../general/application-logger'),
    underscore        	= require('underscore'),
    accountManager      = require('../business-logic/account-manager'),
    accountFactory      = require('../interface_impl/account-factory'),
    patientManager      = require('../business-logic/patient-manager'),
    patientFactory      = require('../interface_impl/patient-factory'),
    emailId_1             = "testpatientget_1@email.com",
    emailId_2             = "testpatientget_2@email.com",
    dbName              = 'patientGet';


describe('Patient GET : Test patient GET methods', function () {
    var PatientMgr =  patientManager(new patientFactory());
    var AccountMgr =  accountManager(new accountFactory());
    var currentUser  = {};
    before(function(done){
        mongoose.connect(packageJson.stepscan.mongodbpathtest + dbName , function(err) {
            if (err) throw err;
            var anyError = false;
            function test(){
                return q.all([
                    addNewTestAccount('test 1 account', emailId_1),
                    addNewTestAccount('test 2 account', emailId_2)
                    ])
            }
            q.fcall(test).then(function(results){
                console.log(results);
               done();
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

    function addNewTestAccount(name, email){
        var account =  {
            entityName  :   name,
            userName	: 	email,
            password	: 	'password',
            firstName	: 	'Global',
            lastName	: 	'account'
        };
        AccountMgr.addAccount(account, function(err, message){
            var deferred = q.defer();
            //if(err) deferred.reject(err);
            deferred.reject('fail');
            console.log('called');
            return deferred.promise;
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
                done();
            });
        });

        describe('Negative test case', function () {

        });
    });
});