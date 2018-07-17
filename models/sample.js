'use strict';
/**
 * Sample Model and Schema.
 * Usage: Mango DB Collection.
 */

/* mongoose for mongo db */
var mongoose = require('mongoose'),
        Schema = mongoose.Schema,
        ObjectIdSchema = Schema.ObjectId,
        ObjectId = mongoose.Types.ObjectId;


/**
 * [Sample Schema class] 
 */
var SampleSchema = new Schema({	
	accountId			: {type:ObjectIdSchema, index: true, required: true, ref: 'Account'},
	patient 			: {type:ObjectIdSchema, required: true, ref: 'Patient'},
	fileId				: {type:ObjectIdSchema},
    cameraFileId        : {type:ObjectIdSchema},
	type				: {type: String, required: true},
	hasReport			: {type: Boolean, default: false},
	isDeleted			: {type: Boolean, default: false},
    createdBy           : {type: Schema.Types.ObjectId, required: true, ref: 'User'},
	createdDate 	    : {type: Date, required: true, default: Date.now},
    modifiedBy          : {type: Schema.Types.ObjectId, required: true, ref: 'User', select: false},
	modifiedDate    	: {type: Date, default: Date.now, required: true, select: false},
	metadata			: {type: Schema.Types.Mixed, required: true},
	objVersion          : {type: String},	 
	reports				: [{
		key				: {type: String},	
		description		: {type: String},	
		fileId   		: {type:ObjectIdSchema},
		type			: {type: String}
	}],
	versions			: [{
		fileId			: {type:ObjectIdSchema},
		cameraFileId    : {type:ObjectIdSchema},
		name			: {type: String},
		description		: {type: String},
		createdBy       : {type: Schema.Types.ObjectId, required: true, ref: 'User'},
		createdDate 	: {type: Date, required: true, default: Date.now},
		records			: [
			{
				type 			: {type: String},
				gasApi			: {type: String},
				fileId			: {type:ObjectIdSchema},
				cameraFileId    : {type:ObjectIdSchema},			
				hasReport		: {type: Boolean, default: false},
				userAction		: {}
			}			
		]
	}],
	records : [
		{
			type 			: {type: String},
			gasApi			: {type: String},
			fileId			: {type:ObjectIdSchema},
			cameraFileId    : {type:ObjectIdSchema},			
			hasReport		: {type: Boolean, default: false},
			userAction		: {}
		}
	],
	userData				: {}
});

/**
 * [Execute before each AccountSchema.save() call.]
 * Add all schema validation here.
 * @param  {Function} callback
 * @return {[type]}
 */
SampleSchema.pre('save', function(callback) {
  var sample = this; 
  
  //Set Modified Date
  sample.modifiedDate = Date.now();

  callback();
});



/**
 * [Export Patient Schema]
 * @type {[type]}
 */
exports.SampleSchema = SampleSchema;