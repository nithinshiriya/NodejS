/**
 * Created by Nitheen on 3/30/2015.
 */

var IReport                 = require('./report-interface').IReport,    
    reportSchema            = require('../models/mongoose-model').Report,
    sectionSchema           = require('../models/mongoose-model').Section;


/**
 * Create a Patient factory object
 * @constructor
 */
var ReportFactory = function() {};

/**
 * Implementing IReport interface
 * @type {IReport}
 */
ReportFactory.prototype = Object.create(IReport);


ReportFactory.prototype.getReportByKey = function(reportKey){
    return reportSchema.findOne({'key' : reportKey})
        .exec()
        .then(function(report){
            return populateSections(report);
        })
};

function populateSections(report){
    var sections = report.sectionKeys;
    var result = report.toObject();
    var promiseAll = [];
    sections.forEach(function(sectionkey){
        promiseAll.push(getSectionByKey(sectionkey));
    });

    return Promise.all(promiseAll)
        .then(function(sections){
            result.sectionKeys = [];
            sections.forEach(function(section){
                result.sectionKeys.push(section);
            });
            return result;
        },function(error){
            result.error = error;
            return report;
        });
}

function getSectionByKey(sectionKey){
    return sectionSchema.findOne({'key' : sectionKey}).exec();
}


// Promise.promisifyAll(ReportFactory);
// Promise.promisifyAll(ReportFactory.prototype);

module.exports = ReportFactory;