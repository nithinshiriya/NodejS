/**
 * Created by Nitheen on 3/5/2015.
 */
'use strict';

/*client-side HTTP request library*/
var request 		= require('superagent'),
    should          = require('should'),
    dummyAccount    = require('../create_account_api'),
    appError        = require('../../general/application-logger'),
    packageJson     = require('../../package.json'),
    constant        = require('../../general/application-constant'),
    emailId         = "testpatientapi@email.com";

require('superagent-auth-bearer')(request);
var baseUrl = packageJson.stepscan.applicationurl;


describe('Test api route => Patient', function() {
    var DummyAccount = dummyAccount(baseUrl, 'patient');
    var token;

    before(function(done){
        DummyAccount.addTestAccount(function(msg){
           token = msg;
           done();
        });
    });
    after(function (done) {
        done();
    });

    describe('Positive test case', function () {
        it('Call get Patient', function (done) {
            request.get(baseUrl + 'patient')
                .authBearer(token)
                .type('json')
                .end(function(res){
                    console.log(res.body);
                    done();
                });
        });
        it('Call get PatientId', function (done) {
            request.get(baseUrl + 'patient?userID=252525&test=34343')
                .authBearer(token)
                .type('json')
                .end(function(res){
                    console.log(res.body);
                    done();
                });
        });
    });
    describe('Negative test case', function () {
    });
});