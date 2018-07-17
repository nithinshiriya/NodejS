/**
 * Created by Nitheen on 3/28/2015.
 */
var mongoose 		= require('mongoose'),    
    sectionSchema   = require('../models/mongoose-model').Section,
    reportSchema    = require('../models/mongoose-model').Report;    
    fs              = require("fs");
module.exports = function(grunt) {

    grunt.registerMultiTask('createReport', function() {
        var done = this.async();
        var self = this;
        var dbPath = self.data.url;
        var sectionNameList = self.data.sectionFileNames;
        var reportName = self.data.reportFileName;
        mongoose.connection.on('error', function(err) {
            console.error('Failed to connect to DB ' + ' on startup ', err);
        });

        mongoose.connect(dbPath , function(err) {
            if (err) {
                grunt.log.writeln(err);
                mongoose.disconnect(done);
            }
            reportSchema.remove({}, function(error){
                if(error) console.log(error);
                sectionSchema.remove({}, function(error){
                    if(error) console.log(error);
                    addAllSectionsToDb(sectionNameList)
                        .then(function(){
                            addReports(reportName)
                                .then(function(results){
                                    console.log('Success');
                                    console.log(results);
                                    mongoose.disconnect(done);
                                }, function(error){
                                    console.log(error);
                                    mongoose.disconnect(done);
                                })
                        }, function(error){
                            console.log('Error');
                            console.log(error);
                            mongoose.disconnect(done);
                        });
                });
            });


        });
    });
};

function addAllSectionsToDb(sectionNameList) {
    var sections = [];
    sectionNameList.forEach(function(name){
        sections.push(saveSection(name))
    });

    return Promise.all(sections);
}

function saveSection(fileName){    
    var content = fs.readFileSync('./grunt_task/' + fileName + '.json', 'utf8');
    var section = new sectionSchema(JSON.parse(content));
    return section.save()
        .then(function(newSection){
            return newSection._id;
        });                                     
}

function addReports(fileName){
    var content = fs.readFileSync('./grunt_task/' + fileName + '.json', 'utf8');
            var reports = JSON.parse(content);
            var promiseReport = [];
            reports.forEach(function(report){
                promiseReport.push(saveReport(report))
            });
            return Promise.all(promiseReport);       
}

function saveReport(reportObj){
    var report = new reportSchema(reportObj);
    return report.save()
        .then(function(newReport){
            return newReport._id;
        });
}