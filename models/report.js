/**
 * Created by Nitheen on 3/30/2015.
 */
'use strict';

/* mongoose for mongo db */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ReportSchema = new Schema({
    key                     : {type: String,required: true, index: true, unique: true},
    name                    : {type: String},
    addOns                  : [{type: String}],
    sectionKeys             : [{type: String, required: true}],
    pageMapping             : [],
    templateClassName       : {type: String, required: true}
});

/**
 * [Export Report Schema]
 * @type {[type]}
 */
exports.ReportSchema = ReportSchema;