/**
 * Created by Nitheen on 2/4/2015.
 */
'use strict';

exports.expectionList = {
    NULL_PARAMETER              : {code: 500, value:'Null parameter'},
    NULL_USER                   : {code: 501, value:'User information is null'},
    INVALID_TYPE                : {code: 502, value:'Invalid type found'},
    INVALID_ROLE                : {code: 503, value:'Invalid role found'},
    EMPTY_ARRAY                 : {code: 504, value:'Empty array found'},
    USER_NOT_FOUND              : {code: 505, value:'User not found'},
    ACCOUNT_NOT_FOUND           : {code: 506, value:'Account not found'},
    INVALID_PASSWORD            : {code: 507, value:'Invalid password'},
    IN_ACTIVE_ACCOUNT           : {code: 508, value:'Account is in active'},
    ID_FIELD_NOT_FOUND          : {code: 509, value:'ID field not found in given object'},
    GLOBAL_DATA                 : {code: 510, value:'You do not have permission to delete global data'}
};

exports.getError = function(error){
    var newError = new Error(error.value);
    newError.code = error.code;
    return newError;
};
