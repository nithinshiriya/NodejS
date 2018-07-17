'use strict';
/**
 * Account Model.
 *
 */


/* mongoose for mongo db */
var mongoose = require('mongoose'),
        Schema = mongoose.Schema,
        ObjectIdSchema = Schema.ObjectId,
        ObjectId = mongoose.Types.ObjectId;

/* User model*/       
var modelUser = require('./user');

/*Application constant*/
var constant    = require('../general/application-constant');
/*Application error list*/
var appError                = require('../general/application-logger');
/* library that provides a whole mess of useful functional */
var underscore              = require('underscore');
var applicationTypes        = require("../general/account-types");

/**
 * [Account schema]
 */
var AccountSchema = new Schema({
    types             : [String],
    accountNo         : {type: Number},
    entityName        : {type: String, required: true, index: true},
    phoneNo           : {type: String},
    address1          : {type: String},
    address2          : {type: String},
    city              : {type: String},
    state             : {type: String},
    zip               : {type: String},
    logo              : {type: String},
    payPerUse         : {type: Boolean, default: false },  
    isActive          : {type: Boolean, required: true, default: true },    
    createdDate       : {type: Date, default: Date.now()},
    modifiedDate      : {type: Date, required: true, default: Date.now()},
    software          : {
        reportHeaderColor : {type: String},
        allowCameraFile   : {type: Boolean, default: false},  
        tabs          : [
            {
                name            : {type: String, required: true},
                title           : {type: String, required: true},
                ViewName        : {type: String, required: true},
                enumName        : {type: String, required: true},
                automatedTest   : {type: Boolean, required: true, default: false},
                deafultViewName : {type: String, required: true},
                items : [
                    {
                        name            : {type: String, required: true},
                        title           : {type: String, required: true},
                        ViewName        : {type: String, required: true},
                        type            : {type: String},
                        isTreeViewItem  : {type: Boolean},
                        typeValue       : {}
                    }
                ],
                viewService     : {}
            }
        ]
    },
    project_session          : {
        defProjectId    :  {type: String},
        projects        :  [{
        name          : {type: String, required: true},
        description   : {type: String, required: true},
        createdDate   : {type: Date, default: Date.now()},
        modifiedDate  : {type: Date, required: true, default: Date.now()},
        createdBy     : {type: Schema.Types.ObjectId, required: true, ref: 'User'},
        modifiedBy    : {type: Schema.Types.ObjectId, required: true, ref: 'User'},
        isActive      : {type: Boolean, required: true, default: true },
        defSessionId  : {type: String},
        sessions       : [{
              name          : {type: String, required: true},
              description   : {type: String, required: true},
              createdDate   : {type: Date, default: Date.now()},
              modifiedDate  : {type: Date, required: true, default: Date.now()},
              createdBy     : {type: Schema.Types.ObjectId, required: true, ref: 'User'},
              modifiedBy    : {type: Schema.Types.ObjectId, required: true, ref: 'User'},
              isActive      : {type: Boolean, required: true, default: true }
          }]
      }]},
    users             :[
        {
            user            : {type: Schema.Types.ObjectId, ref: 'User'},
            isActive        : {type: Boolean, required: true, default: true },
            role            : {type: String, require: true, enum: constant.ROLE_TYPES.allTypes },
            permissions     : [{type:String}],
            isMaster        : {type: Boolean, required: true, default: false }
        }
    ]
  });


/**
 * [Execute before each AccountSchema.save() call.]
 * Add all schema validation here.
 * @param  {Function} callback
 * @return {[type]}
 */
AccountSchema.pre('save', function(callback) {
  var account = this;

    // validate account types
    if(account.validateType( function(err) {
            if(err) return callback(err);
        }));

    //Set Modified Date
  account.modifiedDate = Date.now();
    
  callback();
});

/**
 * [validating role filed that doesn't contain invalid role.]
 * @param  {Function} callback
 * @return {[type]}
 */
AccountSchema.methods.validateType = function(callback){
    var length = this.types.length;    
    if(length === 0) {
        var error =  new Error(appError.EMPTY_ARRAY.value + " Type");
        error.code = appError.EMPTY_ARRAY.code;
        return callback( error);
    }
    var types = this.types;
    var realTypes = applicationTypes.getAllAccountTypes();
    
    types.some(function(type){
        if(underscore.indexOf(realTypes, type) === -1){
            var error =  new Error(appError.INVALID_TYPE.value);
            error.code = appError.INVALID_TYPE.code;
            return callback(error);
        }
    });
    this.types =  underscore.uniq(types);
    
    callback(null, true);
};

/**
 * [Export AccountSchema]
 * @type {[type]}
 */
exports.AccountSchema = AccountSchema;


