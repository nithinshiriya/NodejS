/**
 * Created by Nitheen on 4/8/2015.
 */
'use strict';

var mongoose            = require('mongoose'),    
    underscore        	= require('underscore'),
    should              = require('should'),
    Dummy               = require('./../dummy_creator')(),
    packageJson         = require('../../package.json'),
    accountFactory      = require('../../interface_impl/account-factory'),
    appError            = require('../../general/application-logger'),
    constant            = require('../../general/application-constant'),
    dbName              = 'accountFactoryUser';

describe('Account Factory : User', function(){
    var AccountFactory = new accountFactory();
    var currentUser;
    before(function(done){
        mongoose.connection.on('error', function(err) {});
        mongoose.connect(packageJson.stepscan.mongodbpathtest + dbName , function(err){
            if(err) throw err;
            Dummy.addTestAccount()
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
        mongoose.connection.db.dropDatabase(function (err) {
            if(err){ console.log(err); }
            mongoose.disconnect(done);
        });
    });

    describe('Test Add User', function(){
        it('Should pass when all information provided', function(done){
            var user = {
                userName : 'afUserNew1@email.com',
                password : 'password',
                firstName: 'first name',
                lastName : 'last name'
            };
            AccountFactory.addUser(currentUser.id, user)
                .then(function(){
                    done();
                }, function(err){
                    done(err);
                })
        });
        it('Should fail on duplicate user', function(done){
            var user = {
                userName : 'afUserNewduplicate@email.com',
                password : 'password',
                firstName: 'first name',
                lastName : 'last name'
            };
            AccountFactory.addUser(currentUser.id, user)
                .then(function(){
                    return AccountFactory.addUser(currentUser.id, user);
                })
                .then(function(result){
                    done(result);
                }, function(err){
                    should.equal(err.message, 'User validation failed');
                    done();
                });
        })
    });
    describe('Test Delete User', function(){
        it('Should pass deleting the user', function(done){
            var user = {
                userName : 'deleteuser@email.com',
                password : 'password',
                firstName: 'first name',
                lastName : 'last name'
            };
            AccountFactory.addUser(currentUser.id, user)
                .then(function(newUser){
                    return AccountFactory.deleteUser(currentUser.id, newUser._id);
                })
                .then(function(deletedUser){
                    should.equal(deletedUser.accounts.length, 0);
                    should.equal(deletedUser.userName, 'DELETED_' + user.userName);
                    done();
                }, function(error){
                    done(error);
                })
        });
    });
    describe('Test Update user account permissions', function(){
        it('Should pass deleting the user', function(done){
            var user = {
                userName : 'userPermnissions@email.com',
                password : 'password',
                firstName: 'first name',
                lastName : 'last name'
            };
            AccountFactory.addUser(currentUser.id, user)
                .then(function(newUser){
                    return AccountFactory.UpdateUserAccountPermissions(currentUser.id, newUser._id, [constant.PERMISSIONS.allPermissions[0]]);
                })
                .then(function(modifyUser){
                    should.equal(modifyUser.users[0].permissions.length, 1);
                    done();
                }, function(error){
                    done(error);
                })
        });
        it('Should fail if non array passed in permission', function(done){
            var user = {
                userName : 'invalidPermission@email.com',
                password : 'password',
                firstName: 'first name',
                lastName : 'last name'
            };
            AccountFactory.addUser(currentUser.id, user)
                .then(function(newUser){
                    return AccountFactory.UpdateUserAccountPermissions(currentUser.id, newUser._id, 'string');
                })
                .then(function(result){
                    done(result);
                }, function(error){
                    should.equal(error.value , appError.expectionList.INVALID_ARGUMENT_TYPE.value);
                    done();
                })
        });
    });

    describe('Test get all user', function(){
        it('Should pass get all user', function(done){
         AccountFactory.getAllUsers(currentUser.id)
            .then(function(users){
                 console.log(users);
                 should.notEqual(users.length, 0);
                done();
            },function(error){
                done(error);
            })
        })
    });


});