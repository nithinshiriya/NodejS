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
 * [SampleVersion Schema class] 
 */
var SampleVersionSchema = new Schema({			
	sampleId    		: {type:ObjectIdSchema},
    versions            : [{        
        sampleId        : {type:ObjectIdSchema, required: true},
        name            : {type: String, required: true},
        description     : {type: String},
        date            : {type: Date, required: true, default: Date.now}      
    }]
});


/**
 * [Export SampleVersion Schema]
 * @type {[type]}
 */
exports.SampleVersionSchema = SampleVersionSchema;