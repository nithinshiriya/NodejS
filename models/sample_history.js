'use strict';
/**
 * Sotres Sample editing histories
 */

var mongoose = require('mongoose'),
        Schema = mongoose.Schema,
        ObjectIdSchema = Schema.ObjectId;

var SampleHistorySchema = new Schema({
   sampleId         : {type: ObjectIdSchema, index: true, required: true, ref: 'Sample'},
   fileId           : {type: ObjectIdSchema, required: true},
   modifiedBy       : {type: Schema.Types.ObjectId, required: true, ref: 'User'},
   modifiedDate     : {type: Date, default: Date.now, required: true},
   userAction       : {type: Schema.Types.Mixed, required: true},
   inUse            : {type: Boolean, default: false} 
});


/**
 * [Export Patient Schema]
 * @type {[type]}
 */
exports.SampleHistorySchema = SampleHistorySchema;