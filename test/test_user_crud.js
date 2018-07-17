/**
 * Created by Nitheen on 2/9/2015.
 */
'use strict';
var mongoose 		= require('mongoose'),
    should          = require('should'),
    manageAccount   = require('../business-logic/account-manager'),
    AccountImpl     = require('../interface_impl/account-factory'),
    packageJson     = require('../package.json'),
    constant        = require('../general/application-constant'),
    appError        = require('../general/application-logger'),
    emailId         = "testadduser@email.com",
    dbName          = 'UserCRUD';

describe('User CRUD operation testing', function () {
    this.timeout(25000);
    var AccountManager =  manageAccount(new AccountImpl());

    before(function(done){
        mongoose.connect(packageJson.stepscan.mongodbpathtest + dbName , function(err){
            if(err) throw err;
            addNewTestAccount(function(){
                done();
            });
        });
    });
    after(function (done) {
        /* Note: Do not change 'accounts'. it should be the same as model. */
        mongoose.connection.db.dropDatabase(function(err) {
            if(err){
                console.log(err);
            }
            mongoose.disconnect(done);
        });
    });
    /**
     * Adding dummy account for testing.
     * @param next
     */
    function addNewTestAccount(next){
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
            next();
        });
    }

    describe('addUser : Test case', function () {
        describe('Positive test case', function () {
            it('Should pass when required information provided', function(done){
                AccountManager.getAccountId(emailId, function(err, accountId){
                    should.equal(err, null);
                    var userAccount = {
                        'id' : accountId
                    };
                    var newUser = {
                            userName	: 	'testaddusersuccess@email.com',
                            password	: 	'password',
                            firstName	: 	'Global',
                            lastName	: 	'account',
                            roles       :   [constant.ROLE_TYPES.rlSiteAdmin]
                    };
                    AccountManager.addUser(userAccount, newUser, function(err, message){
                        should.equal(err, null);
                        should.equal(message, constant.ok);
                        done();
                    });
                });
            });

        });
        describe('Negative test case', function () {
            it('Should fail if parameter is null', function(done){
                AccountManager.getAccountId(emailId, function(err, accountid){
                    should.equal(err, null)
                    var userAccount = {
                        'id' : accountid
                    };
                    AccountManager.addUser(userAccount, null, function(err, message){
                        should.notEqual(err, null);
                        should.equal(err.code, appError.NULL_PARAMETER.code);
                        should.equal(message, undefined);
                        done();
                    });
                });
            });

        });
    });

});