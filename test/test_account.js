/*global describe, it */
'use strict';
var mongoose 		= require('mongoose'),
    should          = require('should'),
    manageAccount   = require('../business-logic/account-manager'),
    AccountImpl     = require('../interface_impl/account-factory'),
    packageJson     = require('../package.json'),
    constant        = require('../general/application-constant'),
    appError        = require('../general/application-logger'),
    emailId         = "testaddaccount@email.com",
    dbName          = 'addAccount';

describe('addAccount : Test Adding new account', function () {
    var AccountManager =  manageAccount(new AccountImpl());

    before(function(done){
        mongoose.connect(packageJson.stepscan.mongodbpathtest + dbName , function(err){
            if(err) throw err;
            console.log('DB: Connected to test mongodb server.');
            done();
        });
    });

    /**
     * [After compleeting all test cases]
     * @param  {Function} done
     * @return {[type]}
     */
    after(function (done) {
        /* Note: Do not change 'accounts'. it should be the same as model. */
        mongoose.connection.db.dropDatabase(function (err) {
            if(err){
                console.log(err);
            }
            mongoose.disconnect(done);
        });
    });

    describe('addAccount : Positive Test cases', function () {
        it('Should pass when required field provided', function (done) {
            var account =  {
                entityName: 'GLOBAL Account addUser',
                    userName	: 	emailId,
                    password	: 	'password',
                    firstName	: 	'Global',
                    lastName	: 	'account'
            };
            AccountManager.addAccount(account, function(err, message){
                should.equal(err, null);
                should.equal(message, constant.ok);
                done();
            });
        });
    });

    describe('addAccount : Negative Test cases', function () {
        it('Should fail if null account passed', function (done) {
            var account = null;
            AccountManager.addAccount(account, function(err, message){
                should.notEqual(err, null);
                should.equal(err.code, appError.NULL_PARAMETER.code);
                should.equal(message, undefined);
                done();
            });
        });

        it('Should fail if invalid types are passed', function (done) {
            var account =  {
                entityName  :   'account-2',
                userName	: 	'email2@email.com',
                password	: 	'password',
                firstName	: 	'Global',
                lastName	: 	'account',
                types       :   ['test']
            };
            AccountManager.addAccount(account, function(err, message){
                should.notEqual(err, null);
                should.equal(err.code, appError.INVALID_TYPE.code);
                should.equal(message, undefined);
                done();
            });
        });

        it('Should fail if valid and invalid types are passed', function (done) {
            var account =  {
                entityName  :   'account-2',
                userName	: 	'email2@email.com',
                password	: 	'password',
                firstName	: 	'Global',
                lastName	: 	'account',
                types       :   [constant.ACCOUNT_TYPES.ac_stepscan_empty, 'test']
            };
            AccountManager.addAccount(account, function(err, message){
                should.notEqual(err, null);
                should.equal(err.code, appError.INVALID_TYPE.code);
                should.equal(message, undefined);
                done();
            });
        });

    });
});
