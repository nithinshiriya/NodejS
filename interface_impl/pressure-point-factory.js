/**
 * Created by Nitheen on 5/27/2015.
 */

var underscore        	    = require('underscore');
var PointSchema           = require('../models/mongoose-model').PressurePoint;

var PressurePoint  = function() {};

PressurePoint.prototype.addPoint = function(accountId, userid, points){

    var tmpPoints = underscore.omit(points, ['_id', 'accountId']);
    var newPoints = new PointSchema(tmpPoints);
    newPoints.accountId = accountId;
    newPoints.type = 'Private';
    newPoints.createdBy = userid;
    newPoints.modifiedBy = userid;
    return newPoints.save()
        .then(function (point) {
            return point;
        })
};

PressurePoint.prototype.getPoints = function(accountId){
        return PointSchema.find({$or : [{accountId:  accountId}, {type: 'Global'}]})
            .exec();
};

PressurePoint.prototype.deletePoint = function(accountId, pointId){
    return PointSchema.findByIdAndRemove(pointId).exec();
};

// Promise.promisifyAll(PressurePoint);
// Promise.promisifyAll(PressurePoint.prototype);

module.exports = PressurePoint;