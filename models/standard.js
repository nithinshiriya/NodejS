/**
 * Created by Nitheen on 4/7/2015.
 */
'use strict';

/* mongoose for mongo db */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectIdSchema = Schema.ObjectId,
    ObjectId = mongoose.Types.ObjectId;


/**
 * [Sample Schema class]
 */
var StandardSchema = new Schema({
    accountId			: {type:ObjectIdSchema, index: true, ref: 'Account'},
    type                : {type: String, required: true, enum: ['Global', 'Private']},
    moduleType          : {type: String},
    createdBy           : {type: Schema.Types.ObjectId, required: true, ref: 'User'},
    createdDate 	    : {type: Date, required: true, default: Date.now()},
    modifiedBy          : {type: Schema.Types.ObjectId, required: true, ref: 'User'},
    modifiedDate    	: {type: Date, default: Date.now(), required: true},
    data                : {type: Schema.Types.Mixed},
    isDeleted           : {type: Boolean, required: true, default: false },
    version             : {type: String},
    fileId				: {type:ObjectIdSchema},
});

/**
 * [Export Standard Schema]
 * @type {[type]}
 */
exports.StandardSchema = StandardSchema;