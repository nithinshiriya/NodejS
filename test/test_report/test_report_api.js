/**
 * Created by Nitheen on 4/1/2015.
 */
var request 		= require('superagent'),
    should          = require('should'),
    dummyAccount    = require('../create_account_api'),
    appError        = require('../../general/application-logger'),
    packageJson     = require('../../package.json'),
    constant        = require('../../general/application-constant'),
    emailId         = "testpatientapi@email.com";

require('superagent-auth-bearer')(request);
var baseUrl = packageJson.stepscan.applicationurl;

describe('Test api route => Report', function() {
    var DummyAccount = dummyAccount(baseUrl, 'report');
    var token;

    before(function(done){
        DummyAccount.getToken('admin@email.com', 'password', function(msg){
            token = msg;
            done();
        });
    });
    after(function (done) {
        done();
    });

    describe('Get Report by id', function(){
        it('Should return valid report', function(done){
            request.get(baseUrl + '/report/GaitReport')
                .authBearer(token)
                .type('json')
                .end(function(res){
                    console.log(res.body);
                    done();
                });
        });
    })
});