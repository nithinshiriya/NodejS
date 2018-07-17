/**
 * Created By Nitheen Rao T On 4/27/2016
 */

'use strict'
var specificationSchema    = require('../models/mongoose-model').Specification;
/*Application error list*/
var appError                = require('../general/application-logger');

var selectOmitFields = {accountId:0, createdDate:0};


module.exports  = function (appId) {    
    function add(accountId, specification){
        return specificationSchema.findOne({short: specification.short, key: specification.key, type: specification.type })
            .exec()
            .then(function(s) {
                    if(s === null){                        
                        if(appId == accountId){
                            return specification.code;
                        }else{
                            return specificationSchema.find({ key: specification.key})
                            .sort({code: -1}).limit(1)
                            .exec()
                            .then( (maxCode) =>{
                                var code = 500;
                                if(maxCode.length !== 0 &&  maxCode[0].code >= 500){
                                    code = maxCode[0].code + 1;    
                                }
                                return code;
                            })
                        }
                    }
                    return Promise.reject(appError.expectionList.DUPLICATE);
                })
                .then(code =>{
                        var newSpecification = new specificationSchema();
                        newSpecification.accountId = accountId;                        
                        newSpecification.code =  code;
                        newSpecification.short =  specification.short;
                        newSpecification.long =  specification.long;
                        newSpecification.type =  specification.type;
                        newSpecification.key = specification.key;
                        return newSpecification.save();                     
                });                                                                                    
    }
    
    return {
        /**
         * Insert specification.
         * If duplicate do not insert.
         */
        add : function(accountId, specification) {
             return add(accountId, specification);
        },
        
        addList: function(accountId, specifications){
            if(specifications){
                specifications.forEach(function(specification){
                    add(accountId, specification);
                });
            }
        },
        
        update: function(specificationId, shortName, longName, type){
            var update = {$set: {short: shortName, long: longName, type: type}};
            return specificationSchema.findOneAndUpdate( {_id: specificationId}, update, true).exec();             
        },

        getId: function(code, type, key){               
             return specificationSchema.findOne({code: code, type: type, key: key })
             .exec()
             .then((specification) =>{                 
                 if(specification){                     
                     return specification._id.toString();
                 }
                 return Promise.reject(appError.expectionList.NOT_FOUND);
             });
        },
       
        delete: function(accountId, id) {
            return specificationSchema.remove({ accountId: accountId, _id: id}).exec();
        },   
             

        get: function(){
            return specificationSchema.find({}, selectOmitFields).exec();
        },

        getByKey: function(key){
            return specificationSchema.find({ key: key}, selectOmitFields).exec();
        },

        getById: function(id){
            return specificationSchema.findOne({ _id: id}, selectOmitFields).exec();
        }
                 
    }    
}
