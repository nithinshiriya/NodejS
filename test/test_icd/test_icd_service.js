'use strict';
var mongoose            = require('mongoose'),
    should              = require('should'),
    packageJson         = require('../../package.json'),
    dbName              = 'IcdService',
    dummyAccount        = require('./../create_account'), 
    accountFactory      = require('../../interface_impl/account-factory'),
    icdMasterSchema     = require('../../models/mongoose-model').ICDMaster,   
    icdService          = require('../../icd/icd-service');
    
    
describe('ICD Service Test', function() {
    var DummyAccount = dummyAccount(new accountFactory());     
    var ICDService =   icdService();
    var currentUser; //currentUser.id, currentUser.userId
    
    before(function(done){
        mongoose.connection.on('error', function(err) {});
        mongoose.connect(packageJson.stepscan.mongodbpathtest + dbName , function(err){
            if(err) throw err;
            DummyAccount.addTestAccount()
                .then(function(account){
                    currentUser = account;
                    var dummylist = GetDummyICDMaster();
                    icdMasterSchema.insertMany(dummylist, function(error, docs){
                        if(error) return done(error);
                        done();
                    });                                                           
                }, function(error){                    
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
        
    it('Should fail if invalid account id passed.', function(done) {
        ICDService.add("Invalid Account id", 200)
        .then(function(res){
            should.fail(res);
            done();
        },function(error) {                        
             done();
         });
    });
                
    it('Should insert ICD code.', function(done) {
        var icd = {
            code : "200",
            short : "Test short",
            long : "Test long",
            type: "icd-9"
        };
        
        ICDService.add(currentUser.id, icd)
        .then(function(icdClient){
            should.notEqual(null, icdClient);           
            should.deepEqual(icdClient.code, icd.code);
            should.deepEqual(icdClient.accountId, currentUser.id);
            done();
        },function(error) {                        
            console.log(error);
             done(error);
         })
    });
    
    it('Should not insert duplicate ICD code.', function(done) {
        var icd = {
            code : "300",
            short : "Test short",
            long : "Test long",
            type: "icd-9"
        };
        
        ICDService.add(currentUser.id, icd)
        .then(function(icdClient){
            should.notEqual(null, icdClient);           
            should.deepEqual(icdClient.code, icd.code);
            should.deepEqual(icdClient.accountId, currentUser.id);
                                    
            ICDService.add(currentUser.id, icd)
            .then(function(icdClient){                
                should.notEqual(null, icdClient);           
                should.deepEqual(icdClient.code, icd.code);
                should.deepEqual(icdClient.accountId, currentUser.id);                
                done();
            });
            
        },function(error) {                        
            console.log(error);
             done(error);
         })
    }); 
    
    
    it('Should remove the ICD code from client account.', function(done){
        var icd = {
            code : "400",
            short : "Test short",
            long : "Test long",
            type: "icd-9"
        };
        ICDService.add(currentUser.id, icd)
        .then(function(icdClient){
                        
            ICDService.delete(currentUser.id, icd.code)
            .then(function(doc) {
                should.notEqual(null, doc);                 
                //Validate that Id doesn't exist in database. 
                ICDService.getByCode(currentUser.id, icd.code)
                .then(function(icdClient) {
                    should.equal(null, icdClient);
                    done();
                });       
                
            });            
        },function(error){
            console.log(error);
            done(error);
        })                
    })   

    it('Search by short name -> "Externl" and match the count.', function(done){
       ICDService.search("Externl")
       .then(function(icd) {
           should.equal(2, icd.length);
           done();
       }, function(error){
           console.log(error);
           done();
       });        
    }); 
    
    it('Search by code -> "E0020" and match the count.', function(done){
       ICDService.search("E0020")
       .then(function(icd) {
           should.equal(1, icd.length);
           done();
       }, function(error){
           console.log(error);
           done();
       });        
    });
    
    it('Search by short name with Capital letter -> "SNOW" and match the count.', function(done){
       ICDService.search("SNOW")
       .then(function(icd) {           
           should.notEqual(0, icd.length);
           done();
       }, function(error){
           console.log(error);
           done();
       });        
    });         
        
        
    function GetDummyICDMaster() {
        return [{
                        "code":"E0008",
                        "short":"Externl cause status NEC",
                        "long":"Other external cause status",
                        "type":"icd-9"
                    },
                    {
                        "code":"E0009",
                        "short":"Externl cause status NOS",
                        "long":"Unspecified external cause status",
                        "type":"icd-9"
                    },
                    {
                        "code":"E0010",
                        "short":"Walking,marching,hiking",
                        "long":"Activities involving walking, marching and hiking",
                        "type":"icd-9"
                    },
                    {
                        "code":"E0011",
                        "short":"Running",
                        "long":"Activities involving running",
                        "type":"icd-9"
                    },
                    {
                        "code":"E0020",
                        "short":"Swimming",
                        "long":"Activities involving swimming",
                        "type":"icd-9"
                    },
                    {
                        "code":"E0021",
                        "short":"Springboard/platfrm dive",
                        "long":"Activities involving springboard and platform diving",
                        "type":"icd-9"
                    },
                    {
                        "code":"E0022",
                        "short":"Water polo",
                        "long":"Activities involving water polo",
                        "type":"icd-9"
                    },
                    {
                        "code":"E0023",
                        "short":"Water aerobics/exercise",
                        "long":"Activities involving water aerobics and water exercise",
                        "type":"icd-9"
                    },
                    {
                        "code":"E0024",
                        "short":"Underwater dive/snorkel",
                        "long":"Activities involving underwater diving and snorkeling",
                        "type":"icd-9"
                    },
                    {
                        "code":"E0025",
                        "short":"Row,canoe,kayk,raft,tube",
                        "long":"Activities involving rowing, canoeing, kayaking, rafting and tubing",
                        "type":"icd-9"
                    },
                    {
                        "code":"E0026",
                        "short":"Water ski/wake boarding",
                        "long":"Activities involving water skiing and wake boarding",
                        "type":"icd-9"
                    },
                    {
                        "code":"E0027",
                        "short":"Surf,windsrf,boogie brd",
                        "long":"Activities involving surfing, windsurfing and boogie boarding",
                        "type":"icd-9"
                    },
                    {
                        "code":"E0028",
                        "short":"Water sliding",
                        "long":"Activities involving water sliding",
                        "type":"icd-9"
                    },
                    {
                        "code":"E0029",
                        "short":"Water/watercraft",
                        "long":"Other activity involving water and watercraft",
                        "type":"icd-9"
                    },
                    {
                        "code":"E0030",
                        "short":"Ice Skating",
                        "long":"Activities involving ice skating",
                        "type":"icd-9"
                    },
                    {
                        "code":"E0031",
                        "short":"Ice hockey",
                        "long":"Activities involving ice hockey",
                        "type":"icd-9"
                    },
                    {
                        "code":"E0032",
                        "short":"Ski,snow brd,sled,tobagn",
                        "long":"Activities involving snow (alpine) (downhill) skiing, snow boarding, sledding, tobogganing and snow tubing",
                        "type":"icd-9"
                    },
                    {
                        "code":"E0033",
                        "short":"Cross country skiing",
                        "long":"Activities involving cross country skiing",
                        "type":"icd-9"
                    },
                    {
                        "code":"E0039",
                        "short":"Ice and snow",
                        "long":"Other activity involving ice and snow",
                        "type":"icd-9"
                    },
                    {
                        "code":"E0040",
                        "short":"Mountain,rock/wall climb",
                        "long":"Activities involving mountain climbing, rock climbing and wall climbing",
                        "type":"icd-9"
                    },
                    {
                        "code":"E0041",
                        "short":"Rappelling",
                        "long":"Activities involving rappelling",
                        "type":"icd-9"
                    },
                    {
                        "code":"E0042",
                        "short":"BASE jumping",
                        "long":"Activities involving BASE jumping",
                        "type":"icd-9"
                    },
                    {
                        "code":"E0043",
                        "short":"Bungee jumping",
                        "long":"Activities involving bungee jumping",
                        "type":"icd-9"
                    },
                    {
                        "code":"E0044",
                        "short":"Hang gliding",
                        "long":"Activities involving hang gliding",
                        "type":"icd-9"
                    },
                    {
                        "code":"E0049",
                        "short":"Climb,rappell,jump off",
                        "long":"Other activity involving climbing, rappelling and jumping off",
                        "type":"icd-9"
                    },
                    {
                        "code":"E0050",
                        "short":"Dancing",
                        "long":"Activities involving dancing",
                        "type":"icd-9"
                    },
                    {
                        "code":"E0051",
                        "short":"Yoga",
                        "long":"Activities involving yoga",
                        "type":"icd-9"
                    },
                    {
                        "code":"E0052",
                        "short":"Gymnastics",
                        "long":"Activities involving gymnastics",
                        "type":"icd-9"
                    },
                    {
                        "code":"E0053",
                        "short":"Trampoline",
                        "long":"Activities involving trampoline",
                        "type":"icd-9"
                    },
                    {
                        "code":"E0054",
                        "short":"Cheerleading",
                        "long":"Activities involving cheerleading",
                        "type":"icd-9"
                    },
                    {
                        "code":"E0059",
                        "short":"Dancing,rhythm movements",
                        "long":"Other activity involving dancing and other rhythmic movements",
                        "type":"icd-9"
                    },
                    {
                        "code":"E0060",
                        "short":"Roller skate,skateboard",
                        "long":"Activities involving roller skating (inline) and skateboarding",
                        "type":"icd-9"
                    },
                    {
                        "code":"E0061",
                        "short":"Horseback riding",
                        "long":"Activities involving horseback riding",
                        "type":"icd-9"
                    },
                    {
                        "code":"E0062",
                        "short":"Golf",
                        "long":"Activities involving golf",
                        "type":"icd-9"
                    },
                    {
                        "code":"E0063",
                        "short":"Bowling",
                        "long":"Activities involving bowling",
                        "type":"icd-9"
                    },
                    {
                        "code":"E0064",
                        "short":"Bike riding",
                        "long":"Activities involving bike riding",
                        "type":"icd-9"
                    },
                    {
                        "code":"E0065",
                        "short":"Jumping rope",
                        "long":"Activities involving jumping rope",
                        "type":"icd-9"
                    },
                    {
                        "code":"E0066",
                        "short":"Non-running track/field",
                        "long":"Activities involving non-running track and field events",
                        "type":"icd-9"
                    },
                    {
                        "code":"E0069",
                        "short":"Individ sports,athletics",
                        "long":"Other activity involving other sports and athletics played individually",
                        "type":"icd-9"
                    }];
                                
                    
        }        
});    