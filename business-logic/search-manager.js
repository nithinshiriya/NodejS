/**
 * Created by Nitheen on 5/14/2015.
 */
'use strict';

/*Application error list*/
var appError                = require('../general/application-logger');

module.exports = function(sampleFactory, patientFactory) {

    return {
        project_session: function (accountId, project, session) {
            var search = [];
            if (project) {
                search.push({'project.name': project})
            }
            if (session) {
                search.push({'session.name': session})
            }

            var query = {
                accountId: accountId,
                $and: [
                    { $or : search}
                ]
            };

           return patientFactory.getByQuery(query);

        },

        byUser : function(accountId, userId){
            var query = {
                accountId :  accountId,
                createdBy : userId
            };
            return sampleFactory.getSampleByQuery(query);
        },

        byDate : function (accountId, startDateStr, endDateStr) {
            var startDate;
            var endDate;
            if(startDateStr){
                startDate = new Date(Date.parse(startDateStr));
            }

            if(endDateStr){
                endDate = new Date(Date.parse(endDateStr));
            }else{
                endDate = startDate;
            }
            endDate.setHours(endDate.getHours() + 24);

            var query = {
                    accountId :  accountId,
                    createdDate : {$gte : startDate, $lte: endDate}
                };

            return sampleFactory.sampleSearch(query);
        },

        byPatient: function(accountId, query){
            if(!query){
                return Promise.reject(appError.expectionList.INVALID_QUERY);
            }
            var userQuery = JSON.parse(query);
            var searchQuery = {
                accountId : accountId
            };

            if(userQuery.firstName){
                searchQuery.firstName = {
                    $regex : '.*' + userQuery.firstName + '.*',
                    $options: 'si'
                }
            }

            if(userQuery.lastName){
                searchQuery.lastName = {
                    $regex : '.*' + userQuery.lastName + '.*',
                    $options: 'si'
                }
            }

            if(userQuery.code){
                searchQuery.code = {
                    $regex : '.*' + userQuery.code + '.*',
                    $options: 'si'
                }
            }

            return patientFactory.getByQuery(searchQuery)
                .then(function(results){
                    return results;
                }, function(error){
                    return Promise.reject(appError.formatError(error));
                })
        }
    }
};