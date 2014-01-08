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

var pieChartOptionsTemplate = {
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

// TODO onload
window.onload = function() {

    selectionCriteria.addCriteria("studySite", "Mt. Zion");
    selectionCriteria.addCriteria("biopsySite", "Bone");

    selectionCriteria.clearCriteria();

    var selectedIds = cohort.selectIds(selectionCriteria.getCriteria());

    var studySiteData = cohort.getPatientCounts(selectedIds, 'studySite');
    var biopsySiteData = cohort.getPatientCounts(selectedIds, 'biopsySite');

    var studySiteChartOptions = pieChartOptionsTemplate;
    var biopsySiteChartOptions = pieChartOptionsTemplate;

    setupChartOptions("chart01", studySiteData, "Number of Samples by Study Site", studySiteChartOptions);
    studySiteChart = new Highcharts.Chart(studySiteChartOptions);

    setupChartOptions("chart02", biopsySiteData, "Number of Samples by Biopsy Site", biopsySiteChartOptions);
    biopsySiteChart = new Highcharts.Chart(biopsySiteChartOptions);

    updateChartCrumbs(selectionCriteria);
};
