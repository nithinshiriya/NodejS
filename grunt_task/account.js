/**
 * Created by Nitheen on 7/8/2015.
 */
/**
 * Created by Nitheen on 3/28/2015.
 */
var mongoose 		= require('mongoose'),    
    userSchema    = require('../models/mongoose-model').User,
    constant        = require('../general/application-constant');

module.exports = function(grunt) {

    grunt.registerMultiTask('accountid', function() {         
        var done = this.async();
        var self = this;        
        var dbPath = self.data.db;        
        var userName = grunt.option('user');
        mongoose.connection.on('error', function(err) {
            console.error('Failed to connect to DB ' + ' on startup ', err);
        });

        mongoose.connect(dbPath , function(err) {
            if (err) {
                grunt.log.error(err);
                mongoose.disconnect(done);
            }
            userSchema.findOne({userName: userName}, function(err, user){                
                if(err || !user){
                    grunt.log.error('User not found: ' + userName);
                    done();
                }else{
                    grunt.log.writeln("Account Id: " + user.accounts[0]);
                    done();
                }
            })
        });
    });
};
