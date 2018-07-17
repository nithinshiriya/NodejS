/**
 * Created by Nitheen on 5/27/2015.
 */

/* mongoose for mongo db */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectIdSchema = Schema.ObjectId,
    ObjectId = mongoose.Types.ObjectId;

/* Support double schema types*/
require('mongoose-double')(mongoose);
//Schema types => long and double
var SchemaTypes = mongoose.Schema.Types;

/**
 * [Sample Schema class]
 */
var PressurePointSchema = new Schema({
    accountId			: {type:ObjectIdSchema, index: true, ref: 'Account'},
    type                : {type: String, required: true, enum: ['Global', 'Private']},
    createdBy           : {type: Schema.Types.ObjectId, required: true, ref: 'User'},
    createdDate 	    : {type: Date, required: true, default: Date.now()},
    modifiedBy          : {type: Schema.Types.ObjectId, required: true, ref: 'User'},
    modifiedDate    	: {type: Date, default: Date.now(), required: true},
    isDeleted           : {type: Boolean, required: true, default: false },
    name                : {type: String, required: true},
    desc                : {type: String},
    stroke  			: {type: Schema.Types.Mixed, required: true},    
});

/**
 * [Export Standard Schema]
 * @type {[type]}
 */
exports.PressurePointSchema = PressurePointSchema;