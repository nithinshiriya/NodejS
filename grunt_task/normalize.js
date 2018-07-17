/**
 * Created by Nitheen on 7/8/2015.
 */
/**
 * Created by Nitheen on 3/28/2015.
 */
var standardFactory =  require('../interface_impl/standard-factory'), 
    accountSchema    = require('../models/mongoose-model').Account,   
    constant        = require('../general/application-constant');

module.exports = function(grunt) {

    grunt.registerMultiTask('normalizeSample', function() {
        var done = this.async();        

       accountSchema.find()
            .select("_id users")
            .then((accounts)=>{
                    var promiseArray = [];
                    accounts.forEach(function(account) {
                        promiseArray.push(updateNormalize(account));                                                                                  
                    }); 
                    return Promise.all(promiseArray)
                        .then((response) => {
                            return response;
                    });                                               
            })
            .then((response) => {                
                grunt.log.ok(response.length + " Accounts where updated");                
                done();                
            })
            .catch(function(error){
                grunt.log.error(error);            
                done();    
            });                                       
        })              
};

function updateNormalize(account){    
    var factory = new standardFactory();
    return factory.getStandardList(account._id)
    .then((standardList) =>{        
        var newList = getNewStandardList();
        var newSaveList = [];
        newList.forEach((s) =>{
           newSaveList.push(validateTitle(standardList, s));           
        });
        return newSaveList;
    })
    .then((saveList) =>{
       var promiseArray = [];
        saveList.forEach((s) =>{
            var type = s.reportType;             
            delete s.reportType;                        
            promiseArray.push(factory.saveStandard(account._id, account.users[0].user,type, s, "Global"));                        
        });
        return Promise.all(promiseArray)
            .then((responses) => {
                var results = [];
                responses.forEach((r, index) =>{                    
                    results.push(r.reportType + " : " +  r.data.Title );
                })
                return results = {
                    "account" : account._id,
                    "data" : results
                };
            });                          
    });
    
}

function validateTitle(sList, standard){    
    var updated = sList.some((s) =>{        
        if(s.data.Title === standard.Title && s.reportType === standard.reportType){
            standard.Title =  standard.Title + " [NEW]";
            return true;
        }
    });
    
    if(updated){
       return validateTitle(sList, standard);
    }else{
        return standard;
    }
}

function getNewStandardList(){
    var gaitNormalize1 = {
    "reportType": "Gait",
    "Title": "Test",
    "Gender": "Male",
    "Ethnicity": "White",
    "Age": "25",
    "Weight": "105",
    "Height": "10",
    "StrideLength": 10,
    "StrideLengthSD": 10,
    "StrideWidth": 10,
    "StrideWidthSD": 10,
    "StepLengthLeft": 10,
    "StepLengthLeftSD": 10,
    "StepLengthRight": 10,
    "StepLengthRightSD": 10,
    "ToeInOutLeft": 10,
    "ToeInOutLeftSD": 10,
    "ToeInOutRight": 10,
    "ToeInOutRightSD": 10,
    "VelocityAvg": 10,
    "VelocityAvgStride": 20,
    "CycleTime": 30,
    "Cadence": 40,
    "StepTimeLeft": 20,
    "StepTimeRight": 20,
    "StepTimePercentageLeft": 20,
    "StepTimePercentageRight": 20,
    "SwingPhaseAvg": 10,
    "SwingPhaseAvgPercentage": 10,
    "SwingPhaseLeft": 101,
    "SwingPhaseLeftPercentage": 10,
    "SwingPhaseRight": 10,
    "SwingPhaseRightPercentage": 1,
    "StancePhaseAvg": 20,
    "StancePhaseAvgPercentage": 1,
    "StancePhaseLeft": 1,
    "StancePhaseLeftPercentage": 10,
    "StancePhaseRight": 10,
    "StancePhaseRightPercentage": 1,
    "DoubleSupportAvg": 20,
    "DoubleSupportAvgPercentage": 20,
    "SingleSupportTimeLeft": 20,
    "SingleSupportPercentageLeft": 20,
    "SingleSupportTimeRight": 20,
    "SingleSupportPercentageRight": 20,
    "MeanCOPToAPAxis": null,
    "MeanCOPToMLAxis": null,
    "SDFromCOPToMeanCOP": null,
    "SDCOPToAPAxis": null,
    "SDCOPToMLAxis": null,
    "AvgVelocity": null,
    "AnteriorPosteriorVariation": null,
    "MedialLateralVariation": null,
    "Area": null,
    "AvgLeft": null,
    "AvgLeftFore": null,
    "AvgLeftBack": null,
    "AvgRight": null,
    "AvgRightFore": null,
    "AvgRightBack": null
    }   

    var balanceNormalize1 = {
    "reportType": "Balance",
    "Title": "Test-Balance",
    "Gender": "Male",
    "Ethnicity": "White",
    "Age": "25",
    "Weight": "105",
    "Height": "10",
    "StrideLength": 10,
    "StrideLengthSD": 10,
    "StrideWidth": 10,
    "StrideWidthSD": 10,
    "StepLengthLeft": 10,
    "StepLengthLeftSD": 10,
    "StepLengthRight": 10,
    "StepLengthRightSD": 10,
    "ToeInOutLeft": 10,
    "ToeInOutLeftSD": 10,
    "ToeInOutRight": 10,
    "ToeInOutRightSD": 10,
    "VelocityAvg": 10,
    "VelocityAvgStride": 20,
    "CycleTime": 30,
    "Cadence": 40,
    "StepTimeLeft": 20,
    "StepTimeRight": 20,
    "StepTimePercentageLeft": 20,
    "StepTimePercentageRight": 20,
    "SwingPhaseAvg": 10,
    "SwingPhaseAvgPercentage": 10,
    "SwingPhaseLeft": 101,
    "SwingPhaseLeftPercentage": 10,
    "SwingPhaseRight": 10,
    "SwingPhaseRightPercentage": 1,
    "StancePhaseAvg": 20,
    "StancePhaseAvgPercentage": 1,
    "StancePhaseLeft": 1,
    "StancePhaseLeftPercentage": 10,
    "StancePhaseRight": 10,
    "StancePhaseRightPercentage": 1,
    "DoubleSupportAvg": 20,
    "DoubleSupportAvgPercentage": 20,
    "SingleSupportTimeLeft": 20,
    "SingleSupportPercentageLeft": 20,
    "SingleSupportTimeRight": 20,
    "SingleSupportPercentageRight": 20,
    "MeanCOPToAPAxis": null,
    "MeanCOPToMLAxis": null,
    "SDFromCOPToMeanCOP": null,
    "SDCOPToAPAxis": null,
    "SDCOPToMLAxis": null,
    "AvgVelocity": null,
    "AnteriorPosteriorVariation": null,
    "MedialLateralVariation": null,
    "Area": null,
    "AvgLeft": null,
    "AvgLeftFore": null,
    "AvgLeftBack": null,
    "AvgRight": null,
    "AvgRightFore": null,
    "AvgRightBack": null
    }   

    var normalize = [];
    normalize.push(gaitNormalize1);
    normalize.push(balanceNormalize1);
    return normalize;    
}