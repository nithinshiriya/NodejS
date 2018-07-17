'use strict';

var accountTypes = require("../../general/account-types");
var should = require('should');

describe("Account types Testing", function(){
    describe("Get all account types", function(){
        it("Get All", function(done){
            var types = accountTypes.getAllAccountTypes();            
            should.notEqual(0, types.length);
            done();
        });
    });
    describe("Get Account owner default role", function(){
        it("Should fail on non account type passed", function(done){
            try {
                var role = accountTypes.getAccountOwnerDefaultRole("test");                            
                done("Should fail");                
            } catch (error) {                
                should.equal(true, error.toString().startsWith("Error: Invalid account type:test"));
                done();
            }
        });
        it("Should pass when account type passed", function(done){
            try {
                var role = accountTypes.getAccountOwnerDefaultRole("admin");
                should.notEqual(null, role);                            
                done();        
            } catch (error) {                
                should.equal(true, error.toString().startsWith("Error: Invalid account type:test"));
                done(error);
            }
        });        
    });    
});