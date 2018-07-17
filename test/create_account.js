/**
 * Created by Nitheen on 3/6/2015.
 */
'use strict';


module.exports = function(accountFactory) {
    var newAccount = {
        entityName  :   'Dummy',
        phoneNo     :   '902-111-2222',
        address     :   '91 wt st , ch, pei',
        userName	: 	'dummy@gmail.com',
        password	: 	'password',
        firstName	: 	'Standard',
        lastName	: 	'account',
        tabs        :   ['TabSearch', 'TabGait', 'TabBalance'],
        role        :   ['rlAdmin'],
        headerColor :   '#ffffff',
        permissions :   ['prUserManagement', 'prProjectSession', 'prClient', 'prComparativeStat']
    };

    var newAccount1 = {
        entityName: 'Test Account-1',
        userName: 'user1@email.com',
        password: 'password',
        firstName: 'First',
        lastName: 'Last'
    };

    return {
        addTestAccount : function(){
             return accountFactory.addAccount(newAccount)
                 .then(function(account){
                     return {id: account._id, userId: account.users[0].user, userName: newAccount.userName, password: newAccount.password};
                 },function(){
                     return null;
                 })
        },
        addTestAccount1 : function(){
            return accountFactory.addAccount(newAccount1)
                .then(function(account){
                    return {id: account._id,  userId: account.users[0].user, userName: newAccount1.userName, password: newAccount.password};
                },function(){
                    return null;
                })
        },
        addTestAccountByEmail : function(email){
            var ac = {
                entityName: 'Test Account',
                userName: email,
                password: 'password',
                firstName: 'First',
                lastName: 'Last'
            };
            return accountFactory.addAccount(ac)
                .then(function(account){
                    return {id: account._id,  userId: account.users[0].user, userName: newAccount1.userName, password: newAccount.password};
                },function(){
                    return null;
                })
        }
    }
};