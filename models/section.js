/**
 * Created by Nitheen on 3/26/2015.
 */
'use strict';

/* mongoose for mongo db */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SectionItemSchema = new Schema({
    h5                      : [
        {
            name        : {type: String},
            index       : {},
            datasetName : {type: String},
            recordType  : {type: String}
        }
    ],
    normative               : {
        fields              : [{type: String}],
        columnFormula       : {type: String},
        columnDisplayFormat:  {type: String},
        rangeDisplayFormat  : {type: String},
        upperLimitFormula   : {type: String},
        lowerLimitFormula   : {type: String},
        cutOffUpperLimit    : {type: Number},
        cutOffLowerLimit    : {type: Number},
    },
    difference              :{
        formula             : {type: String},
        displayFormat       : {type: String},
        h5FieldName         : {type: String},
        normativeFieldName  : {type: String}
    },
    rangeInBetween          : {type: String}, 
    title                   : {type: String},
    xName                   : {type: String},
    displayFormat           : {type: String},
    formula                 : {type: String},    
    xAxisTitle              : {type: String},
    yAxisTitle              : {type: String},
    legendTitles            : {type: String},
    xAxisFormula            : {type: String},
    yAxisFormula            : {type: String}
});

var SectionSchema = new Schema({
    key                     : {type: String, required: true, index: true, unique: true},
    type                    : {type: String, required: true},
    title                   : {type: String},
    height                  : {type: Number},
    jsonKeys                : [{type: String}],
    resourceKeys            : [
        {
            resourceName    : {type: String},
            items           : [SectionItemSchema]
        }
    ]
});

/**
 * [Export Section Schema]
 * @type {[type]}
 */
exports.SectionSchema = SectionSchema;