/* global Buffer */
'use strict';
//Authentication middleware
var passport         	    = require('passport');
//Authentication middleware bearer support
var BearerStrategy   	    = require('passport-http-bearer').Strategy;
//Authentication middleware role bearer support
var BearerAuthStrategy   	= require('./passport-http-auth-bearer');
//Basic strategy for login get token
var BasicStrategy     	    = require('passport-http').BasicStrategy;
///Json web token based on JWT
var webToken		        = require('jsonwebtoken');
/* library that provides a whole mess of useful functional */
var underscore              = require('underscore');
//Account mongoose model
var account                 = require('../models/mongoose-model').Accounts;
//Account mongoose model
var userSchema              = require('../models/mongoose-model').User;
/*Application error list*/
var appLogger                = require('../general/application-logger');
//Package Json
var packageJson             = require('../package.json');

//Please change this secret key or combine the secret key with user id
var jwtTokenSecret = packageJson.stepscan.tokenSecret;
var tokenIssuer = packageJson.stepscan.tokenIssuer; 

function encrypt(user){
    var payPerUse = false;
    if(user.accounts[0].payPerUse){
        payPerUse = user.accounts[0].payPerUse;
    }
    
    var userEncrypt = {
        'id'        : user.accounts[0]._id,
        'userId'    : user._id,
        'roles'     : user.roles,
        'ac_type'  : user.accounts[0].types[0],
        'payPerUse' : payPerUse,
        'allowCamera' : user.accounts[0].software.allowCameraFile,
        'accNo'     : user.accounts[0].accountNo,
    };
    var stringUser =  new Buffer(JSON.stringify(userEncrypt)).toString('base64');
    return {
        'info': stringUser
    };
}

function decrypt(user){
    var userString = new Buffer(user.info, 'base64').toString('ascii');
    return JSON.parse(userString);
}


/* Validate the rest service using bearer token
 */
passport.use("api-bearer", new BearerStrategy(
  function(token, done) {
	webToken.verify(token, jwtTokenSecret, function(err, decoded){
		if(err){
			if (err) { return done(err); }
		}else{
            var user =  decrypt(decoded);
			return done(null, user);
		}		
	});	
  }
));

/**
 * Role Based bearer token
 */
passport.use("api-auth-bearer", new BearerAuthStrategy(
  function(token, auth, done) {
    if(!auth.type || !auth.roles){
        return  done("Invalid authorization");
    }  
	webToken.verify(token, jwtTokenSecret, function(err, decoded){
		if(err){
			if (err) { return done(err); }
		}else{
            var user =  decrypt(decoded);

            if(user.ac_type !== auth.type){
                return done("authorization failed");
            }
            
            var differenceList =  underscore.difference(user.roles, auth.roles);
            if( (differenceList.length - auth.roles.length ) === 0) {        
                return next("authorization failed");
            }

			return done(null, user);
		}		
	});	
  }
));

/*
	Login with user credential and generate the token
 */
passport.use("api", new BasicStrategy(    
  function(username, password, callback) {
      userSchema.findOne({'userName': username})
              .populate('accounts')
              .exec(function (err, user) {                    
                  if (err) {
                      appLogger.logError(err, username);
                      return callback(err);
                  }
                  if (user === null) {
                      return callback(appLogger.getError(appLogger.expectionList.USER_NOT_FOUND, username));
                  }
                  
                  user.verifyPassword(password, function (err, isMatch) {
                      if (err) {
                          appLogger.logError(err, username);
                          return callback(err, false);
                      }
                      // Password did not match
                      if (!isMatch) {
                          return callback(appLogger.getError(appLogger.expectionList.INVALID_PASSWORD, username));
                      }

                      //verify user has access to the system.
                      if (!user.isActive) {
                          return callback(appLogger.getError(appLogger.expectionList.USER_INACTIVE, username));
                      }
                                            
                      //<editor-fold desc="Verify user has the permission to access the account">
                      var account = user.accounts[0];
                      var accountUsers = account.users;
                      var isActiveUser = underscore.find(accountUsers, function (item) {
                          return item.user.toString() === user._id.toString();
                      });

                      if(isActiveUser) {
                          if (!isActiveUser.isActive) {
                              return callback(appLogger.getError(appLogger.expectionList.USER_ACCOUNT_INACTIVE, username));
                          }
                      }else{
                          return callback(appLogger.getError(appLogger.expectionList.USER_NOT_FOUND, username));
                      }
                      //</editor-fold>
                                              

                      if (!account.isActive) {
                          return callback(appLogger.getError(appLogger.expectionList.IN_ACTIVE_ACCOUNT, username))
                      }

                      var newUser = encrypt(user);
                      var days_in_sec=  1 * 24 * 60 * 60;
                      var token = webToken.sign(newUser, jwtTokenSecret, {expiresIn: days_in_sec, issuer: tokenIssuer});

                      var userInfo = {
                          name: user.firstName + ' ' + user.lastName
                      };

                      // Success
                      appLogger.debugInfo('login success %s', username);
                      return callback(null, {'token': token, 'userInfo': userInfo});
                  });
              });
  }

));


/**
 *
 * @param user
 * @param ac_permissions
 * @param role_permissions
 * @param next
 * @returns {*}
 */
exports.verifyPermission = function(user, ac_permissions, role_permissions, next) {
  if(user !== null){
   if(ac_permissions && role_permissions){
      var differenceList =  underscore.difference(user.roles, permission);
      if( (differenceList.length - user.roles.length ) !== 0) {        
        return next(null);
      }
      return next(new Error('You don\'t have permission to access this method'));
   }
    return next(new Error('Invalid permission type')); 
  }
  return next(new Error(appLogger.expectionList.NULL_USER.value, appLogger.expectionList.NULL_USER.code));
};




/**
 * [Authenticate the service access]
 * @type {Boolean}
 */
exports.isAuthenticated = passport.authenticate(['api-bearer'], { session : false });

/**
 * When user trying to login to service
 * @type {[type]}
 */
exports.Login = passport.authenticate(['api'], { session : false });

/**
 * [Authenticate the service access based on role]
 * @type {Boolean}
 */
exports.isRoleAuthenticated = passport.authenticate(['api-auth-bearer'], { session : false });