'use strict';

/**
 * Patient Model.
 */

/*Application constant*/
var constant    = require('../general/application-constant');
/* mongoose for mongodb */
var mongoose = require('mongoose'),
				Schema = mongoose.Schema;

/* Support double schema types*/
require('mongoose-double')(mongoose);
//Schema types => long and double
var SchemaTypes = mongoose.Schema.Types;

/**
 * [Patient Schema]
 */
var PatientSchema = new Schema({
    accountId                       : {type: SchemaTypes.ObjectId, required: true},
    patientId                       : {type: String, required: true, index: true},
    firstName                       : {type: String, index: true, default: ''},
    lastName                        : {type: String, index: true, default: ''},
    middleName                      : {type: String},
    gender                          : {type: String, required: true, enum: ['Male', 'Female']},
    code                            : {type: String, index: true},
    weightInKilograms               : {type: SchemaTypes.Double},
    heightInMeters                  : {type: SchemaTypes.Double},
    legLengthRightInCM              : {type: SchemaTypes.Double},
    legLengthLeftInCM               : {type: SchemaTypes.Double},
    ethnicity                       : {type: String},
    description                     : {type: String},
    birthDate                       : {type: Date, required: true},
    createdBy                       : {type: SchemaTypes.ObjectId, required: true},
    createdDate                     : {type: Date, required: true, default: Date.now()},
    modifiedBy                      : {type: SchemaTypes.ObjectId, required: true},
    modifiedDate                    : {type: Date, required: true, default: Date.now()},
    lastVisitDate                   : {type: Date},
    isDeleted                       : {type: Boolean, required: true, default: false },
    project                         : {
        name                        : {type: String},
        _id                         : {type: SchemaTypes.ObjectId}
    },
    session                         : {
        name                        : {type: String},
        _id                         : {type: SchemaTypes.ObjectId}
    }
	});

/**
 * [Excutes before each UserSchema.Save() call]
 *  Schema validation.
 * @param  {Function} callback
 * @return {[type]}
 */
PatientSchema.pre('save', function(callback){
	var user = this;      
  //Set modified date.
  user.modifiedDate = Date.now();
  callback();

});


/**
 * [Export Patient Schema]
 * @type {[type]}
 */
exports.PatientSchema = PatientSchema;
