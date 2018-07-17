/**
 * Created by Nitheen on 3/24/2015.
 */
'use strict';
var accountFactory      = require('../interface_impl/account-factory'),
    accountManager      = require('../business-logic/account-manager'),
    patientFactory      = require('../interface_impl/patient-factory'),
    patientManager      = require('../business-logic/patient-manager');    

module.exports = function() {
    var AccountFactory =  new accountFactory();
    var AccountManager = accountManager(AccountFactory);
    var PatientManager = patientManager(new patientFactory());

    var newAccount = {
        entityName: 'Test Account',
        userName: 'user@email.com',
        password: 'password',
        firstName: 'First',
        lastName: 'Last'
    };

    return {
        addTestAccount : function(){
            return AccountFactory.addAccount(newAccount)
                .then(function(account){
                   return {id: account._id, userId: account.users[0].user, userName: newAccount.userName, password: newAccount.password};
                },function(error){
                    console.log(error);
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
            return AccountFactory.addAccount(ac)
                .then(function(account){
                    return {id: account._id,  userId: account.users[0].user, userName: account.userName, password: newAccount.password};
                },function(){
                    return null;
                })
        },
        addTestProjectAndSession: function(user){
            var project1 = {
                name : 'project1',
                description : 'description1',
                isDefault: false
            };
            var project2 = {
                name : 'project2',
                description : 'description2',
                isDefault: false
            };
            var session1 = {
                name : 'session1',
                description : 'description2',
                isDefault: false,
                projectId : ''
            };
            var session2 = {
                name : 'session2',
                description : 'description2',
                isDefault: false,
                projectId : ''
            };
            return Promise.all([
                AccountManager.addProject(user, project1),
                AccountManager.addProject(user, project2)
            ])
                .then(function(results){
                    session1.projectId = results[0];
                    session2.projectId = results[1];
                    return Promise.all([
                        AccountManager.addSession(user, session1),
                        AccountManager.addSession(user, session2)
                    ])
                        .then(function(){
                            return AccountManager.getAllProjectSession(user);
                        })
                })
        },
        addTestPatient : function(user, name){
            var patient = {
                firstName : name,
                lastName: 'Bond',
                middleName: 'T',
                gender: 'Male',
                weightInKilograms: 50.26,
                heightInMeters: 100.25,
                legLengthRightInCM: 85,
                legLengthLeftInCM: 85,
                birthDate: Date.now()
            };
            return PatientManager.addPatient(user, patient);
        }

    }
};