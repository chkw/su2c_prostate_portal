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

// for (var i in ids) {
// var id = ids[i];
// console.log(i + ": " + id);
// var p = cohort.getPatient(id);
// if (p) {
// console.log("study: " + p.getStudySite());
// console.log("biopsy: " + p.getBiopsySite());
// }
// }

Highcharts.setOptions({
    chart : {
        backgroundColor : {
            linearGradient : [0, 0, 500, 500],
            stops : [[0, 'rgb(255, 255, 255)'], [1, 'rgb(240, 240, 255)']]
        },
        borderWidth : 2,
        plotBackgroundColor : 'rgba(255, 255, 255, .9)',
        plotShadow : true,
        plotBorderWidth : 1
    }
});

var chart1Options = {
    chart : {

    },

    xAxis : {
        type : 'datetime'
    },

    series : [{
        data : [29.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4],
        pointStart : Date.UTC(2010, 0, 1),
        pointInterval : 3600 * 1000 // one hour
    }]
};

var chart2Options = {
    chart : {
        type : 'column'
    },

    xAxis : {
        type : 'datetime'
    },

    series : [{
        data : [29.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4],
        pointStart : Date.UTC(2010, 0, 1),
        pointInterval : 3600 * 1000 // one hour
    }]
};

function addHighChart(elementId, chartOptions) {
    $(function() {
        $("#" + elementId).empty();
        $("#" + elementId).highcharts(chartOptions);
    });
}

addHighChart("chart01", chart1Options);
addHighChart("chart02", chart2Options);

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