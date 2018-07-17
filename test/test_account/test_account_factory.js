/**
 * Created by Nitheen on 3/3/2015.
 */
'use strict';
var mongoose 		    = require('mongoose'),
    packageJson         = require('../../package.json'),
    should              = require('should'),
    constant            = require('../../general/application-constant'),
    appError            = require('../../general/application-logger'),
    accountFactory      = require('../../interface_impl/account-factory'),
    dbName              = 'accountFactory';        
    
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
            if(err){ console.log(err);}
            mongoose.disconnect(done);
        });
    });

    describe('addAccount:', function (){
        describe('Positive Testing', function(){
            it('Should Pass by passing valid account details', function(){
                var newAccount = {
                    entityName  :   'Standard2',
                    phoneNo     :   '902-111-2222',
                    address     :   '91 wt st , ch, pei',
                    userName	: 	'1000@email.com',
                    password	: 	'password',
                    firstName	: 	'Standard',
                    lastName	: 	'account',
                    tabs        :   ['TabSearch', 'TabGait', 'TabBalance'],
                    type        :   'admin',
                    headerColor :   '#ffffff',
                    permissions :   ['prUserManagement', 'prProjectSession', 'prClient', 'prComparativeStat']
                };
                return AccountFactory.addAccount(newAccount)
                    .then(function(account){
                       should.notEqual(null, account);                        
                    },function(error){
                        should.fail(error);                        
                    });
            });
        });
        describe('Negative Testing', function(){
            it('Should fail if account type is not passed', function(){
                var newAccount = {
                    userName: 'user@email.com',
                    password: 'password',
                    firstName: 'First',
                    lastName: 'Last'
                };
               return AccountFactory.addAccount(newAccount)
                    .then(function(account){
                        should.fail(account);                                                
                    },function(error){                                                                             
                        should.equal(error.toString().startsWith("Error: Invalid account type"), true);                        
                    });
            });            
            it('Should fail if entityName is not passed', function(){
                var newAccount = {
                    userName: 'user@email.com',
                    password: 'password',
                    firstName: 'First',
                    lastName: 'Last',
                    type:   'client',
                };
                return AccountFactory.addAccount(newAccount)
                    .then(function(account){
                        should.fail(account);
                    },function(error){                        
                        should.notEqual(null, error);
                        should.equal('ValidationError', error.name);                        
                    });
            });
            it('Should fail if userName is not passed', function(){
                var newAccount = {
                    entityName: 'Test Account',
                    password: 'password',
                    firstName: 'First',
                    lastName: 'Last',
                    type:   'client',
                };
                return AccountFactory.addAccount(newAccount)
                    .then(function(account){
                        should.fail(account);                        
                    },function(error){
                        should.notEqual(null, error);
                        should.equal('ValidationError', error.name);
                    });
            });
            it('Should fail on duplicate user name', function(){
                var newAccount = {
                    entityName: 'Test Account',
                    userName: 'duplicate@email.com',
                    password: 'password',
                    firstName: 'First',
                    lastName: 'Last',
                    type:   'client',
                };
                return AccountFactory.addAccount(newAccount)
                    .then(function(account){
                        should.notEqual(null, account);
                        return true;
                    })
                    .then(function() {
                        return AccountFactory.addAccount(newAccount);
                    })
                    .then(function(dupAccount) {
                        should.fail(dupAccount);                        
                    }, function(error){                        
                        should.notEqual(null, error);
                        should.equal('ValidationError', error.name);                        
                    });
            });
        });
    });

});