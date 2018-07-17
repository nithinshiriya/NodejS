/**
 * Created by Nitheen on 3/2/2015.
 */
/**
 * Created by Nitheen on 2/10/2015.
 */
'use strict';

/*client-side HTTP request library*/
var request 		= require('superagent'),
    should          = require('should'),
    packageJson     = require('../package.json'),
    constant        = require('../general/application-constant'),
    emailId         = "admin@email.com";

var baseUrl = packageJson.stepscan.applicationurl;


describe('Test api route => register', function() {
    before(function(done){
            done();
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
            entityName  :   'Stepscan testing',
            userName	: 	emailId,
            password	: 	'password',
            firstName	: 	'Global',
            lastName	: 	'account'
        };
        request.post(baseUrl + 'register')
            .type('json')
            .send(account)
            .end(function(res){
                console.log(res.body);
                should.equal(res.statusCode, 200);
                should.equal(res.body, constant.ok);
                next();
            });
    }

    describe('Positive test case', function () {
        it('Should register successfully', function (done) {
            addNewTestAccount(function(){
                done();
            });
        });
    });
});