'use strict';
/**
 * All Mongoose schema model will be exported here.
 */
var mongoose = require('mongoose');
var accountModel = require('./account').AccountSchema;
var userModel = require('./user').UserSchema;
var patientModel = require('./patient').PatientSchema;
var sequenceModel = require('./sequence').SequenceSchema;
var sampleModel = require('./sample').SampleSchema;
var sectionModel = require('./section').SectionSchema;
var reportModel = require('./report').ReportSchema;
var standardModel = require('./standard').StandardSchema;
var pressurePointModel = require('./pressurepoint').PressurePointSchema;
var icdMasterModel = require('./icdmaster').IcdMasterSchema;
var icdClientModel = require('./icdclient').IcdClientSchema;
var sampleHistoryModel = require('./sample_history').SampleHistorySchema;
var specificationModel = require('./specification').SpecificationSchema;
var sampleVersionModel = require('./sampleversion').SampleVersionSchema;

var Account = mongoose.model('Account', accountModel);
var User = mongoose.model('User', userModel);
var Patient  = mongoose.model('Patient', patientModel);
var Sequence = mongoose.model('Sequence', sequenceModel);
var Sample = mongoose.model('Sample', sampleModel);
var Section = mongoose.model('Section', sectionModel);
var Report = mongoose.model('Report', reportModel);
var Standard  = mongoose.model('Standard', standardModel);
var PressurePoint = mongoose.model('PressurePoint', pressurePointModel);
var ICDMaster =  mongoose.model('ICDMaster', icdMasterModel);
var ICDClient = mongoose.model('ICDClient', icdClientModel);
var SampleHistory = mongoose.model('SampleHistory', sampleHistoryModel);
var Specification = mongoose.model('Specification', specificationModel);
var SampleVersion  = mongoose.model('SampleVersion', sampleVersionModel);

exports.Account = Account;
exports.User = User;
exports.Sequence = Sequence;
exports.Patient = Patient;
exports.Sample = Sample;
exports.Section = Section;
exports.Report = Report;
exports.Standard = Standard;
exports.PressurePoint = PressurePoint;
exports.ICDMaster = ICDMaster;
exports.ICDClient = ICDClient;
exports.SampleHistory = SampleHistory;
exports.Specification =  Specification;
exports.SampleVersion = SampleVersion;