/**
 * Created by Nitheen on 3/13/2015.
 */
var  request = require('superagent');

module.exports = function(grunt) {

    grunt.registerMultiTask('createAccount', function() {
        var done = this.async();
        var self = this;
        var emailId = 'sample1@email.com';
        var password = 'password';

        grunt.log.writeln(self.data.url);

        var account =  {
            entityName  :   'Stepscan',
            phoneNo     :   '902-111-2222',
            address     :   '91 wt st , ch, pei',
            userName	: 	emailId,
            password	: 	password,
            firstName	: 	'James',
            lastName	: 	'Bond',
            tabs        :   ['TabSearch', 'TabGait', 'TabBalance'],
            role        :   ['rlAdmin'],
            headerColor :   '#ffffff',
            type        :   'client',
            allowCameraFile : true,
            permissions :   ['prUserManagement', 'prProjectSession', 'prClient', 'prComparativeStat']
        };
        request.post(self.data.url + 'register')
            .type('json')
            .send(account)
            .end(function(err, res){
                if(err){
                    grunt.log.error(err);
                    done();
                    return;
                }
                if(res.statusCode === 200){
                    grunt.log.writeln('Account created :' + emailId + ' pwd: ' + password);
                }else{
                    grunt.log.writeln('Error occurred');
                }
               done();
            });
    });
};