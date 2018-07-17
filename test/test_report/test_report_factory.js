/**
 * Created by Nitheen on 3/30/2015.
 */
'use strict';
var mongoose            = require('mongoose'),
    should              = require('should'),
    dummyAccount        = require('./../create_account'),    
    packageJson         = require('../../package.json'),
    reportFactory      = require('../../interface_impl/report-factory'),
    accountFactory      = require('../../interface_impl/account-factory'),
    appError            = require('../../general/application-logger');


describe('Report Factory testing', function () {
    var ReportFactory =  new reportFactory();

    beforeEach(function(done){
        mongoose.connection.on('error', function(err) {});
        mongoose.connect(packageJson.stepscan.mongodbpath, function(err){
            if(err) throw err;
            done();
        });
    });
    afterEach(function (done) {
        mongoose.disconnect(done);
    });

    describe('GetReportSetting:', function () {
       it('Should pass', function(done){
           ReportFactory.getReportByKey('GaitReport')
               .then(function(result){
                   console.log(result);
                   done();
               });
       });
    });

});