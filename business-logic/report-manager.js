/**
 * Created by Nitheen on 4/1/2015.
 */
'use strict';
/*Application error list*/
var appError                = require('../general/application-logger');
/*Application constant*/
var constant                = require('../general/application-constant');

module.exports = function(AccountFactory, ReportFactory) {
    function hasKeyValue(tabs, key) {
        var hasValue = false;
        var tabCount = tabs.length;
        for(var i=0; i< tabCount; i++){
            var tab = tabs[i].items;
            var itemCount = tab.length;
            for(var j = 0; j <itemCount; j++){
                if(tab[j].hasOwnProperty('typeValue')){
                    var typeValue = tab[j].typeValue;
                    if(typeValue.hasOwnProperty('reportKey')){
                        if(typeValue.reportKey === key) {
                            hasValue = true;
                            break;
                        }
                    }
                }
            }
            if(hasValue) break;
        }
        return hasValue;
    }
    return {
        getReportByKey: function(user, reportKey){
            return AccountFactory.getUserAccountByUserId(user.id, user.userId)
                .then(function(account){
                    if(account === null) {return Promise.reject(appError.expectionList.ACCOUNT_NOT_FOUND);}
                        var accountObject = account.toObject();
                        var tabs = accountObject.software.tabs;
                        if(hasKeyValue(tabs, reportKey)){
                            return reportKey;
                        }else {
                            return Promise.reject(appError.expectionList.REPORT_KEY_NOT_FOUND);
                        }
                })
                .then(function(reportKey){
                    return ReportFactory.getReportByKey(reportKey);
                })
                .then(function(report){
                    return report
                }, function(error){
                return Promise.reject(appError.formatError(error));
            });
        }
    }
};