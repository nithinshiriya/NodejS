
mongoConnection =  require('../database/db-connection');

module.exports = function(grunt) {
    grunt.registerTask("dbDisConnectTask", function(args){
            var done = this.async();            
            mongoConnection.disconnect();
            done();       
    });
}