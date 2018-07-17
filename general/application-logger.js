/**
 * Created by Nitheen on 2/4/2015.
 */
'use strict';
var util = require('util');
//Logger
var Logger                  = require('bunyan');
//Pretty Stream
var PrettyStream = require('bunyan-prettystream');
//Package Json
var packageJson             = require('../package.json');

var prettyStdOut = new PrettyStream();
prettyStdOut.pipe(process.stdout);

var log = new Logger({
    name: 'stepscanLogger',
    streams: [
        {
            level: 'info',
            stream: prettyStdOut
        },
        {
            type: 'rotating-file',
            level: 'error',
            path: packageJson.stepscan.logpath + packageJson.stepscan.errorFileName,
            period: '1d',   // daily rotation
            count: 10        // keep 10 back copies
        }
        // {
        //     type: 'rotating-file',
        //     level: 'debug',
        //     path: packageJson.stepscan.logpath + packageJson.stepscan.debugFileName,
        //     period: '1h',   // daily rotation
        //     count: 10        // keep 10 back copies
        // },
        // {
        //     type: 'rotating-file',
        //     level: 'error',
        //     path: packageJson.stepscan.logpath + packageJson.stepscan.errorFileName,
        //     period: '1h',   // daily rotation
        //     count: 10        // keep 10 back copies
        // }
    ]
});

exports.lastError = "";
exports.Logger = log;

exports.expectionList = {
    NULL_PARAMETER              : {name: 'Application', code: 500, value:'Null parameter.' , locKey: 'Api_NullParameter'},
    NULL_USER                   : {name: 'Application', code: 501, value:'User information is null.', locKey: 'Api_UserInfoIsNull'},
    INVALID_TYPE                : {name: 'Application', code: 502, value:'Invalid type found.', locKey: 'Api_InvalidType'},
    INVALID_ROLE                : {name: 'Application', code: 503, value:'Invalid role found.', locKey: 'Api_InvalidRole'},
    EMPTY_ARRAY                 : {name: 'Application', code: 504, value:'Empty array found.', locKey: 'Api_EmptyArray'},
    USER_NOT_FOUND              : {name: 'Application', code: 505, value:'User not found.', locKey: 'Api_UserNotFound'},
    ACCOUNT_NOT_FOUND           : {name: 'Application', code: 506, value:'Account not found.', locKey: 'Api_AccountNotFound'},
    INVALID_PASSWORD            : {name: 'Application', code: 507, value:'Invalid password.', locKey: 'Api_InvlidPassword'},
    IN_ACTIVE_ACCOUNT           : {name: 'Application', code: 508, value:'Account is in active.', locKey: 'Api_AccountInActive'},
    ID_FIELD_NOT_FOUND          : {name: 'Application', code: 509, value:'ID field not found in given object.', locKey: 'Api_IDFieldNotFound'},
    NOT_FOUND                   : {name: 'Application', code: 510, value:'Not found.', locKey: 'Api_NotFound'},
    DUPLICATE                   : {name: 'Application', code: 511, value:'Duplicate value.', locKey: 'Api_Duplicate'},
    PATIENT_NOT_FOUND           : {name: 'Application', code: 512, value:'Patient not found.', locKey: 'Api_PatientNotFound'},
    SAMPLE_NOT_FOUND            : {name: 'Application', code: 513, value:'Sample not found.', locKey: 'Api_SampleNotFound'},
    SAMPLE_FILE_NOT_FOUND       : {name: 'Application', code: 513, value:'Sample file not found.', locKey: 'Api_SampleFileNotFound'},
    REPORT_KEY_NOT_FOUND        : {name: 'Application', code: 513, value:'Report key not found.', locKey: 'Api_ReportKeyNotFound'},
    INVALID_ARGUMENT_TYPE       : {name: 'Application', code: 514, value:'invalid argument type found.', locKey: 'Api_InvlidArgument'},
    USER_ACCOUNT_INACTIVE       : {name: 'Application', code: 515, value:'Your account has been deactivated. Please contact your organization.', locKey: 'Api_AccountDeactivated'},
    USER_INACTIVE               : {name: 'Application', code: 516, value:'Your account has been deactivated. Please contact Strepscan.com', locKey: 'Api_AccountDeactived2'},
    INVALID_QUERY               : {name: 'Application', code: 517, value:'Invalid search query string.', locKey: 'Api_InvalidQuery'},
    MASTER_USER_DEACTIVATE      : {name: 'Application', code: 518, value:'Master user cannot be deactivated.', locKey: 'Api_MasterCannotDeactived'},
    MASTER_USER_PERMISSION      : {name: 'Application', code: 518, value:'Permissions cannot be changed to master user.', locKey: 'Api_PermisionCannotChanged'},
    MASTER_USER_DELETE          : {name: 'Application', code: 518, value:'Master user cannot be deleted.', locKey: 'Api_MasterDeletedNotPermitted'},
    CAMERA_FILE_NOT_FOUND       : {name: 'Application', code: 519, value:'Camera file not found.', locKey: 'Api_CameraFileNotFound'},
    INVOICE_FAILED              : {name: 'Application', code: 520, value:'Invoice generation failed.', locKey: 'Api_InvoiceFailed'},
    INVALID_FILE_TYPE           : {name: 'Application', code: 521, value:'Invalid file type.', locKey: 'Api_InvlaidFileType'},
    PERMISSION_DENIED_STD       : {name: 'Application', code: 522, value:'Permission denied. The type is Global.', locKey: 'Api_PermissionDenied'},
    GLOBAL_DATA_DELETE          : {name: 'Application', code: 523, value:'You donot have permission to delete global data.', locKey: 'Api_DeletePermissionGlobal'},
    GLOBAL_DATA_EDIT            : {name: 'Application', code: 523, value:'You donot have permission to edit global data.', locKey: 'Api_EditPermissionGlobal'},
    DUPLICATE_PATIENT_ID        : {name: 'Application', code: 524, value:'Duplicate patient ID.', locKey: 'Api_DuplocatePatient'}
};

