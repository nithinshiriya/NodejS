/**
 * Created by Nitheen on 3/20/2015.
 */
'use strict';
var SampleInterface = {
    getSampleModel: function(sample, omitFields) {},
    addSample: function(accountId, userId, sample){},
    SampleFile: function(accountId, userId, sampleId, filePath, hasReport){},
    getSampleById: function(sampleId){},
    getSampleByAccountId: function(accountId, sampleId){},
    getSampleByQuery: function(query){},
    getAll: function(accountId){},
    SampleFileStream : function(fileId,res){},
    getPatientsAllSample: function(patientId){}
};

exports.ISample = SampleInterface;