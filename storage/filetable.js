'use strict';
/**
 * File table Model and Schema
 * Usage: Stores File information System
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var FileTableSchema = new Schema({
    filePath            : {type: String, required: true},
    metadata			: {type: Schema.Types.Mixed, required: true}             
});

/**
 * [Export File Table Schema]
 * @type {[type]}
 */
var FileTable = mongoose.model('FileTable', FileTableSchema);

exports.FileTable = FileTable;