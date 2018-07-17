var mongoose = require('mongoose'),
      Schema = mongoose.Schema;

var SpecificationSchema = new Schema({
    accountId		: {type:Schema.Types.ObjectId, ref: 'Account'},
    code            : {type: Number, required: true, index: true},
    short           : {type: String, required: true, index: true},
    long            : {type: String},
    type            : {type: String, required: true},
    key             : {type: String, required: true},
    createdDate 	: {type: Date, required: true, default: Date.now},
});

exports.SpecificationSchema = SpecificationSchema;