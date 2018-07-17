/**
 * Created by Nitheen on 3/9/2015.
 */
'use strict';
var mongoConnection =  require('../database/db-connection');

module.exports = function(grunt) {

    grunt.registerMultiTask('databaseClean', function() {
        var done = this.async();
        var self = this;
        if(self.data.delete) {
            var task = grunt.config('dbConnectTask').task;                    
            var dbPath = task.url; 
            var cipher = task.cipher;        
            mongoConnection.connect(dbPath, cipher)
                .then(function(){
                    console.log( mongoConnection.getMongoose());
                    mongoConnection.getMongoose().connection.db.dropDatabase();
                    mongoose.disconnect(done);                                    
                }, error =>{
                    done(error);
                }); 
        }else{
            grunt.log.writeln('DB clean canceled');
            done();
        }

    });
};