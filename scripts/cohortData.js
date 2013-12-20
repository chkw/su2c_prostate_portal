var dataUrl = 'data/cohort.json';

var xmlHttp = null;
xmlHttp = new XMLHttpRequest();
xmlHttp.open("GET", dataUrl, false);
xmlHttp.send(null);
var data = xmlHttp.responseText;

var cohort = new cohortData();
cohort.readJson(data);

function cohortData() {

    this.cohort = null;

    this.getPatientData = function(patientId){
        var patientData = null;
        if (patientId in this.cohort){
            return this.cohort[patientId];
        } else {
            return null;
        }
    };

    this.readJson = function(cohortJson) {
        this.cohort = JSON && JSON.parse(cohortJson) || $.parseJSON(cohortJson);
    };
}