/**
 * Created By Nitheen Rao T On 4/27/2016
 */

'use strict'
var icdClientSchema           = require('../models/mongoose-model').ICDClient;
var icdMasterSchema           = require('../models/mongoose-model').ICDMaster;

module.exports  = function () {    
    function add(accountId, icd){
        return icdClientSchema.findOne({ accountId: accountId, code: icd.code})
            .exec()
            .then(function(clientIcd) {
                if(clientIcd === null){                        
                    var newIcd = new icdClientSchema();
                    newIcd.accountId = accountId;                        
                    newIcd.code =  icd.code.toString();
                    newIcd.short =  icd.short;
                    newIcd.long =  icd.long;
                    newIcd.type =  icd.type;
                    return newIcd.save();                        
                }                                            
                return clientIcd;
            });        
    }
    
    return {
        /**
         * Insert ICD code to client account.
         * If duplicate do not insert.
         */
        add : function(accountId, icd) {
             return add(accountId, icd);
        },
        
        addList: function(accountId, icdCodes){
            if(icdCodes){
                var promiseArray = [];
                icdCodes.forEach(function(icd) {
                    promiseArray.push(add(accountId, icd));                                                                                  
                });   
                return Promise.all(promiseArray)
                    .then((response) => {
                        return response;
                });  
            }
        },
        
        /**
         * Delete the ICD code from client account;
         */
        delete: function(accountId, icdCode) {
            return icdClientSchema.remove({ accountId: accountId, code: icdCode}).exec();
        }, 
        
        deleteById: function(accountId, id) {
            return icdClientSchema.remove({ accountId: accountId, _id: id}).exec();
        },   
             
        /**
         * Get All ICD code that are related to given account; 
         */             
        get: function(accountId){
            return icdClientSchema.find({ accountId: accountId}).exec();
        },
                 
        /**
         * Get ICD code by code for the given account. 
         */                 
        getByCode: function(accountId, icdCode){
            return icdClientSchema.findOne({ accountId: accountId, code: icdCode}).exec();
        },
                
        /**
         * Search ICD in master table.
         */
        search: function(searchText) {
            return icdMasterSchema.find({
                $or: [ { code : new RegExp(searchText,'i') }, {short: new RegExp(searchText,'i')}]
            }).exec();
        }
    }    
}
