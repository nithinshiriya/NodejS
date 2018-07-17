/**
 * Created by Nitheen on 7/8/2015.
 */
/**
 * Created by Nitheen on 3/28/2015.
 */
var    webFactory      = require('../web-search/websearch-factory');    

module.exports = function(grunt) {

    grunt.registerMultiTask('webAccountCreationTask', function() {         
        var done = this.async();
        var self = this;
        var WebFactory = new webFactory(null)        

            var user = {
                userName: "test@email.com",                
                password:  "password",
                firstName: "Stepscan",
                lastName: "Stepscan",
                phoneNo: "9023251425"
            }
            WebFactory.addUser(user, 'admin')
            .then(function(msg, err){                
                if(err || !msg){
                    grunt.log.error('User creation failed: ' + err);
                    done();
                }else{
                    grunt.log.writeln("User created." + msg);
                    done();
                }
            })        
    });
};
