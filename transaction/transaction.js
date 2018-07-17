/**
 * Created by Nitheen on 1/6/2016.
 */
'use strict';

/**
 * Transaction Model.
 */

/*Short ID 32*/
var shortid = require('shortid32');
/* mongoose for mongodb */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

//Schema types => long and double
var SchemaTypes = mongoose.Schema.Types;

shortid.characters("23456789ABCDEFGHJKLMNPQRSTUVWXYZ");


    //_id                             : {type: String, unique: true,  default: shortid.generate},
/**
 * [Transaction Schema]
 */
var TransactionSchema = new Schema({
    _id                             : {type: String, unique: true},
    accountId                       : {type: SchemaTypes.ObjectId, required: true},
    sampleId                        : {type: SchemaTypes.ObjectId, required: true, ref: 'Sample'},
    createdBy                       : {type: SchemaTypes.ObjectId, required: true, ref: 'User'},
    createdDate                     : {type: Date, required: true, default: Date.now()}
});

TransactionSchema.virtual("id").get(function() {
   return this._id;
});

//Renaming the fields when converting to JSON.
TransactionSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;

        ret.sample = ret.sampleId;
        if (ret.sample){
            ret.sample.id = ret.sample._id;
            delete ret.sample._id;
        }
        delete ret.sampleId;

        if(ret.createdBy){
            ret.createdBy.id = ret.createdBy._id;
            delete ret.createdBy._id;
        }
    }
});

var Transaction = mongoose.model('Transaction', TransactionSchema);
// promise.promisifyAll(Transaction);
// promise.promisifyAll(Transaction.prototype);

exports.Transaction = Transaction;
