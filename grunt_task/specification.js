/**
 * Created by Nitheen on 3/28/2015.
 */
var specificationService = require("../specification/specification-service");            

module.exports = function(grunt) {

    grunt.registerMultiTask('specificationList', function() {
        var done = this.async();        
        var task = grunt.config('specificationList').task;            
        var accountId = task.accountId;
        sService = new specificationService(accountId);
        var goalPromise =  getPromiseList(accountId, sService, getTreatmentGoalList());
        var planPromise =  getPromiseList(accountId, sService, getTreatmentPlanList());
        var promiseArray = goalPromise.concat(planPromise);
        Promise.all(promiseArray)
            .then(results =>{
               console.log(JSON.stringify(results));
                grunt.log.ok(results.length + " Records added or updated");                
                done();                  
            })                            
            .catch(function(error){
                grunt.log.error(error);                
                done();    
            });
    });
};

function getPromiseList(accountId, sService, list){

    var promiseArray = [];

    list.forEach(item =>{
        promiseArray.push(addToService(accountId, sService, item));
    })

    return promiseArray;      
}

function addToService(accountId, sService, item){
    
    return sService.getId(item.code, item.type, item.key)
    .then(id => {
        return sService.update(id, item.short, item.long, item.type)
        .then(result =>{
            return  + item.code + ":Modified";;
        });
    }, error =>{
        if(error.code === 510){
            return sService.add(accountId, item)
            .then(id =>{
                return  item.code + ":Added";
            });
        }
        return  item.code + ":Failed";
    })
}

function getTreatmentGoalList(){
    var goalList = [
        {
            short: "Relieve pain and stiffness",
            long: "-",
            type : "General",
            key: "TreatmentGoal",
            code: 100
        },
        {
            short: "Prevent or reduce deformity",
            long: "-",
            type : "General",
            key: "TreatmentGoal",
            code: 101
        },
        {
            short: "Maintain or improve muscle length and flexibility",
            long: "-",
            type : "General",
            key: "TreatmentGoal",
            code: 102
        },
        {
            short: "Maintain and improve muscle power and endurance",
            long: "-",
            type : "General",
            key: "TreatmentGoal",
            code: 103
        },
        {
            short: "Regain pre-bleed status",
            long: "-",
            type : "General",
            key: "TreatmentGoal",
            code: 104
        },
        {
            short: "Maximize functional capacity",
            long: "-",
            type : "General",
            key: "TreatmentGoal",
            code: 105
        },
        {
            short: "Maintain or increase exercise tolerance",
            long: "-",
            type : "General",
            key: "TreatmentGoal",
            code: 107
        }                                            
    ]
    return goalList;
}

function getTreatmentPlanList(){
    var planList = [
        {
            short: "Joint mobilisation (gentle gliding) techniques",
            long: "-",
            type : "General",
            key: "TreatmentPlan",
            code: 100
        },
        {
            short: "Joint manipulation",
            long: "-",
            type : "General",
            key: "TreatmentPlan",
            code: 101
        },
        {
            short: "Physiotherapy Instrument Mobilisation (PIM)",
            long: "-",
            type : "General",
            key: "TreatmentPlan",
            code: 102
        },
        {
            short: "Minimal Energy Techniques (METs)",
            long: "-",
            type : "General",
            key: "TreatmentPlan",
            code: 103
        },
        {
            short: "Massage and soft tissue techniques",
            long: "-",
            type : "General",
            key: "TreatmentPlan",
            code: 104
        },
        {
            short: "Taping",
            long: "-",
            type : "General",
            key: "TreatmentPlan",
            code: 105
        },
        {
            short: "Acupuncture and Dry Needling",
            long: "-",
            type : "General",
            key: "TreatmentPlan",
            code: 106
        },
        {
            short: "Early Injury Treatment",
            long: "-",
            type : "General",
            key: "TreatmentPlan",
            code: 107
        },
        {
            short: "Sub-Acute Soft Tissue Injury Treatment",
            long: "-",
            type : "General",
            key: "TreatmentPlan",
            code: 108
        },
        {
            short: "Gait Analysi",
            long: "-",
            type : "General",
            key: "TreatmentPlan",
            code: 109
        },
        {
            short: "Biomechanical Analysis",
            long: "-",
            type : "General",
            key: "TreatmentPlan",
            code: 110            
        },
        {
            short: "Proprioception & Balance Exercises",
            long: "-",
            type : "General",
            key: "TreatmentPlan",
            code: 111
        },
        {
            short: "Ultrasound Physiotherapy",
            long: "-",
            type : "General",
            key: "TreatmentPlan",
            code: 112
        },
        {
            short: "Soft Tissue Massage",
            long: "-",
            type : "General",
            key: "TreatmentPlan",
            code: 113
        },
        {
            short: "Brace or Support",
            long: "-",
            type : "General",
            key: "TreatmentPlan",
            code: 114
        },
        {
            short: "Electrotherapy & Local Modalities",
            long: "-",
            type : "General",
            key: "TreatmentPlan",
            code: 115
        },
        {
            short: "Prehabilitation",
            long: "-",
            type : "General",
            key: "TreatmentPlan",
            code: 116
        },
        {
            short: "Strength Exercises",
            long: "-",
            type : "General",
            key: "TreatmentPlan",
            code: 117
        },
        {
            short: "Stretching Exercises",
            long: "-",
            type : "General",
            key: "TreatmentPlan",
            code: 118
        },
        {
            short: "Posture Correction",
            long: "-",
            type : "General",
            key: "TreatmentPlan",
            code: 119
        },
        {
            short: "Supportive Taping & Strapping",
            long: "-",
            type : "General",
            key: "TreatmentPlan",
            code: 120
        },
        {
            short: "TENS Machine",
            long: "-",
            type : "General",
            key: "TreatmentPlan",
            code: 121
        }
    ]
    return planList;
}