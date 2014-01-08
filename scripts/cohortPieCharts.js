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
                    var feature = this.series.name;
                    var value = this.name;
                    console.log("clicked: " + feature + ' = ' + value);
                }
            }
        }
    }
};

var tooltipOptions = {
    pointFormat : '{point.y} samples is <b>{point.percentage:.1f} %</b>'
};

var pieChartOptionsTemplate = {
    chart : chartOptions,
    title : {
        text : ''
    },
    tooltip : tooltipOptions,
    plotOptions : plotOptions,
    series : [{
        type : 'pie',
        name : null,
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
 * @param {Object} seriesName
 * @param {Object} seriesData
 * @param {Object} chart
 */
function setChartSeries(seriesName, seriesData, chartOptions) {
    chartOptions["series"][0]["name"] = seriesName;
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
 * @param {Object} seriesName
 * @param {Object} seriesData
 * @param {Object} title
 * @param {Object} chartOptions
 */
function setupChartOptions(renderTo, seriesName, seriesData, title, chartOptions) {
    setChartRenderTo(renderTo, chartOptions);
    setChartSeries(seriesName, seriesData, chartOptions);
    setChartTitle(title, chartOptions);
    return chartOptions;
}

var studySiteChart = null;
var biopsySiteChart = null;
var selectionCriteria = new selectionCriteria();
var cohort = setCohortData(dataUrl);

function createCrumbButton(feature, value) {
    var buttonElement = $("<button class='crumbButton'>" + feature + "<br>" + value + "</button>").hover(function() {
        console.log('hover in');
    }, function() {
        console.log('hover out');
    }).click(function() {
        console.log("click!");
        selectionCriteria.clearCriteria();
        redrawCharts();
    });
    return buttonElement;
}

function updateChartCrumbs(selectionCriteria) {
    var id = "chartCrumbs";
    var e = document.getElementById(id);
    e.innerHTML = "crumbs go here";
    var criteria = selectionCriteria.getCriteria();
    for (var i in criteria) {
        var feature = criteria[i]["feature"];
        var value = criteria[i]["value"];
        createCrumbButton(feature, value).appendTo(e);
    }
}

/**
 * Set new series data directly on the chart instead of via chartOptions.
 * @param {Object} chartObject
 * @param {Object} chartData
 */
function setNewChartData(chartObject, chartData) {
    chartObject.series[0].data.length = 0;
    chartObject.series[0].setData(chartData);
}

function redrawCharts() {
    console.log("redrawCharts()");

    var selectedIds = cohort.selectIds(selectionCriteria.getCriteria());

    var data = cohort.getPatientCounts(selectedIds, 'studySite');
    setNewChartData(studySiteChart, data);

    data = cohort.getPatientCounts(selectedIds, 'biopsySite');
    setNewChartData(biopsySiteChart, data);

    studySiteChart.redraw();
    biopsySiteChart.redraw();

    updateChartCrumbs(selectionCriteria);
}

function initializeCharts() {
    var selectedIds = cohort.selectIds(selectionCriteria.getCriteria());

    var studySiteData = cohort.getPatientCounts(selectedIds, 'studySite');
    var biopsySiteData = cohort.getPatientCounts(selectedIds, 'biopsySite');

    var studySiteChartOptions = pieChartOptionsTemplate;
    var biopsySiteChartOptions = pieChartOptionsTemplate;

    setupChartOptions("chart01", "studySite", studySiteData, "Number of Samples by Study Site", studySiteChartOptions);
    studySiteChart = new Highcharts.Chart(studySiteChartOptions);

    setupChartOptions("chart02", "biopsySite", biopsySiteData, "Number of Samples by Biopsy Site", biopsySiteChartOptions);
    biopsySiteChart = new Highcharts.Chart(biopsySiteChartOptions);

    updateChartCrumbs(selectionCriteria);
}

// TODO onload
window.onload = function() {

    selectionCriteria.addCriteria("studySite", "Mt. Zion");
    selectionCriteria.addCriteria("biopsySite", "Bone");

    // selectionCriteria.clearCriteria();

    initializeCharts();
};
