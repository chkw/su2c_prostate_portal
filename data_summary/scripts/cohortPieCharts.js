/**
 * chrisw@soe.ucsc.edu
 * December 19, 2013
 * Draw pie charts using highcharts (http://www.highcharts.com/).
 */

// on https://su2c-dev.ucsc.edu/
//var dataUrl = ""/api/medbook/book/assetsBook/wiki/overview%20reports/cohort.json"";
var dataUrl = "data_summary/data/cohort_20140121.json";
var datatypeUrl = "data_summary/data/WCDT_datatypes.tab";

var debug = false;

/**
 * Log message to console.
 */
function logConsole(message) {
    if (debug) {
        console.log(message);
    }
}

/*
 * Synchronous GET
 */
function getResponse(url) {
    var xhr = null;
    xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.onload = function() {
        var status = xhr.status;
        if (status != 200) {
            logConsole("xhr error: " + status);
        }
    };
    xhr.send(null);
    var response = xhr.responseText;

    return response;
}

/**
 * get the JSON data to create a cohortData object.
 */
function setCohortData(url) {
    var response = getResponse(url);

    var parsedResponse = JSON && JSON.parse(response) || $.parseJSON(response);

    // value of contents is a stringified JSON
    var contents = JSON && JSON.parse(parsedResponse["contents"]) || $.parseJSON(parsedResponse["contents"]);

    logConsole(JSON.stringify(contents, null, '\t'));

    var cohort = new cohortData(contents);

    return cohort;
}

Highcharts.setOptions({
    chart : {
        // backgroundColor : {
        // linearGradient : [0, 0, 500, 500],
        // stops : [[0, 'rgb(255, 255, 255)'], [1, 'rgb(240, 240, 255)']]
        // },
        borderWidth : 2,
        // plotBackgroundColor : 'rgba(255, 255, 255, .9)',
        // plotShadow : true,
        // plotBorderWidth : 1
        events : {

            // use renderer to draw some element to act as a button to promote a chart to the top.
            // http://api.highcharts.com/highcharts#Renderer
            // https://stackoverflow.com/questions/11214481/how-can-i-add-element-with-attributes-to-svg-using-jquery
            load : function() {
                this.renderer.text("move to top", 3, 11).attr({
                    "cursor" : "pointer"
                }).on("click", function() {
                    var chartDivElement = this.parentNode.parentNode.parentNode;
                    moveChartUp(chartDivElement);
                }).add();
            }
        }
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
            distance : 5,
            // format : '<b>{point.name}</b>: {point.y}',
            format : '{point.y}'
        },
        point : {
            events : {
                // click pie slice to add sample selection criteria & redraw charts
                click : function() {
                    var feature = this.series.name;
                    var value = this.name;
                    selectionCriteria.addCriteria(feature, value);
                    redrawCharts();
                }
            }
        }
    }
};

var tooltipOptions = {
    pointFormat : '{point.y} samples is <b>{point.percentage:.1f} %</b>'
};

var legendOptions = {
    "enabled" : true,
    "floating" : false,
    "itemWidth" : null,
    "layout" : "horizontal",
    "align" : "center"
};

