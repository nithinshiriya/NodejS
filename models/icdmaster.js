var mongoose = require('mongoose'),
      Schema = mongoose.Schema;

var IcdMasterSchema = new Schema({
    code            : {type: String, required: true, index: true},
    short           : {type: String, required: true, index: true},
    long            : {type: String},
    type            : {type: String, required: true, enum: ['icd-9', 'icd-10']}
});

exports.IcdMasterSchema = IcdMasterSchema;