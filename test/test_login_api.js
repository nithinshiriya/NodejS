/**
 * Created by Nitheen on 2/10/2015.
 */
'use strict';

/*client-side HTTP request library*/
var request 		= require('superagent'),
    should          = require('should'),
    appError        = require('../general/application-logger'),
    packageJson     = require('../package.json'),
    constant        = require('../general/application-constant'),
    emailId         = "testapilogin@email.com";

require('superagent-auth-bearer')(request);
var baseUrl = packageJson.stepscan.applicationurl;


describe('Test api route => login', function() {
    before(function(done){
        addNewTestAccount(function(){
            done();
        });
    });
    after(function (done) {
        done();
    });
    /**
     * Adding dummy account for testing.
     * @param next
     */
    function addNewTestAccount(next){
        var account =  {
            entityName  : 'GLOBAL Account addUser',
            userName	: 	emailId,
            password	: 	'password',
            firstName	: 	'Global',
            lastName	: 	'account'
        };
        request.post(baseUrl + 'register')
            .type('json')
            .send(account)
            .end(function(res){
                should.equal(res.statusCode, 200);
                should.equal(res.body, constant.ok);
                next();
            });
    }

    describe('Positive test case', function () {
        it('Should login successfully', function (done) {
            request.post(baseUrl + 'login')
                .auth(emailId, 'password')
                .type('json')
                .end(function(res){
                    should.equal(res.status, 200);
                    done();
                });
        });
    });
    describe('Negative test case', function () {
        it('Should fail when invalid user name provided', function (done) {
            request.post(baseUrl + 'login')
                .auth('tt@email.com', 'password')
                .type('json')
                .end(function(res){
                    should.equal(res.body.message, appError.expectionList.USER_NOT_FOUND.value);
                    should.equal(res.status, 500);
                    done();
                });
        });
    });
});