/**
 * Created by Nitheen on 2/25/2015.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SequenceSchema = new Schema({
        _id: { type: String, required: true },
        sequence: { type: Number, required: true }
    },{
        versionKey: false
    }
);

/**
 * [Export Patient Schema]
 * @type {[type]}
 */
exports.SequenceSchema = SequenceSchema;