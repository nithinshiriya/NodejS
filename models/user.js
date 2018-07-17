'use strict';

/**
 * User Model.
 */

/*hash out password*/
var bcrypt = require('bcrypt-nodejs');
/*mongoose-unique-validator is a plugin which adds pre-save validation for unique fields within a Mongoose schema*/
var uniqueValidator = require('mongoose-unique-validator');
/* mongoose for mongodb */
var mongoose = require('mongoose'),
				Schema = mongoose.Schema,
				ObjectIdSchema = Schema.ObjectId,
				ObjectId = mongoose.Types.ObjectId;
/*Application constant*/
var constant    = require('../general/application-constant');
/*Additional Validation functions for  mongoose schema.*/
var validate = require('mongoose-validate');
/*Application error list*/
var appError                = require('../general/application-logger');
/* library that provides a whole mess of useful functional */
var underscore              = require('underscore');


/**
 * [User Schema]
 */
var UserSchema = new Schema({
		userName			    : {type: String, required: [true, 'Username should not empty.'], index: true,  unique: true, validate: [validate.email, constant.ERROR_INVALID_EMAIL] },
		password			    : {type: String, required: [true, 'Password should not empty.']},
		firstName			    : {type: String, required: [true, 'First Name should not empty.']},
		lastName			    : {type: String, required: [true, 'Last Name should not empty.']},
        phoneNo  			    : {type: String},
        isActive                : {type: Boolean, required: true, default: true},
		createdDate		        : {type: Date, required: true, default: Date.now()},
        modifiedDate            : {type: Date, required: true, default: Date.now()},
        accounts                : [{type: Schema.Types.ObjectId, ref: 'Account' }]
	});

/*Unique constraint applying*/
UserSchema.plugin(uniqueValidator, { message: 'Someone already has this Username. Try a different one.'} );

/**
 * [Excutes before each UserSchema.Save() call]
 *  Schema validation.
 * @param  {Function} callback
 * @return {[type]}
 */
UserSchema.pre('save', function(callback){
	var user = this;  

  //Set modified date.
  user.modifiedDate = Date.now();

  // Break out if the password hasn't changed
  if (!user.isModified('password')) return callback();	

  // Password changed so we need to hash it
  bcrypt.genSalt(5, function(err, salt) {
    if (err) return callback(err);

    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) return callback(err);
      user.password = hash;
      callback();
    });
  });

});

/**
 * [verify the password by decrypt algoritham]
 * @param  {[type]}   password
 * @param  {Function} cb
 * @return {[type]}
 */
UserSchema.methods.verifyPassword = function(password, cb) {
  bcrypt.compare(password, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

/**
 * [validating role filed that doesn't contain invalid role.]
 * @param  {Function} callback
 * @return {[type]}
 */
UserSchema.methods.validateRole = function(callback){
  var length = this.roles.length;
  if(length === 0){
      var error =  new Error(appError.EMPTY_ARRAY.value + " Type");
      error.code = appError.EMPTY_ARRAY.code;
      return callback( error);
    }
    var roles = this.roles;
    var realTypes = constant.ROLE_TYPES.roles;
    roles.some(function(role){
        if(underscore.indexOf(realTypes, role) === -1){
            var error =  new Error(appError.INVALID_ROLE.value);
            error.code = appError.INVALID_ROLE.code;
            return callback(error);
        }
    });
    this.roles =  underscore.uniq(roles);
    callback(null, true);
};

UserSchema.methods.Validate = function(callback){
    var user = this;

    //Validate the role is not empty
    if(user.validateRole( function(err) {
            if(err) return callback(err);
        }));

    //Set modified date.
    user.modifiedDate = Date.now();

    // Break out if the password hasn't changed
    if (!user.isModified('password')) return callback();

    // Password changed so we need to hash it
    bcrypt.genSalt(5, function(err, salt) {
        if (err) return callback(err);

        bcrypt.hash(user.password, salt, null, function(err, hash) {
            if (err) return callback(err);
            user.password = hash;
            callback();
        });
    });
}


/**
 * [Export userSchema]
 * @type {[type]}
 */
exports.UserSchema = UserSchema;
