/**
 * Created by Nitheen on 2/4/2015.
 *//*

'use strict';
*/
/* library that provides a whole mess of useful functional *//*

var underscore        	    = require('underscore');
*/
/*Application error list*//*

var appError                = require('../general/app-exception');
//Account mongoose model
var accountSchema           = require('../models/mongoose-model').Accounts;
*/
/*Application constant*//*

var constant                = require('../general/application-constant');
*/
/**
 * Add new account and callback with error or account ID.
 * @param account
 * @param next
 * @returns {*}
 *//*

exports.addAccount = function(account, next){
    if(!account) {
        var error = new Error(appError.NULL_PARAMETER.value);
        error.code = appError.NULL_PARAMETER.code;
        return next(error);
    }

    //Get account types if any
    var types = account.types;
    var user  = account.users;

    if(!user) {return next(new Error(appError.NULL_USER.value, appError.NULL_USER.code));}

    //Delete account types and user from the list
    account = underscore.omit(account, 'types', 'users');

    //Create account model from the data
    var _account =  new accountSchema(account);

    //Add types if any or default one
    if(types){
        _account.types.push(types[0]);
    }else{
        _account.types.push(constant.ACCOUNT_TYPES.ac_stepscan_empty);
    }

    //Add user information and default permission.
    var newUser = underscore.omit(user[0], 'roles');
    newUser.roles = [];
    newUser.roles.push(constant.ROLE_TYPES.rlSiteAdmin);

    //Add user to account
    _account.users.push(newUser);

    _account.save( function(err){
        return err ? next(err) : next(null, constant.ok);
    });
};


exports



exports.addPatient = function(patient, next){
    if(!patient) {return next(new Error(appError.NULL_PARAMETER.value, appError.NULL_PARAMETER.code));}
};*/
