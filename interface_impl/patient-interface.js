/**
 * Created by Nitheen on 2/24/2015.
 */
'use strict';
var PatientInterface = {
    addPatient: function(accountId, userId, patient){},
    modifyPatient: function(userId, patient){},
    updateVisit: function(userId, patient){},
    getById: function(id){},
    getByPatientId: function(id){},
    getAll: function(accountId){},
    getByQuery: function(query){},
    deletePatient : function(accountId, userId, patientId) {},
    updateLastVisitDate : function(userId, patientId) {}
};

exports.IPatient = PatientInterface;