var pieChartOptionsTemplate = {
    chart : chartOptions,
    legend : legendOptions,
    title : {
        text : ''
    },
    credits : {
        enabled : false
    },
    tooltip : tooltipOptions,
    plotOptions : plotOptions,
    series : [{
        type : 'pie',
        name : null,
        data : null,
        showInLegend : true
    }],
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

/**
 * Create a button element to remove a filter from selectionCriteria.
 */
function createCrumbButton(feature, value) {
    var innerHtml = feature + "<br>" + value;
    var buttonElement = $("<button class='crumbButton'>" + innerHtml + "</button>").hover(function() {
        this.innerHTML = "<s>" + innerHtml + "</s>";
    }, function() {
        this.innerHTML = innerHtml;
    }).click(function() {
        selectionCriteria.removeCriteria(feature, value);
        redrawCharts();
    });
    return buttonElement;
}

/**
 * Update the chart crumbs.
 */
function updateChartCrumbs(selectionCriteria) {
    var id = "chartCrumbs";
    var e = document.getElementById(id);
    e.innerHTML = "applied filters: ";
    var criteria = selectionCriteria.getCriteria();
    for (var i in criteria) {
        var feature = criteria[i]["feature"];
        var value = criteria[i]["value"];
        createCrumbButton(feature, value).appendTo(e);
    }
}

/**
 * Assumes the parents are divs.
 */
function swapContainingDivs(nodeA, nodeB) {
    var parentA = nodeA.parentNode;
    var parentB = nodeB.parentNode;
    $("#" + nodeA.id).appendTo(parentB);
    $("#" + nodeB.id).appendTo(parentA);
}

/**
 * Move a chart to the top.  Assumes the chart is in a container div.
 */
function moveChartUp(promotedChartDiv) {
    var nodeList = document.getElementsByClassName("pieChart");
    var bubble = null;
    for (var i = nodeList.length - 1; i >= 0; --i) {
        var node = nodeList[i];
        if (node.parentNode.id == promotedChartDiv.parentNode.id) {
            bubble = node;
            continue;
        }
        if (bubble != null) {
            swapContainingDivs(bubble, node);
        }
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

/**
 * Set the new chart data and redraw.
 */
function redrawNewData(chart, data) {
    setNewChartData(chart, data);
    chart.redraw();
}

/**
 * Redraw pie charts using the current selectionCriteria object.
 */
function redrawCharts() {
    var selectedIds = cohort.selectIds(selectionCriteria.getCriteria());

    redrawNewData(studySiteChart, cohort.getPatientCounts(selectedIds, 'studysite'));
    redrawNewData(biopsySiteChart, cohort.getPatientCounts(selectedIds, 'biopsysite'));
    redrawNewData(subsequentDrugsChart, cohort.getPatientCounts(selectedIds, 'subsequentdrugs'));
    redrawNewData(treatmentDetailsChart, cohort.getPatientCounts(selectedIds, 'treatmentdetails'));
    redrawNewData(ctcChart, cohort.getPatientCounts(selectedIds, 'ctc'));
    redrawNewData(acghChart, cohort.getPatientCounts(selectedIds, 'acgh'));
    redrawNewData(rnaseqChart, cohort.getPatientCounts(selectedIds, 'rnaseq'));
    redrawNewData(fishChart, cohort.getPatientCounts(selectedIds, 'fish'));

    updateChartCrumbs(selectionCriteria);
}

/**
 * Create a pie chart with the specified parameters.
 */
function initializeChart(containingDivId, title, dataFeature, selectedIds) {
    var data = cohort.getPatientCounts(selectedIds, dataFeature);
    var chartOptions = pieChartOptionsTemplate;

    setupChartOptions(containingDivId, dataFeature, data, title, chartOptions);
    return new Highcharts.Chart(chartOptions);
}

/**
 * initial drawing of charts
 */
function initializeCharts() {
    var selectedIds = cohort.selectIds(selectionCriteria.getCriteria());

    studySiteChart = initializeChart("chart1", "Number of Samples by Study Site", 'studySite', selectedIds);
    biopsySiteChart = initializeChart("chart2", "Number of Samples by Biopsy Site", 'biopsySite', selectedIds);
    subsequentDrugsChart = initializeChart("chart3", "Number of Samples by On-Study Drugs", 'subsequentDrugs', selectedIds);

    treatmentDetailsChart = initializeChart("chart4", "Number of Samples by Treatment Details", 'treatmentDetails', selectedIds);
    ctcChart = initializeChart("chart5", "Number of Samples by CTC Data", 'ctc', selectedIds);
    acghChart = initializeChart("chart6", "Number of Samples by aCGH Data", 'acgh', selectedIds);

    rnaseqChart = initializeChart("chart7", "Number of Samples by RNAseq Data", 'rnaseq', selectedIds);
    fishChart = initializeChart("chart8", "Number of Samples by FISH Data", 'fish', selectedIds);

    updateChartCrumbs(selectionCriteria);
}

var studySiteChart = null;
var biopsySiteChart = null;
var subsequentDrugsChart = null;
var treatmentDetailsChart = null;
var ctcChart = null;
var acghChart = null;
var rnaseqChart = null;
var fishChart = null;

var selectionCriteria = new selectionCriteria();
var cohort = null;

// TODO onload
window.onload = function() {

    // selectionCriteria.addCriteria("studySite", "Mt. Zion");
    // selectionCriteria.addCriteria("biopsySite", "Bone");

    // selectionCriteria.clearCriteria();

    cohort = setCohortData(dataUrl);

    initializeCharts();
};
