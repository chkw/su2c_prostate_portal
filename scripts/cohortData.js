var dataUrl = 'data/cohort.json';

var xmlHttp = null;
xmlHttp = new XMLHttpRequest();
xmlHttp.open("GET", dataUrl, false);
xmlHttp.send(null);
var data = xmlHttp.responseText;

var cohort = new cohortData(data);

var ids = cohort.getAllPatientIds();

var selectedIds = cohort.selectPatients(ids, 'studySite', 'Mt. Zion');
ids = selectedIds;
selectedIds = cohort.selectPatients(ids, 'biopsySite', 'Bone');
console.log(JSON.stringify(selectedIds));

var studySiteData = cohort.getPatientCounts(selectedIds, 'studySite');
var biopsySiteData = cohort.getPatientCounts(selectedIds, 'biopsySite');

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

var studySiteChartOptions = {
    chart : {
        renderTo : null,
        plotBackgroundColor : null,
        plotBorderWidth : null,
        plotShadow : false
    },
    title : {
        text : 'Number of Samples by Study Site'
    },
    tooltip : {
        pointFormat : '{series.name}: <b>{point.y}</b>'
    },
    plotOptions : {
        pie : {
            allowPointSelect : true,
            cursor : 'pointer',
            dataLabels : {
                enabled : true,
                color : '#000000',
                connectorColor : '#000000',
                format : '<b>{point.name}</b>: {point.y}'
            }
        }
    },
    series : [{
        type : 'pie',
        name : 'number of samples',
        data : studySiteData,
        showInLegend : true
    }]
};

var biopsySiteChartOptions = {
    chart : {
        renderTo : null,
        plotBackgroundColor : null,
        plotBorderWidth : null,
        plotShadow : false
    },
    title : {
        text : 'Number of Samples by Biopsy Site'
    },
    tooltip : {
        pointFormat : '{series.name}: <b>{point.y}</b>'
    },
    plotOptions : {
        pie : {
            allowPointSelect : true,
            cursor : 'pointer',
            dataLabels : {
                enabled : true,
                color : '#000000',
                connectorColor : '#000000',
                format : '<b>{point.name}</b>: {point.y}'
            }
        }
    },
    series : [{
        type : 'pie',
        name : 'number of samples',
        data : biopsySiteData,
        showInLegend : true
    }]
};

function addHighChart(elementId, chartOptions) {
    $(function() {
        $("#" + elementId).empty();
        $("#" + elementId).highcharts(chartOptions);
    });
}

addHighChart("chart01", studySiteChartOptions);
addHighChart("chart02", biopsySiteChartOptions);

// TODO objects below

/**
 * Data about a single patient.
 * @param {Object} data
 */
function patientData(data) {
    this.data = data;

    /**
     * Get the study site.
     */
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

    /**
     * Get the biopsy site.
     */
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

    // parse the cohort data
    this.cohort = JSON && JSON.parse(cohortJson) || $.parseJSON(cohortJson);

    /**
     * Get series data for pie chart from category counts.
     */
    countsToPieData = function(counts) {
        var data = new Array();
        for (var type in counts) {
            var typeData = new Object();
            data.push(typeData);
            typeData["name"] = type;
            typeData["y"] = counts[type];
        }
        return data;
    };

    /**
     * Get the counts for the specified patient IDs and feature. feature is one of ['studySite', 'biopsySite'].
     */
    this.getPatientCounts = function(ids, feature) {
        var counts = new Object();
        for (var i in ids) {
            var id = ids[i];
            var val = '__NOT_SET__';
            if (feature == 'studySite') {
                val = this.getPatient(id).getStudySite();
            } else if (feature == 'biopsySite') {
                val = this.getPatient(id).getBiopsySite();
            }
            if ((val != '__NOT_SET__') && !( val in counts)) {
                counts[val] = 0;
            }
            counts[val]++;
        }
        var data = countsToPieData(counts);
        return data;
    };

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
     * From the specified ID list, select only the patients by the specified parameters.  selectBy is one of ['studySite', 'biopsySite'].
     */
    this.selectPatients = function(startingIds, selectBy, selectVal) {
        var keptIds = new Array();
        for (var i in startingIds) {
            var id = startingIds[i];
            var patientVal = '__NOT_SET__';
            if (selectBy == 'studySite') {
                patientVal = this.getPatient(id).getStudySite();
            } else if (selectBy == 'biopsySite') {
                patientVal = this.getPatient(id).getBiopsySite();
            }
            if ((patientVal != '__NOT_SET__') && (patientVal == selectVal)) {
                keptIds.push(id);
            }
        }
        return keptIds;
    };

    /**
     * Get array of all patient IDs.
     */
    this.getAllPatientIds = function() {
        var ids = new Array();
        for (var id in this.cohort) {
            ids.push(id);
        }
        return ids;
    };
}