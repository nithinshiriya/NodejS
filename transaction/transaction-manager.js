/**
 * Created by Nitheen on 1/7/2016.
 */
'use strict';
var Transaction             = require('./transaction').Transaction;

module.exports = function(){

    var userPopulate =  '_id firstName lastName';
    var samplePopulate =  '_id createdDate type';
    
    function getTransaction(query){
        return Transaction.find(query)
            .populate('createdBy' ,userPopulate)
            .populate('sampleId', samplePopulate)
            .exec()
    }

    return {
        addTransaction: function(user, sampleId){
            if(user.payPerUse === false){
                return Promise.resolve("Not Signed for Pay per use");
            }
                        
            var today = new Date();
            var year = today.getFullYear().toString().substr(2,2);
            var month = ('0'+(today.getMonth()+1)).slice(-2);
            var day = ('0'+(today.getDate())).slice(-2) ;     
            
            var transId = "S" + user.accNo + year + month + day;            
            
            var startDate =  new Date(today.getFullYear(), today.getMonth(), today.getDate());            
            var endDate  = new Date(today.getFullYear(), today.getMonth(), today.getDate());                 
            endDate.setDate(endDate.getDate() + 1);
            
            var query = {
                accountId :  user.id,
                createdDate : {$gte : startDate, $lte: endDate}
            };
                                    
            return Transaction.count(query)
            .exec()
            .then(function(count){                
                transId = transId + (count+1);                
                return transId
            })
            .then(function(newTransId){
                var trans =  new Transaction();
                trans._id = newTransId;
                trans.sampleId = sampleId;
                trans.accountId = user.id;
                trans.createdBy = user.userId;
                return trans.save()
                    .then(function (transaction) {                        
                        return transaction._id;
                    })                
            })            
        },
        getTransactionList: function(user, startDateStr, endDateStr){
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
                accountId :  user.id,
                createdDate : {$gte : startDate, $lte: endDate}
            };
            return getTransaction(query);
        },

        getTransactionById: function (user, invoiceId){
            var query = {
                accountId :  user.id,
                _id : invoiceId.toUpperCase()
            };            
            return getTransaction(query);
        }

    }
};