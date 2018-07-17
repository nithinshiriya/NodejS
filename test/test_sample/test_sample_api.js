/**
 * Created by Nitheen on 3/23/2015.
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


describe('Test api route => Sample', function() {
    var DummyAccount = dummyAccount(baseUrl, 'samplettt');
    var token;
    before(function(done){
        DummyAccount.getToken('admin@email.com', 'password', function(msg){
            console.log(msg);
            token = msg;
            done();
        });
    });
    after(function (done) {
        done();
    });

    describe('Positive test case', function () {
        it('Call get Sample', function (done) {
            request.get(baseUrl + 'sample')
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