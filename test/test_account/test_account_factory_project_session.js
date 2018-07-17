/**
 * Created by Nitheen on 3/9/2015.
 */
'use strict';

var mongoose            = require('mongoose'),    
    underscore        	= require('underscore'),
    should              = require('should'),
    dummyAccount        = require('./../create_account'),
    packageJson         = require('../../package.json'),
    accountFactory      = require('../../interface_impl/account-factory'),
    appError            = require('../../general/application-logger'),
    constant            = require('../../general/application-constant'),
    dbName              = 'accountFactoryPSF';
describe('Account Factory : Project and Session', function () {
    var DummyAccount = dummyAccount(new accountFactory());
    var AccountFactory = new accountFactory();
    var currentUser;

    before(function (done) {
        mongoose.connect(packageJson.stepscan.mongodbpathtest + dbName, function (err) {
            if (err) throw err;
            DummyAccount.addTestAccount()
                .then(function (account) {
                    currentUser = account;
                    done();
                });
        });
    });
    after(function (done) {
        mongoose.connection.db.dropDatabase(function (err) {
            if (err) {
                console.log(err);
            }
            mongoose.disconnect(done);
        });
    });
    describe('AddProject', function () {
        describe('Positive Testing', function () {
            it('Should pass adding new project', function(done){
                var projectName = 'TestProjectFalse';
            AccountFactory.addProject(currentUser.id, currentUser.userId, projectName, 'Description')
                .then(function(pId){
                    pId.toString().should.match(/^[0-9a-fA-F]{24}$/);
                    done();
                }, function(error){
                    done(error);
                });
            });
            it('Should pass adding new project and setting as default', function(done){
                var projectName = 'DefaultTestProjectTrue';
                var projId;
                AccountFactory.addProject(currentUser.id, currentUser.userId, projectName, 'default Set true')
                    .then(function(pId){
                        pId.toString().should.match(/^[0-9a-fA-F]{24}$/);
                        projId =  pId;
                        return AccountFactory.setDefaultProject(currentUser.id, currentUser.userId, pId.toString(), true )
                    })
                    .then(function(status){
                        should.equal(status, constant.ok);
                        done();
                    }, function(error){
                        done(error);
                    });
            });
        });
        describe('Negative Testing', function () {
            it('Should fail when duplicate project name set', function(done){
                var projectName = 'TestDuplicate';
                AccountFactory.addProject(currentUser.id, currentUser.userId, false, projectName)
                    .then(function(){
                        AccountFactory.addProject(currentUser.id, currentUser.userId, false, projectName)
                            .then(function(msg){
                                done(msg);
                            }, function(error){
                                should.equal(error, appError.expectionList.DUPLICATE);
                                done();
                            });
                    },function(error){
                        done(error);
                    });
            });
        });
    });

    describe('ModifyProjectName', function () {
        var allProjects;
        var theUser;
        before(function(done){
            DummyAccount.addTestAccountByEmail('modifyProject@email.com')
                .then(function(modifyUser){
                    theUser = modifyUser;
                Promise.all([
                    AccountFactory.addProject(theUser.id, theUser.userId, 'ModifyProject1', 'description'),
                    AccountFactory.addProject(theUser.id, theUser.userId, 'ModifyProject2', 'description')
                    ])
                    .then(function() {
                        AccountFactory.getAllProjectSession(theUser.id)
                            .then(function(projectSession){
                                allProjects = projectSession.project_session;
                                done();
                            },function(error){
                                done(error);
                            });
                    });
                })
            });
        describe('Positive Testing', function () {
            it('Should pass', function(done){
                var projectId = allProjects.projects[1]._id;
                AccountFactory.modifyProjectName(theUser.id, theUser.userId,projectId, 'newModifiedName', 'newModifiedName')
                    .then(function(project){
                        should.equal('newModifiedName', project.name);
                        done();
                    }, function(error){
                        should.fail(error);
                        done();
                    });
            });
        });
        describe('Negative Testing', function () {
            it('Should fail if empty user name passed', function(done){
                var projectId = allProjects.projects[1]._id;
                AccountFactory.modifyProjectName(theUser.id, theUser.userId,projectId, '')
                    .then(function(project){
                        done(project);
                    }, function(error){
                        should.equal(error, appError.expectionList.NULL_PARAMETER);
                        done();
                    });

            });
            it('Should fail if duplicate project name passed', function(done){
                var projectId = allProjects.projects[1]._id;
                AccountFactory.modifyProjectName(theUser.id, theUser.userId,projectId, 'ModifyProject1')
                    .then(function(project){
                        done(project);
                    }, function(error){
                        should.equal(error, appError.expectionList.DUPLICATE);
                        done();
                    });
            });
            it('Should fail if invalid project id passed', function(done){
                AccountFactory.modifyProjectName(theUser.id, theUser.userId , theUser.userId, 'ModifyProject1')
                    .then(function(project){
                        done(project);
                    }, function(error){
                        should.equal(error, appError.expectionList.NOT_FOUND);
                        done();
                    });
            });
        });
    });
    describe('AddSession' , function(){
        var allProjects;
        var theUser;
        before(function(done){
            DummyAccount.addTestAccountByEmail('AddSessionProject@email.com')
                .then(function(modifyUser){
                    theUser = modifyUser;
                    Promise.all([
                        AccountFactory.addProject(theUser.id, theUser.userId, 'AddSessionProject1',  'Description project 1'),
                        AccountFactory.addProject(theUser.id, theUser.userId,  'AddSessionProject2' , 'Description project 1')
                    ])
                        .then(function() {
                            AccountFactory.getAllProjectSession(theUser.id)
                                .then(function(projectSession){
                                    allProjects = projectSession.project_session;
                                    done();
                                },function(error){
                                    done(error);
                                });
                        });
                })
        });
        describe('Positive test cases', function(){
            it('Should pass adding new session to the project', function(done){
                var projectId = allProjects.projects[1]._id;
                var sessionName = 'simpleSession';
                AccountFactory.addSession(theUser.id, theUser.userId,projectId, sessionName, 'description')
                    .then(function(sesId){
                        sesId.toString().should.match(/^[0-9a-fA-F]{24}$/);
                        done();
                    },function(error){
                        should.equal(null, error);
                        done();
                    });
            });
            it('Should pass adding new session and compare with getById', function(done){
                var projectId = allProjects.projects[1]._id;
                var sessionName = 'newSession';
                var id;
                AccountFactory.addSession(theUser.id, theUser.userId,projectId, sessionName, 'description added')
                    .then(function(sesId){
                        sesId.toString().should.match(/^[0-9a-fA-F]{24}$/);
                        id = sesId;
                        return AccountFactory.getSessionById(theUser.id, projectId,id);
                    })
                    .then(function(session){
                        should.equal(session.name, sessionName);
                        should.equal(session.description, 'description added');
                        should.equal(session._id.toString(), id.toString());
                        done();
                    },function(error){
                        should.equal(null, error);
                        done();
                });
            });
        });
        describe('Negative test cases', function(){
            it('Should fail if empty session name passed', function(done){
                var projectId = allProjects.projects[1]._id;
                AccountFactory.addSession(theUser.id, theUser.userId,projectId, '', '')
                    .then(function(){
                        should.fail('Should thrown an error');
                        done();
                    }, function(error){
                        should.equal(error, appError.expectionList.NULL_PARAMETER);
                        done();
                    });
            });
            it('Should fail on duplicate session name', function(done){
                var projectId = allProjects.projects[1]._id;
                AccountFactory.addSession(theUser.id, theUser.userId,projectId, 'duplicate', 'description')
                    .then(function(){
                        return AccountFactory.addSession(theUser.id, theUser.userId,projectId, 'duplicate', 'description');
                    })
                    .then(function(){
                        done('Should fail on duplicate session name');
                    }, function(error){
                        should.equal(error, appError.expectionList.DUPLICATE);
                        done();
                    });
            });
            it('Should pass when same session name passed for other project', function(done){
                var projectId = allProjects.projects[1]._id;
                var projectId1 = allProjects.projects[0]._id;
                AccountFactory.addSession(theUser.id, theUser.userId,projectId, 'duplicateAnother', 'duplicateAnother')
                    .then(function(){
                        return AccountFactory.addSession(theUser.id, theUser.userId, projectId1,  'duplicateAnother', 'duplicateAnother');
                    })
                    .then(function(projectSession){
                        should.notEqual(null, projectSession);
                        done();
                    }, function(error){
                        done(error);
                    });
            });
        })
    });
    describe('ModifySessionName', function(){
        var projectId;
        var projectId1;
        var sessionId;
        var sessionId1;
        var sessionId2;
        var sessionId3;
        var sessionId2Name = 'modifySession2';
        var theUser;
        before(function(done){
            DummyAccount.addTestAccountByEmail('ModifySessionName@email.com')
                .then(function(modifyUser){
                    theUser = modifyUser;
                    Promise.all([
                        AccountFactory.addProject(theUser.id, theUser.userId, 'ModifySessionProject1' ,'ModifySessionProject1'),
                        AccountFactory.addProject(theUser.id, theUser.userId, 'ModifySessionProject2', 'ModifySessionProject2')
                        ])
                        .then(function(projectIds){
                            projectId = projectIds[0];
                            projectId1 = projectIds[1];
                            Promise.all([
                                AccountFactory.addSession(theUser.id, theUser.userId, projectId, 'modifySession1', 'modifySession1'),
                                AccountFactory.addSession(theUser.id, theUser.userId, projectId, 'modifySession2', 'modifySession2'),
                                AccountFactory.addSession(theUser.id, theUser.userId, projectId1,  'modifySession1', 'modifySession1'),
                                AccountFactory.addSession(theUser.id, theUser.userId, projectId1,  sessionId2Name, sessionId2Name)
                            ])
                                .then(function(sessionIds){
                                    sessionId = sessionIds[0];
                                    sessionId1 = sessionIds[1];
                                    sessionId2 = sessionIds[2];
                                    sessionId3 = sessionIds[3];
                                    done();
                                },function(error){
                                    done(error);
                                })
                        });
                })
        });
        describe('Positive test cases', function(){
            it('Should pass modifying the session name', function(done){
                var modify = 'NewModifySession';
                AccountFactory.modifySessionName(theUser.id, theUser.userId, projectId, sessionId, modify, modify)
                    .then(function(session){
                        should.equal(session.name, modify);
                        should.equal(session._id.toString(), sessionId.toString());
                        done();
                    },function(error){
                        done(error);
                    })
            });
            it('Should pass on second project id update', function(done){
                var modify = 'NewModifySessionSecond';
                AccountFactory.modifySessionName(theUser.id, theUser.userId, projectId1, sessionId2, modify, modify)
                    .then(function(session){
                        should.equal(session.name, modify );
                        should.equal(session._id.toString(), sessionId2.toString() );
                        done();
                    },function(error){
                        done(error);
                    })
            });
        });
        describe('Negative test cases', function(){
            it('Should fail if invalid session id passed', function(done){
                AccountFactory.modifySessionName(theUser.id, theUser.userId, projectId, projectId,'NewModifySession', 'NewModifySession')
                    .then(function(){
                        done('Should fail with invalid session id');
                    },function(error){
                        should.equal(error, appError.expectionList.NOT_FOUND);
                        done();
                    })
            });
            it('Should fail on duplicate session name', function(done){
                AccountFactory.modifySessionName(theUser.id, theUser.userId, projectId, sessionId,'modifySession2','modifySession2')
                    .then(function(){
                        done('Should fail duplicate session name');
                    },function(error){
                        should.equal(error, appError.expectionList.DUPLICATE);
                        done();
                    })
            });
        });
        describe('SetDefaultSession', function(){
            it('Should pass when default session is set', function(done){
                AccountFactory.setDefaultSession(theUser.id, theUser.userId, projectId1, sessionId3, true)
                    .then(function(msg){
                        should.equal(constant.ok, msg);
                        return AccountFactory.getProjectById(theUser.id, projectId1);
                    })
                    .then(function(project){
                        should.deepEqual(project.projects[0].defSessionId.toString(), sessionId3.toString());
                        done();
                    },function(error){
                        done(error);
                    });
            });
        });
    })
});