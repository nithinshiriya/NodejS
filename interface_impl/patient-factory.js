/**
 * Created by Nitheen on 2/24/2015.
 */
'use strict';
//Parse, validate, manipulate, and display dates
var moment                  = require('moment');
var underscore        	    = require('underscore');
var appError                = require('../general/application-logger');
var patientSchema           = require('../models/mongoose-model').Patient;
var sequenceSchema          = require('../models/mongoose-model').Sequence;
var IPatient                = require('./patient-interface').IPatient;

/**
 * Create a Patient factory object
 * @constructor
 */
var PatientFactory = function() {};

var getNew = {new: true};

/**
 * Implementing IPatient interface
 * @type {IPatient}
 */
PatientFactory.prototype = Object.create(IPatient);

//Omission fields from query
var omitField = {createdBy:0 , createdDate:0, modifiedBy:0, modifiedDate:0, accountId:0, isDeleted:0};

/**
 * Sequence generator for patient Id. it's not a primary key.
 * @param collectionName
 */
var getPatientSequence = function(collectionName) {
    var query = {_id: collectionName};
    var update = {$inc: {sequence: 1}};
    var options = {upsert: true, new: true};
    return sequenceSchema.findOneAndUpdate(query, update, options).exec();
};


/**
 * Adding new patient to the account.
 */
PatientFactory.prototype.addPatient = function(accountId, userId, patient, projectSession){
        if(!patient) {return Promise.reject(appError.expectionList.NULL_PARAMETER);}

        return CheckDuplicatePatientCode(patient, accountId)
            .then(() => {
            return getPatientSequence('patient')
                .then(function (id) {
                    return id;
                })
                .then(function (id) {
                    var tmp = underscore.omit(patient, ['_id', 'accountId', 'patientId']);
                    var _patient = new patientSchema(tmp);
                    _patient.accountId = accountId;
                    _patient.createdBy = userId;
                    _patient.modifiedBy = userId;
                    _patient.patientId = id.sequence + moment().format('YYMMDDhh');
                    if(projectSession){
                        _patient.project = projectSession.project;
                        _patient.session = projectSession.session;
                    }
                    return _patient.save()
                    .then(function (patient) {
                            return patient;
                        });
                })
            });
};

/**
 * Modify the patient
 * @param userId
 * @param patient
 */
PatientFactory.prototype.modifyPatient = function(accountId, userId, patient, projectSession){
    if(!underscore.has(patient, '_id')){
        return Promise.reject(appError.expectionList.NOT_FOUND);
    }

     return CheckDuplicatePatientCode(patient, accountId)
     .then(() =>{
        return patientSchema.findOne({_id: patient._id, isDeleted: false}).exec()
            .then(function(editPatient){
                if(!editPatient){
                    return Promise.reject(appError.expectionList.NOT_FOUND);
                }
                var tmpPatient = underscore.omit(patient, ['_id', 'accountId', 'patientId', 'isDeleted']);
                var _patient = underscore.extend(editPatient,tmpPatient);
                _patient.modifiedBy = userId;
                if(projectSession){
                    _patient.project = projectSession.project;
                    _patient.session = projectSession.session;
                }                    
                return _patient.save().then(function(modifiedPatient){
                    return modifiedPatient;
                })
        });
    });
};

/**
 * Update height and length of patient
 * @param userId
 * @param patient
 * @returns {*}
 */
PatientFactory.prototype.updateVisit = function(user, patient){
    var updatePatient = {
        _id : patient._id,
        weightInKilograms: patient.weightInKilograms,
        heightInMeters: patient.heightInMeters,
        legLengthRightInCM: patient.legLengthRightInCM,
        legLengthLeftInCM: patient.legLengthLeftInCM,
        lastVisitDate: Date.now()
    };
    return this.modifyPatient(user.id, user.userId, updatePatient, null);
};

PatientFactory.prototype.updateLastVisitDate = function(userId, patientId){
    var updatePatient = {
        _id: patientId,
        lastVisitDate: Date.now()
    };
    return this.modifyPatient(userId, updatePatient);
};

/**
 * Get All patient those associated with account id.
 * @param accountId
 */
PatientFactory.prototype.getAll = function(accountId){
   return  patientSchema.find({accountId: accountId, isDeleted: false}, omitField)
       .exec();
};

/**
 * Get Patient list by query
 * @param query
 */
PatientFactory.prototype.getByQuery = function(query){
    return patientSchema.find(query, omitField).exec();
};

/**
 * Get Patient by id -> _id
 * @param id
 */
PatientFactory.prototype.getById = function(id){
    return patientSchema.findById(id, omitField).exec();
};

/**
 * Get Patient by Patient Id -> patientId
 * @param id
 */
PatientFactory.prototype.getByPatientId = function(id){
    return patientSchema.findOne({'patientId': id}, omitField).exec();
};

/**
 * Delete patient by Id
 * @param accountId
 * @param userId
 * @param patientId
 * @returns {Promise|Array|{index: number, input: string}}
 */
PatientFactory.prototype.deletePatient = function(accountId, userId, patientId){
    var update = {$set: {isDeleted: true, modifiedBy: userId, modifiedDate: Date.now()}};
    return  patientSchema.findOneAndUpdate({accountId:accountId, _id:patientId }, update, getNew).exec();
};

/**
 * Check duplicate patient code in same account
 * @param {*} savePatient 
 * @param {*} accountId 
 */
function CheckDuplicatePatientCode(savePatient, accountId){
    return new Promise(function(resolve, reject){
        if(savePatient.code && savePatient.code !== ""){            
                patientSchema.findOne({code:  savePatient.code, isDeleted: false, accountId: accountId})
                .exec()
                .then((user)=>{
                    if(user){
                        if(user._id.toString() !== savePatient._id){                            
                         return reject(appError.expectionList.DUPLICATE_PATIENT_ID);   
                        }
                    }
                    return resolve();
                });            
        }else{
            return resolve();
        }
    });
}



module.exports = PatientFactory;