var mongoose = require('mongoose'),      
      Schema = mongoose.Schema,
      ObjectIdSchema = Schema.ObjectId;

var IcdClientSchema = new Schema({
    accountId       : {type:ObjectIdSchema, index: true, required: true, ref: 'Account'},
    code            : {type: String, required: true, index: true},
    short           : {type: String, required: true, index: true},
    long            : {type: String},
    type            : {type: String, required: true, enum: ['icd-9', 'icd-10']}
});

exports.IcdClientSchema = IcdClientSchema;