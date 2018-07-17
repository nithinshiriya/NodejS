/**
 * Created by Nitheen on 4/7/2015.
 */
'use strict';
var appError                = require('../general/application-logger');
var constant                = require('../general/application-constant');
var underscore        	    = require('underscore');

module.exports = function(standardFactory) {

    return {
        getStandardById : function(user, standardId){
            return standardFactory.getStandardById(standardId)
                .then(function(standard){
                    return standard;
                },function(error){
                    return Promise.reject(appError.formatError(error));
                });
        },
        getAllStandards : function(user){
            return standardFactory.getStandardList(user.id)
                .then(function(standardList){
                    return standardList;
                },function(error){
                    return Promise.reject(appError.formatError(error));
                });
        },
        saveStandard : function(user, reportType,  standard){
            return standardFactory.saveStandard(user.id, user.userId, reportType, standard, 'Private')
                .then(function(newStandard){
                    return newStandard._id;
                },function(error){
                    return Promise.reject(appError.formatError(error));
                });

        },
        editStandard : function(user, standardId, standard){            
            return standardFactory.editStandard(user.id, user.userId, standardId, standard)
                .then(function(){
                    return Promise.resolve(constant.ok);
                },function(error){
                    return Promise.reject(appError.formatError(error));
                });
        },

        deleteStandard : function(user, standardId){
            if(!standardId) {return Promise.reject(appError.expectionList.NULL_PARAMETER);}
            return standardFactory.delete(user.id, user.userId, standardId)
                .then(function(){
                    return Promise.resolve(constant.ok);
                }, function(error){                    
                    return Promise.reject(appError.formatError(error));
                })
        },

        addNormativeFile: function(user, normativeId, files){
            if(!files) {
                return Promise.reject(appError.expectionList.NOT_FOUND);
            }            
            var file  = files[Object.keys(files)[0]];
            var filePath =  file.path;
            return standardFactory.AddFile(user.id, user.userId, normativeId, filePath)
            .then((fileid) =>{
                return fileid;
            }, (error) =>{
                return Promise.reject(appError.formatError(error));
            });
        },

        getNormativeFile: function(user, normativeId, res){
            return standardFactory.NormativeFileStream(normativeId, res);
        }

    }

};
