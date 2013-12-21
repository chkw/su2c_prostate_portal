var dataUrl = 'data/cohort.json';

var xmlHttp = null;
xmlHttp = new XMLHttpRequest();
xmlHttp.open("GET", dataUrl, false);
xmlHttp.send(null);
var data = xmlHttp.responseText;

var cohort = new cohortData(data);

var patient = cohort.getPatient("DTB-046");
console.log(patient);

var ids = cohort.getPatientIds();

for (var i in ids) {
    var id = ids[i];
    console.log(i + ": " + id);
    var p = cohort.getPatient(id);
    if (p) {
        console.log("study: " + p.getStudySite());
        console.log("biopsy: " + p.getBiopsySite());
    }
}

var chartOptions = {
    chart : {
        type : 'bar'
    },
    title : {
        text : 'Fruit Consumption'
    },
    xAxis : {
        categories : ['Apples', 'Bananas', 'Oranges']
    },
    yAxis : {
        title : {
            text : 'Fruit eaten'
        }
    },
    series : [{
        name : 'Jane',
        data : [1, 0, 40]
    }, {
        name : 'John',
        data : [5, 7, 3]
    }]
};

function addHighChart(elementId, chartOptions) {
    $(function() {
        $("#" + elementId).empty();
        $("#" + elementId).highcharts(chartOptions);
    });
}

addHighChart("chart", chartOptions);

// TODO objects below

/**
 * Data about a single patient.
 * @param {Object} data
 */
function patientData(data) {
    this.data = data;

    this.getStudySite = function() {
        if (this.data == null) {
            return null;
        } else if (this.data["attributes"] == null) {
            return null;
        } else if (this.data["attributes"]["Demographics"] == null) {
            return null;
        } else {
            var val = this.data["attributes"]["Demographics"]["Study Site"];
            return val;
        }
    };

    this.getBiopsySite = function() {
        if (this.data == null) {
            return null;
        } else if (this.data["attributes"] == null) {
            return null;
        } else if (this.data["attributes"]["SU2C Biopsy V2"] == null) {
            return null;
        } else {
            var val = this.data["attributes"]["SU2C Biopsy V2"]["Site"];
            return val;
        }
    };
}

/**
 * A group of patient data.
 * @param {Object} cohortJson
 */
function cohortData(cohortJson) {

    this.cohort = JSON && JSON.parse(cohortJson) || $.parseJSON(cohortJson);

    /**
     *Get the patientData.
     */
    this.getPatient = function(patientId) {
        if ( patientId in this.cohort) {
            return new patientData(this.cohort[patientId]);
        } else {
            return null;
        }
    };

    /**
     * Get array of patient IDs.
     */
    this.getPatientIds = function() {
        var ids = new Array();
        for (var id in this.cohort) {
            ids.push(id);
        }
        return ids;
    };
}