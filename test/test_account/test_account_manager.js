/**
 * Created by Nitheen on 3/6/2015.
 */
'use strict';

var mongoose 		= require('mongoose'),
    should          = require('should'),
    manageAccount   = require('../../business-logic/account-manager'),
    AccountImpl     = require('../../interface_impl/account-factory'),
    packageJson     = require('../../package.json'),
    constant        = require('../../general/application-constant'),
    appError        = require('../../general/application-logger'),
    dbName          = 'accountManager';

describe('AccountManager : Account Manager testing', function () {
    var AccountManager =  manageAccount(new AccountImpl());
    var account = {
        entityName: 'Test Account',
        userName: 'user@email.com',
        password: 'password',
        firstName: 'First',
        lastName: 'Last'
    };
    before(function(done){
        mongoose.connect(packageJson.stepscan.mongodbpathtest + dbName , function(err){
            if(err) throw err;
            done();
        });
    });
    after(function (done) {
        /* Note: Do not change 'accounts'. it should be the same as model. */
        mongoose.connection.db.dropDatabase(function (err) {
            if(err){ console.log(err);}
            mongoose.disconnect(done);
        });
    });

    describe('AddAccount', function(){
        describe('Positive Testing', function(){
            it('Should pass with valid input', function (done) {
            AccountManager.addAccount(account)
                .then(function(msg){
                    should.equal(msg, constant.ok);
                    done();
                }, function(error){
                    should.fail(error);
                    done();
                });
            });
        });
        describe('Negative Testing', function(){
           it('Should fail if entity Name is not passed', function(done){
               var dummyAccount = {
                   userName: 'user@email.com',
                   password: 'password',
                   firstName: 'First',
                   lastName: 'Last'
               };
               AccountManager.addAccount(dummyAccount)
                   .then(function(msg){
                       should.fail(msg);
                       done();
                   }, function(error){
                       should.notEqual(null, error);
                       should.equal(error.value.length, 1);
                       done();
                   });
           });
            it('Should fail on duplicate username and validate error message', function(done){
                var dummyAccount = {
                    entityName: 'duplicate test',
                    userName: 'duplicate@email.com',
                    password: 'password',
                    firstName: 'First',
                    lastName: 'Last'
                };
                AccountManager.addAccount(dummyAccount)
                    .then(function(msg){
                        should.equal(msg, constant.ok);
                        return 'OK';
                    })
                    .then(function(){
                        return AccountManager.addAccount(dummyAccount);
                    })
                    .then(function(){
                        done();
                    }, function(error){
                        should.notEqual(null, error);
                        should.equal(error.value.length, 1);
                        var expectedError = 'userName is duplicate :duplicate@email.com.';
                        should.equal(error.value[0], expectedError);
                        done();
                    });
            });
        });
    });
});