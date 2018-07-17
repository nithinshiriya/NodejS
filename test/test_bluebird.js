/**
 * Created by Nitheen on 3/5/2015.
 */
'use strict';
var mongoose 		    = require('mongoose'),    
    packageJson         = require('../package.json'),
    patientFactory      = require('../interface_impl/patient-factory'),
    dbName              = 'testPatient';

//Promise.promisifyAll(mongoose);

describe('Patient bird : Test Adding new account', function () {
    var PatientFactory =  new patientFactory();

    before(function(done){
        mongoose.connect(packageJson.stepscan.mongodbpathtest + dbName , function(err){
            if(err) throw err;
            console.log('DB: Connected to test mongodb server.');
            done();
        });
    });

    describe('Patient : Positive Test cases', function () {
/*        it("Should Get the sequence", function(done){
            var patient = {
                lastName: 'Bond',
                middleName: 'T',
                gender: 'Male',
                weightInKilograms: 50.26,
                heightInMeters: 100.25,
                LegLengthRightInCM: 85,
                LegLengthLeftInCM: 85,
                birthDate: new Date()
            };
            PatientFactory.addPatient('507f1f77bcf86cd799439011','507f1f77bcf86cd799439011', patient)
                .then(function(id){
                    console.log("Success");
                    console.log(id);
                    done();
                },function(err){
                    console.log("Error");
                    console.log(err);
                    done();
                });
        });*/

/*        it('Should pass when required field provided', function (done) {
            PatientFactory.getById('12225')
            .then(function(patient){
                    done();
                },function (err) {
                console.log(err);
                done();
            });
        });*/

    });
});