'use strict';

module.exports = function(){    
    var accounts = {
        "admin" :  {
            type:  "admin",
            roles: ["admin", "user"]
        },
        "client" :  {
            type:  "client",
            roles: [ "admin", "user"]
        }        
    }

    return {
        /**
         * Get All Account types and roles.
         */
        getAllAccountTypes: function(){
            var accountTypes = [];
            for(var key in accounts){
                accountTypes.push(key)
            }
            return accountTypes;
        },

        getAccountOwnerDefaultRole: function(accountName){
            if(accounts[accountName]){
                return accounts[accountName].roles[0];
            }
            throw new Error("Invalid account type:" + accountName);
        }
    }
}();