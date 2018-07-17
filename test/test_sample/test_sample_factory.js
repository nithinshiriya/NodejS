/**
 * Created by Nitheen on 3/24/2015.
 */
'use strict';
var mongoose            = require('mongoose'),
    should              = require('should'),
    Dummy               = require('./../dummy_creator')(),    
    packageJson         = require('../../package.json'),
    sampleFactory      = require('../../interface_impl/sample-factory'),
    accountFactory      = require('../../interface_impl/account-factory'),
    appError            = require('../../general/application-logger'),
    fileService         = require('../../database/file-service'),
    dbName              = 'sampleFactory';

describe('Sample Factory testing', function(){
    var SampleFactory = new sampleFactory(fileService(mongoose));
    var currentUser;
    var projectSessions;
    var patientId;

    before(function(done){
        mongoose.connection.on('error', function(err) {});
        mongoose.connect(packageJson.stepscan.mongodbpathtest + dbName , function(err){
            if(err) throw err;
            Dummy.addTestAccount()
                .then(function(account){
                    currentUser = account;
                    return account;
                })
                .then(function(account){
                    return Promise.all([
                        Dummy.addTestProjectAndSession(account),
                        Dummy.addTestPatient(account, 'james')
                    ])
                })
                .then(function(results){
                    projectSessions = results[0];
                    patientId = results[1];
                    done();
                }, function(error){
                    console.log(error);
                    done(error)
                });
        });
    });
    after(function (done) {
        mongoose.connection.db.dropDatabase(function (err) {
            if(err){ console.log(err); }
            mongoose.disconnect(done);
        });
    });

    describe('AddSample testing', function(){
       describe('Positive Test cases', function(){
           it('Should pass when required information passed', function(done){
                var sample = {
                    patient : patientId,
                    project: projectSessions.projects[0]._id,
                    session: projectSessions.projects[0].sessions[0]._id,
                    type: 'Gait',
                    hasReport: false,
                    metadata : {}
                };
               SampleFactory.addSample(currentUser.id, currentUser.userId, sample)
                   .then(function(sample){
                       should.notEqual(sample, null);
                       done();
                   },function(error){
                       done(error);
                   });
           });
       })
    });

    describe('Get Sample by Id testing', function(){
        it('Should return valid sample', function(done){
            var sample = {
                patient : patientId,
                project: projectSessions.projects[0]._id,
                session: projectSessions.projects[0].sessions[0]._id,
                type: 'Gait',
                hasReport: false,
                metadata : {}
            };
            SampleFactory.addSample(currentUser.id, currentUser.userId, sample)
                .then(function(sample) {
                    should.notEqual(sample, null);
                    return SampleFactory.getSampleById(sample._id.toString());
                })
                .then(function(sample){
                    should.notEqual(sample.patient._id, null);
                    done();
                },function(error){
                    done(error);
                });
        });
    });

    describe('Get Sample by Query testing', function(){
        it('Should return valid sample', function(done){
            var sample = {
                patient : patientId,
                project: projectSessions.projects[0]._id,
                session: projectSessions.projects[0].sessions[0]._id,
                type: 'Gait',
                hasReport: false,
                metadata : {}
            };
            SampleFactory.addSample(currentUser.id, currentUser.userId, sample)
                .then(function(sample) {
                    should.notEqual(sample, null);
                    return SampleFactory.getSampleByQuery({_id: sample._id.toString()});
                })
                .then(function(samples){
                    should.equal(samples.length, 1);
                    done();
                },function(error){
                    done(error);
                });
        });
        it('Should return null on invalid id', function(done){
            SampleFactory.getSampleByQuery({_id: patientId})
                .then(function(sample){
                    should.equal(sample.length, 0);
                    done();
                }, function(error){
                    console.log(error);
                    done(error);
                })
        });
        it('Should return error on invalid object id', function(done){
            SampleFactory.getSampleByQuery({_id: 'InvalidId'})
                .then(function(){
                    done('Should fail this');
                }, function(error){
                    should.notEqual(error, null);
                    done();
                })
        })
    });
    describe('Add Sample file', function(){
        describe('Positive Test cases', function(){
            it('Should pass adding sample file', function(done){
                var sample = {
                    patient : patientId,
                    project: projectSessions.projects[0]._id,
                    session: projectSessions.projects[0].sessions[0]._id,
                    type: 'Gait',
                    hasReport: false,
                    metadata : {}
                };
                SampleFactory.addSample(currentUser.id, currentUser.userId, sample)
                    .then(function(sample){
                        should.notEqual(sample, null);
                        return  SampleFactory.SampleFile(currentUser.id, currentUser.userId, sample._id , 'D:/SoCal1/Boardwalk/Private/CloudProject/Frames_141204.h5', true);
                    })
                    .then(function(sample){
                        sample.fileId.toString().should.match(/^[0-9a-fA-F]{24}$/);
                        should.equal(sample.hasReport, true);
                        done();
                    },function(error){
                        done(error);
                    });
            });
            it('Should pass updating sample file', function(done){
                var sample = {
                    patient : patientId,
                    project: projectSessions.projects[0]._id,
                    session: projectSessions.projects[0].sessions[0]._id,
                    type: 'Gait',
                    hasReport: false,
                    metadata : {}
                };
                SampleFactory.addSample(currentUser.id, currentUser.userId, sample)
                    .then(function(sample){
                        return  SampleFactory.SampleFile(currentUser.id, currentUser.userId, sample._id , 'D:/SoCal1/Boardwalk/Private/CloudProject/Frames_141204.h5', false);
                    })
                    .then(function(sample){
                        return SampleFactory.SampleFile(currentUser.id, currentUser.userId, sample._id , 'D:/SoCal1/Boardwalk/Private/CloudProject/Frames_141204.h5', true);
                    })
                    .then(function(sample){
                        should.equal(sample.hasReport, true);
                        done();
                    },function(error){
                        done(error);
                    });
            })
        })
    })
});