exports.getError = function(error, message){
    var newError = new Error(error.value);
    newError.code = error.code;
    writeError(newError, message);
    exports.lastError = newError;
    return newError;
};

exports.formatError = function(err){
    writeError(err);
    exports.lastError = err;
    switch (err.name){
        case 'ValidationError':
            return ValidationError(err);
        case 'Application':
            return err;
        default:
            return {code:2222,  value:err};
    }
};

exports.logError = function(error, message){
    writeError(error, message);
};

exports.debugInfo = function(message, message2){
   log.info(message, message2);
};

var writeError = function(error, message){
   log.error(error, message);
};

var ValidationError =  function(err){
    var messages = {
        'required': "%s is required.",
        'min': "%s below minimum.",
        'max': "%s above maximum.",
        'enum': "%s not an allowed value.",
        'user defined': "%s is duplicate :%s."
    };

    //A validationError can contain more than one error.
    var errors = [];

    //Loop over the errors object of the Validation Error
    Object.keys(err.errors).forEach(function (field) {
        var eObj = err.errors[field];
        console.log(eObj);
        //If we don't have a message for `type`, just push the error through
        if (!messages.hasOwnProperty(eObj.type)){ 
            if(eObj.message.startsWith('Path')){
                errors.push(capitalizeFirstLetter(util.format(messages[eObj.kind], eObj.path)));
            }else{
                errors.push(eObj.message);
            }            
        } else if (eObj.type === 'user defined') {
            errors.push(capitalizeFirstLetter(util.format(messages[eObj.type], eObj.path, eObj.value)));
        } else {            
            errors.push(capitalizeFirstLetter(util.format(messages[eObj.type], eObj.path)));
        }
    });    
    return {code:2000,  value:errors};
};

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}