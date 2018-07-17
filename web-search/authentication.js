/* global Buffer */
'use strict';
//Authentication middleware
var passport         	    = require('passport');
//Authentication middleware bearer support
var BearerStrategy   	    = require('passport-http-bearer').Strategy;
//Authentication middleware role bearer support
var BearerAuthStrategy   	= require('./passport-http-role-bearer');
//Basic strategy for login get token
var BasicStrategy     	    = require('passport-http').BasicStrategy;
///Json web token based on JWT
var webToken		        = require('jsonwebtoken');
/* library that provides a whole mess of useful functional */
var underscore              = require('underscore');
//user mongoose model
var userSchema              = require('./web-user').WebUser;
/*Application error list*/
var appLogger                = require('../general/application-logger');
//Package Json
var packageJson             = require('../package.json');

//Please change this secret key or combine the secret key with user id
var jwtTokenSecret = "stepscanWebjwtTokenSecret";
var tokenIssuer = "Stepscan.Web"; 

function encrypt(user){
        
    var userEncrypt = {
        'id'        : user._id,
        'userId'    : user.userName,
        'role'     : user.role,
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
passport.use("web-bearer",new BearerStrategy(
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
passport.use("web-role-bearer", new BearerAuthStrategy(
  function(token, role, done) {
    if(!role){
        return  done("Invalid authorization");
    }  
	webToken.verify(token, jwtTokenSecret, function(err, decoded){
		if(err){
			if (err) { return done(err); }
		}else{
            var user =  decrypt(decoded);                      
            if(user.role !== role){
                return done("authorization failed");
            }            
			return done(null, user);
		}		
	});	
  }
));

/*
	Login with user credential and generate the token
 */
passport.use("web", new BasicStrategy(    
  function(username, password, callback) {
      userSchema.findOne({'userName': username})              
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
                                                                                                                

                      var newUser = encrypt(user);
                      var days_in_sec=  1 * 24 * 60 * 60;
                      var token = webToken.sign(newUser, jwtTokenSecret, {expiresIn: days_in_sec, issuer: tokenIssuer});

                      var userInfo = {
                          name: user.firstName + ' ' + user.lastName,
                          role: user.role
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
exports.verifyRole = function(user, role, next) {
  if(user !== null){   
      if(user.role === role){
        return next(null);
      }else{
        return next(new Error('You don\'t have permission to access this method'));
      }      
    }  
  return next(new Error(appLogger.expectionList.NULL_USER.value, appLogger.expectionList.NULL_USER.code));
};


/**
 * [Authenticate the service access]
 * @type {Boolean}
 */
exports.isAuthenticated = passport.authenticate(['web-bearer'], { session : false });

/**
 * When user trying to login to service
 * @type {[type]}
 */
exports.Login = passport.authenticate(['web'], { session : false });

/**
 * [Authenticate the service access based on role]
 * @type {Boolean}
 */
exports.isRoleAuthenticated = passport.authenticate(['web-role-bearer'], { session : false });