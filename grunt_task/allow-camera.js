/**
 * Created by Nitheen on 7/8/2015.
 */
/**
 * Created by Nitheen on 3/28/2015.
 */
var accountSchema    = require('../models/mongoose-model').Account,
    constant        = require('../general/application-constant');

module.exports = function(grunt) {

    grunt.registerMultiTask('allowCamera', function() {
        var done = this.async();        
        var task = grunt.config('allowCamera').task;        
        var allow =  task.allow;

        accountSchema.find()
        .select("_id software")
        .then(function(accounts){
            var promiseArray = [];
            accounts.forEach(function(account) {
                promiseArray.push(update(account, allow));                                                                                  
            });                
            return Promise.all(promiseArray)
                .then((response) => {
                    return response;
                });                
        })
        .then((response) => {
            grunt.log.ok(response.length + " Accounts where updated");            
            done();                
        })
        .catch(function(error){
            grunt.log.error(error);            
            done();
        });         
    });
};

function update(account, val){    
    var tabs = [];                        
    account.software.tabs.forEach(function(tab) {
        constant.softwareTabs.forEach(function(stab) {        
            if(tab.key === stab.key){
               tabs.push(stab);   
            } 
        });                                                   
    });
    
    return accountSchema.findByIdAndUpdate(account._id, {$set: { 'software.allowCameraFile': val }})    
    .exec();

}   