
mongoConnection =  require('../database/db-connection');

module.exports = function(grunt) {
    grunt.registerTask("dbConnectTask", function(args){
            var done = this.async();        
            var task = grunt.config('dbConnectTask').task;        
            var dbPath = task.url; 
            var cipher = task.cipher;        
            mongoConnection.connect(dbPath, cipher)
                .then(function(){
                    done();
                }, error =>{
                    done(error);
                });                
    });
}