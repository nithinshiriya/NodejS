/**
 * Created by Nitheen on 3/12/2015.
 */
'user strict';

var mongoose 		= require('mongoose'),
    should          = require('should'),
    dummyAccount    = require('./../create_account'),
    manageAccount   = require('../../business-logic/account-manager'),
    AccountImpl     = require('../../interface_impl/account-factory'),
    AccountFactory  = require('../../interface_impl/account-factory'),
    packageJson     = require('../../package.json'),
    constant        = require('../../general/application-constant'),
    appError        = require('../../general/application-logger'),
    dbName          = 'accountManagerPS';

describe('AccountManager : Project Session testing', function () {
    var AccountManager = manageAccount(new AccountImpl());
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

    describe('AddProject', function(){
        var newProject = {
            isDefault : false,
            name: 'DefaultProject'
        };
        before(function(done){
            AccountManager.addProject(currentUser,newProject)
                .then(function(){
                    done();
                },function(error){
                   done(error);
                });
        });
        describe('Error message test', function(){
            it('Validate duplicate error message', function(done){
                AccountManager.addProject(currentUser,newProject)
                    .then(function(id){
                        done(id);
                    }, function(error){
                        done();
                    });
            });

        })
    })
});