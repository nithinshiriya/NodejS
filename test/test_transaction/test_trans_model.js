/**
 * Created by Nitheen on 1/26/2016. 
 */
'use strict';
let Transaction = require('../../transaction/transaction').Transaction,
    should      = require('should'),
    assert = require('assert');

describe.only('Test Transactoin Model', function() {
  describe('createdDate', function () {
    it('should return current date', function (done) {
      let trans =  new Transaction();
      console.log(trans.createdDate);
      done();      
    });
  });
});