/**
 * Created by Nitheen on 3/3/2015.
 */
'use strict';
var mongoose 		    = require('mongoose'),
    packageJson         = require('../package.json'),
    should              = require('should'),
    constant            = require('../general/application-constant'),
    appError            = require('../general/app-exception'),
    underscore        	= require('underscore'),
    accountFactory      = require('../interface_impl/account-factory'),
    emailId             = "testpatient@email.com",
    dbName              = 'accountfactory';

describe('AccountFactory : Account Factory prototype testing', function () {
    var AccountFactory = new accountFactory();
    before(function(done){
        mongoose.connect(packageJson.stepscan.mongodbpathtest + dbName , function(err){
            if(err) throw err;
            done();
        });
    });
    after(function (done) {
        /* Note: Do not change 'accounts'. it should be the same as model. */
        mongoose.connection.db.dropDatabase(function (err) {
            if(err){
                console.log(err);
            }
            mongoose.disconnect(done);
        });
    });

    describe('getAccountByUserId:', function (){
        it('Test user having multiple account', function(done) {
            var email = 'getAccountByUserId2@email.com';
            var account1 = {
                entityName: 'Account1',
                userName: 'getAccountByUserId1@email.com',
                password: 'password',
                firstName: 'Global',
                lastName: 'account'
            };

            var account2 = {
                entityName: 'Account2',
                userName: email,
                password: 'password',
                firstName: 'Global',
                lastName: 'account'
            };


            var accountId_1;
            var accountId_2;
            var userId;

            AccountFactory.addAccount(account1, function (err, resultAccount1) {
                should.equal(err, null);
                accountId_1 = resultAccount1._id;
                AccountFactory.addAccount(account2, function (err, resultAccount2) {
                    should.equal(err, null);
                    accountId_2 = resultAccount2._id;
                    AccountFactory.getAccountByEmail(email, function (err, user) {
                        should.equal(err, null);
                        userId = user._id;
                        AccountFactory.addAccountToUser(accountId_1,userId, function (err) {
                            should.equal(err, null);
                            AccountFactory.getUserAccountByUserId(accountId_1, userId, function(err, account){
                                should.equal(err, null);
                                should.equal(1, account.users.length);
                                should.deepEqual(accountId_1, account._id);
                                should.deepEqual(userId, account.users[0].user);
                                done();
                            });

                        });
                    })
                });
            });
        });

    });

});