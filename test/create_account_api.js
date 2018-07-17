/**
 * Created by Nitheen on 3/9/2015.
 */
'use strict';
var request 		= require('superagent');

module.exports = function(baseUrl, prefix) {
    var newAccount = {
        entityName: 'Test Account',
        userName: prefix + 'user@email.com',
        password: 'password',
        firstName: 'First',
        lastName: 'Last'
    };

    var newAccount1 = {
        entityName: 'Test Account-1',
        userName: prefix + 'user1@email.com',
        password: 'password',
        firstName: 'First',
        lastName: 'Last'
    };

    return {
        addTestAccount : function(next){
            request.post(baseUrl + 'register')
                .type('json')
                .send(newAccount)
                .end(function(res){
                    console.log(res);
                    should.equal(res.statusCode, 200);
                    request.post(baseUrl + 'login')
                        .auth(newAccount.userName, newAccount.password)
                        .type('json')
                        .end(function(res){
                            should.equal(res.status, 200);
                            next(res.body.token);
                        });
                });
        },
        addTestAccount1 : function(next){
            request.post(baseUrl + 'register')
                .type('json')
                .send(newAccount1)
                .end(function(res){
                    should.equal(res.statusCode, 200);
                    request.post(baseUrl + 'login')
                        .auth(newAccount1.userName, newAccount1.password)
                        .type('json')
                        .end(function(res){
                            should.equal(res.status, 200);
                            next(res.body.token);
                        });
                });
        },
        getToken : function(userName, password, next){
                    request.post(baseUrl + 'login')
                        .auth(userName, password)
                        .type('json')
                        .end(function(res){
                            next(res.body.token);
                        });
        }
    }
};