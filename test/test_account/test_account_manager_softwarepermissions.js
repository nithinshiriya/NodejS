/**
 * Created by Nitheen on 3/9/2015.
 */
'use strict';

var mongoose 		= require('mongoose'),
    should          = require('should'),
    dummyAccount    = require('./../create_account'),
    manageAccount   = require('../../business-logic/account-manager'),
    AccountImpl     = require('../../interface_impl/account-factory'),
    AccountFactory  = require('../../interface_impl/account-factory'),
    packageJson     = require('../../package.json'),
    constant        = require('../../general/application-constant'),
    appError        = require('../../general/application-logger'),
    dbName          = 'accountManagerSP';

describe('AccountManager : Account Manager testing', function () {
    var AccountManager =  manageAccount(new AccountImpl());
    var DummyAccount = dummyAccount(new AccountFactory());
    var currentUser;

    before(function(done){
        mongoose.connect(packageJson.stepscan.mongodbpathtest + dbName , function(err){
            if(err) throw err;
            DummyAccount.addTestAccount()
                .then(function(account){
                    currentUser = account;
                    done();
                });
        });
    });
    after(function (done) {
        /* Note: Do not change 'accounts'. it should be the same as model. */
        mongoose.connection.db.dropDatabase(function (err) {
            if(err){ console.log(err);}
            mongoose.disconnect(done);
        });
    });

    describe('getSoftwarePermissions', function(){
        describe('Positive Testing', function(){
            it('Should pass when valid information provided', function(done){
                AccountManager.getSoftwarePermissions(currentUser)
                    .then(function(msg){
                        should(msg).have.property('software');
                        should(msg).have.property('permissions');
                        done();
                    },function(error){
                        should.equal(null, error);
                        done();
                    });
            })
        });
        describe('Negative Testing', function(){
            it('Should fail if valid account id is not provided and validate the error', function(done){
                var user = {
                    id: currentUser.userId,
                    user_id  : currentUser.id
                };
                AccountManager.getSoftwarePermissions(user)
                    .then(function(msg){
                        should.fail(msg);
                        done();
                    }, function(error){
                        should.notEqual(null, error);
                        should.equal(error.code, 506);
                        done();
                    });
            });
        });
    });
});