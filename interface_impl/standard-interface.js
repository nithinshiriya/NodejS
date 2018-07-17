/**
 * Created by Nitheen on 4/7/2015.
 */
'use strict';
var StandardInterface = {
    getStandardList: function(accountId){},
    getStandardById: function(standardId){},
    saveStandard: function(accountId, userId, reportType, standard){},
    editStandard: function(accountId, userId, standardId , modifyStandard){},
    deleteStandard: function(accountId, userId, standardId) {}
};

exports.IStandard = StandardInterface;