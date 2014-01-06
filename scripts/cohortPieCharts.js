/**
 * chrisw@soe.ucsc.edu
 * December 19, 2013
 * Draw pie charts using highcharts (http://www.highcharts.com/).
 */

var dataUrl = 'data/cohort.json';

/**
 * get the JSON data to create a cohortData object.
 */
function setCohortData(url) {
    var xmlHttp = null;
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", dataUrl, false);
    xmlHttp.send(null);
    var data = xmlHttp.responseText;

    var cohort = new cohortData(data);

    return cohort;
}

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

var chartOptionsTemplate = {
    chart : chartOptions,
    title : {
        text : ''
    },
    tooltip : tooltipOptions,
    plotOptions : plotOptions,
    series : [{
        type : 'pie',
        name : 'number of samples',
        data : null,
        showInLegend : true
    }]
};

/**
 * Set the renderTo attribute of the chart.
 * @param {Object} elementId
 * @param {Object} chartOptions
 */
function setChartRenderTo(elementId, chartOptions) {
    chartOptions["chart"]["renderTo"] = elementId;
}

/**
 * Set the chart series.
 * @param {Object} seriesData
 * @param {Object} chart
 */
function setChartSeries(seriesData, chartOptions) {
    chartOptions["series"][0]["data"] = seriesData;
}

/**
 * Set the chart title.
 * @param {Object} title
 * @param {Object} chartOptions
 */
function setChartTitle(title, chartOptions) {
    chartOptions["title"]["text"] = title;
}

/**
 * Setup chartOptions... returns the chartOptions.
 * @param {Object} renderTo
 * @param {Object} seriesData
 * @param {Object} title
 * @param {Object} chartOptions
 */
function setupChartOptions(renderTo, seriesData, title, chartOptions) {
    setChartRenderTo(renderTo, chartOptions);
    setChartSeries(seriesData, chartOptions);
    setChartTitle(title, chartOptions);
    return chartOptions;
}

window.onload = function() {
    var cohort = setCohortData(dataUrl);

    var ids = cohort.getAllPatientIds();

    var selectedIds = cohort.selectPatients(ids, 'studySite', 'Mt. Zion');
    ids = selectedIds;
    selectedIds = cohort.selectPatients(ids, 'biopsySite', 'Bone');
    console.log(JSON.stringify(selectedIds));

    selectedIds = cohort.getAllPatientIds();

    var studySiteData = cohort.getPatientCounts(selectedIds, 'studySite');
    var biopsySiteData = cohort.getPatientCounts(selectedIds, 'biopsySite');

    var studySiteChartOptions = chartOptionsTemplate;
    var biopsySiteChartOptions = chartOptionsTemplate;

    setupChartOptions("chart01", studySiteData, "Number of Samples by Study Site", studySiteChartOptions);
    var chart1 = new Highcharts.Chart(studySiteChartOptions);

    setupChartOptions("chart02", biopsySiteData, "Number of Samples by Biopsy Site", biopsySiteChartOptions);
    var chart2 = new Highcharts.Chart(biopsySiteChartOptions);
};
