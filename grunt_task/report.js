var sectionSchema   = require('../models/mongoose-model').Section,
    reportSchema    = require('../models/mongoose-model').Report;    
    fs              = require("fs");
    path            = require('path');

module.exports = function(grunt) {
    grunt.registerTask("reportTask", function(args){        
        var type = args;
        var done = this.async();
        var task = grunt.config('reportTask').task;        
        var reportName = task.reportFileName;
        var dirName = task.directoryPath; 

        delete_report_collection()
            .then(function(){                
                if(type === "i"){                    
                    sectionSchema.remove({})
                    .then(function(){              
                        addAllSectionsToDb(dirName, reportName)
                            .then(function(){
                                addReports(dirName, reportName)
                                    .then(function(results){
                                        grunt.log.ok('Success=> ' + results);                                                                               
                                        done();
                                    }, function(error){
                                        grunt.log.error(error);                                        
                                        done();
                                    })
                            }, function(error){                            
                                grunt.log.error(error);                                
                                done();
                            });                        
                        })
                        .catch(function(error){
                            grunt.log.error(error);                            
                            done();
                        })                                             
                }else{
                    grunt.log.ok('Report Collection deleted');                     
                    done();    
                }                                                                    
            })
            .catch(function(error){
                grunt.log.error(error);                
                done();    
            });   
    });                                                    
            
}

function report_install(sectionNameList){
   return sectionSchema.remove({})
        .then(function(error){
            if(error) console.log(error);
        })
}

function delete_report_collection(){
    return reportSchema.remove({}).exec();
}

function addAllSectionsToDb(dirName, reportFileName) {
    var sections = [];
    var dirName = './grunt_task/reports/';
    fs.readdir(dirName, (err, filenames) => {
        if (err) {
            console.error(err);
            return;
          }
        filenames.forEach((fileName) => {            
            if( path.extname(fileName) ===   ".json" && fileName !== reportFileName+".json"){
                sections.push(saveSection(dirName + fileName))
            }                        
        })

    });

    return Promise.all(sections);
}

function saveSection(fileName){    
    var content = fs.readFileSync(fileName, 'utf8');
    var section = new sectionSchema(JSON.parse(content));
    return section.save()
        .then(function(newSection){
            return newSection._id;
        });                                     
}

function addReports(dirName, fileName){
    var content = fs.readFileSync(dirName + fileName + '.json', 'utf8');
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