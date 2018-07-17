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
    packageJson     = require('../../package.json'),
    constant        = require('../../general/application-constant'),
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
                    entityName  :   'Standard2',
                    phoneNo     :   '902-111-2222',
                    address     :   '91 wt st , ch, pei',
                    userName	: 	'1001@email.com',
                    password	: 	'password',
                    firstName	: 	'Standard',
                    lastName	: 	'account',
                    tabs        :   ['TabSearch', 'TabGait', 'TabBalance'],
                    role        :   ['rlAdmin'],
                    headerColor :   '#ffffff',
                    permissions :   ['prUserManagement', 'prProjectSession', 'prClient', 'prComparativeStat']
        };
        request.post(baseUrl + 'register')
            .type('json')
            .send(account)
            .end(function(err, res){
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