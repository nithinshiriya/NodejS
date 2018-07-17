/**
 * Created by Nitheen on 2/25/2015.
 */
'use strict';
/*Application error list*/
var appError                = require('../general/application-logger');
/*Application constant*/
var constant                = require('../general/application-constant');
var underscore        	    = require('underscore');

module.exports = function(patientFactory, accountFactory) {
    var PatientFactory = patientFactory;
    var AccountFactory = accountFactory;

    function getMatchingObjectById(itemList, fieldName, fieldValue){
        return underscore.find(itemList, function(item){
            return item[fieldName].toString() === fieldValue.toString()
        });
    }

    function addNewPatient(accountId, userId, patient, projectSession){
        return PatientFactory.addPatient(accountId, userId, patient, projectSession)
            .then(function(newPatient){
                return Promise.resolve(newPatient._id);
            },function(error){
                return Promise.reject(appError.formatError(error));
            });
    }

    function getProjectSessionObject(user, patient){
        if(patient.projectId && patient.sessionId) {
            return AccountFactory.getAllProjectSession(user.id)
                .then(function(projectSession){
                    var project = getMatchingObjectById(projectSession.projects, '_id' , patient.projectId);
                    var saveValue = {};
                    if(project){
                        var session = getMatchingObjectById(project.sessions, '_id' , patient.sessionId);
                        if(session){
                            saveValue.project = {
                                name: project.name,
                                _id : project._id
                            };
                            saveValue.session = {
                                name: session.name,
                                _id : session._id
                            }
                        }
                    }
                    return Promise.resolve(saveValue);
                })
        }
        return Promise.resolve();
    }

    return {
        /**
         * Adding New patient.
         * @param user: Current logged in user
         * @param patient
         */
        addPatient: function(user, patient){
            if (!patient) {
                return Promise.reject(appError.expectionList.NULL_PARAMETER);
            }

            return getProjectSessionObject(user, patient)
                .then(function(projectSession){
                    return addNewPatient(user.id, user.userId, patient, projectSession);
                });
        },
        /**
         * Modify the patient data.
         * @param user
         * @param patient
         */
        modifyPatient: function(user, patient){
            if (!patient) {
                return Promise.reject(appError.expectionList.NULL_PARAMETER);
            }
            return getProjectSessionObject(user, patient)
                .then(function(projectSession){
                    return PatientFactory.modifyPatient(user.id, user.userId, patient, projectSession)
                        .then(function(){
                            return Promise.resolve(constant.ok);
                        },function(error){
                            return Promise.reject(appError.formatError(error));
                        });
                });
        },


        /**
         * Delete the patient
         * @param user
         * @param patientId
         */
        deletePatient: function(user, patientId){
            if(!patientId){return Promise.reject(appError.expectionList.NULL_PARAMETER); }
            return PatientFactory.deletePatient(user.id, user.userId, patientId)
                .then(function(){
                    return Promise.resolve(constant.ok);
                }, function(error){
                    return Promise.reject(appError.formatError(error));
                })

        },

        /**
         * All all patient associated with account id.
         * @param accountId
         * @param next
         */
        getAllPatient: function(accountId){
            return PatientFactory.getAll(accountId)
                .then(function(patients){
                    return patients;
                }, function(err){
                    return Promise.reject(appError.formatError(err));
            });
        },


        updateVisit : function(user, patient){
            if (!patient) {return Promise.reject(appError.expectionList.NULL_PARAMETER); }
            return PatientFactory.updateVisit(user, patient)
                .then(function(data){                                        
                    return Promise.resolve(constant.ok);
                }, function(error){
                    return Promise.reject(appError.formatError(error));
                });
        },

        /**
         * Get patient by id -> _id
         * @param id
         * @param next
         */
        getPatientById: function(id, next){
            PatientFactory.getById(id, function(err, patient){
                return next(err,patient);
            });
        },

        /**
         * Get patient by patient id -> patientId
         * @param id
         * @param next
         */
        getPatientByPatientId: function(id, next){
            PatientFactory.getByPatientId(id, function(err, patient){
                return next(err,patient);
            });
        }

    }
};