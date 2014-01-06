/**
 * chrisw@soe.ucsc.edu
 * December 19, 2013
 * Draw pie charts using highcharts (http://www.highcharts.com/).
 */

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

selectedIds = cohort.getAllPatientIds();

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

var chartOptions = {
    renderTo : null,
    plotBackgroundColor : null,
    plotBorderWidth : null,
    plotShadow : false
};

var plotOptions = {
    pie : {
        allowPointSelect : true,
        cursor : 'pointer',
        dataLabels : {
            enabled : true,
            color : 'black',
            connectorColor : 'gray',
            format : '<b>{point.name}</b>: {point.y}'
        },
        point : {
            events : {
                click : function() {
                    console.log('clicked the slice for: ' + this.name);
                }
            }
        }
    }
};

var tooltipOptions = {
    pointFormat : '{point.y} samples is <b>{point.percentage:.1f} %</b>'
};

var studySiteChartOptions = {
    chart : chartOptions,
    title : {
        text : 'Number of Samples by Study Site'
    },
    tooltip : tooltipOptions,
    plotOptions : plotOptions,
    series : [{
        type : 'pie',
        name : 'number of samples',
        data : studySiteData,
        showInLegend : true
    }]
};

var biopsySiteChartOptions = {
    chart : chartOptions,
    title : {
        text : 'Number of Samples by Biopsy Site'
    },
    tooltip : tooltipOptions,
    plotOptions : plotOptions,
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
