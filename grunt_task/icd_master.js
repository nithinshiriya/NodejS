var mongoConnection =  require('../database/db-connection'),
    icdMasterSchema   = require('../models/mongoose-model').ICDMaster,
    accountSchema     = require('../models/mongoose-model').Account,
    icdService        =  require('../icd/icd-service.js'),
    fs                = require("fs");

module.exports = function(grunt) {
    grunt.registerTask("icdmaster", function(args){         
        var done = this.async();       
        var task = grunt.config('icdMaster').task;
        var dbPath = task.db; 
        var cipher = task.cipher;
        
        if(task.proceed === false && args !== 'd'){
            return done();
        }
                
        mongoConnection.connect(dbPath, cipher)
        .then(function(){
            switch (args){
                    case "u":
                        removeICDCollection()
                        .then(function() {
                            grunt.log.ok("ICD Master table deleted");
                                        mongoConnection.disconnect();
                                        done();
                        });
                        break;
                    case "i":
                        removeICDCollection()
                        .then(function(){
                            freshICD("icd_9")
                            .then(function(codes) {
                                grunt.log.ok(codes.length + " record inserted.");    
                                addDefultICDToAccount()
                                .then((results) =>{
                                     grunt.log.ok(results.length + " defaults ICDS are updated."); 
                                        mongoConnection.disconnect();
                                        done();  
                                });              
                            })
                            .catch(function(error) {
                                grunt.log.error(error);
                                          mongoConnection.disconnect();
                                        done();
                            })                                                        
                        })
                        .catch(function(error) {
                            grunt.log.error(error);
                                        mongoConnection.disconnect();
                                        done();
                        })                        
                        break;
                    case "a":
                        grunt.log.error("No implementation found");
                                        mongoConnection.disconnect();
                                        done();
                        break;
                    case "d":
                        grunt.log.error("No implementation found");
                                        mongoConnection.disconnect();
                                        done();                      
                        break;                    
                    default:
                        grunt.log.writeln("Valid commands are", "icdmaster:", "i,u,a,d" );
                        done();
                        break;             
            }            

        }, function(err){
             grunt.log.error('Failed to connect to DB ' + ' on startup ', err);
             done();
        });  

    });                                                    
}

function removeICDCollection() {
    return icdMasterSchema.remove({}).exec();
}

function freshICD(fileName) {    
    return new Promise(function(resolve, reject){
        var content = fs.readFileSync('./grunt_task/icd_codes/' + fileName + '.json', 'utf8');
        var icdcodes = JSON.parse(content);
        icdMasterSchema.insertMany(icdcodes, function(error, docs){
            if(error) return reject(error);
            return resolve(docs);
        })        
    })
}


function addDefultICDToAccount() {     
    var ICDService = new icdService();
    var icds = [];
    icds.push({
        "code":"Unknown",
        "short":"Unknown",
        "long":"Unknown",
        "type":"icd-9"
    });

   return accountSchema.find()
    .select("_id")
    .then((accounts) =>{      
        var promiseArray = [];  
        accounts.forEach(function(account) {            
            promiseArray.push(AddToList(ICDService, account._id, icds));
        });     
        return Promise.all(promiseArray)
            .then((response) => {
                return response;
        });                                          
    });     
}    

function AddToList(ICDService, id, icds){    
     return ICDService.addList(id, icds)
     .then((data) => {
        return "OK"
     }, (error) =>{
        return "OK-E"
     });
}
