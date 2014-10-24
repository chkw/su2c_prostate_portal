/**
 * cohortPieCharts_2.js
 * chrisw@soe.ucsc.edu
 * October 2014
 * Draw pie charts using highcharts (http://www.highcharts.com/).
 *
 * This version will get the pie slice counts from OD_eventData objects.
 *
 * * requirements:
 * 1) HighCharts (3.0.9)
 * 2) static.js
 * 3) OD_eventData.js
 * 4) jquery-csv
 **/

var dataUrl = "data_summary/data/cohort2_20140922.json";
var datatypeUrl = "data_summary/data/WCDT_datatypes_20140922.tab";

/**
 * get the JSON data to create a cohortData object.
 */
function setCohortData(url) {
    var response = getResponse(url);

    var parsedResponse = parseJson(response);
    var contents = parseJson(parsedResponse["contents"]);

    var cohort = new cohortData(contents);

    var ids = cohort.getAllPatientIds();
    var datatypeData = getDatatypeData(datatypeUrl);
    for (var i in ids) {
        var id = ids[i];
        if ( id in datatypeData) {
            var patient = cohort.getPatient(id);
            patient["data"]["datatypes"] = datatypeData[id]["datatypes"];
        }
    }

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
            // connectorColor : 'gray',
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

    // recover slice color mapping for chart
    var title = chart["options"]["title"]["text"];
    if ( title in sliceColorMapping) {
    } else {
        sliceColorMapping[title] = extractColorMapping(chart);
    }

    var colorMapping = sliceColorMapping[title];

    // set slice colors in data object
    for (var i = 0; i < data.length; i++) {
        var color = colorMapping[data[i]["name"]];
        data[i]["color"] = color;
    }

    // set new data for chart
    setNewChartData(chart, data);
    chart.redraw();
}

/**
 * Get the color mapping from a chart.
 */
function extractColorMapping(chart) {
    var mapping = {};
    var data = chart.series[0]["options"]["data"];
    var colors = chart["options"]["colors"];

    for (var i = 0; i < data.length; i++) {
        var name = data[i].name;
        var color = colors[(i % colors.length)];
        mapping[name] = color;
    }
    return mapping;
}

/**
 * Redraw pie charts using the current selectionCriteria object.
 */
function redrawCharts() {
    var selectedIds = cohort.selectIds(selectionCriteria.getCriteria());

    var chartIds = getKeys(chartObjMapping);
    for (var i = 0; i < chartIds.length; i++) {
        var chartId = chartIds[i];
        var chartObj = chartObjMapping[chartId];

        redrawNewData(chartObj, cohort.getPatientCounts(selectedIds, chartId));
    }

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
function initializeCharts(chartIdList) {
    var selectedIds = cohort.selectIds(selectionCriteria.getCriteria());

    // map chartId to chartObject
    var chartMapping = {};
    for (var i = 0; i < chartIdList.length; i++) {
        var chartId = chartIdList[i];
        var containingDivId = 'chart' + (i + 1);
        chartMapping[chartId] = initializeChart(containingDivId, chartId, chartId, selectedIds);
    }

    updateChartCrumbs(selectionCriteria);

    return chartMapping;
}

var chartObjMapping = {};

var sliceColorMapping = {};

var selectionCriteria = new selectionCriteria();
var cohort = null;

function getDatatypeData(url) {
    var response = getResponse(datatypeUrl);
    if (response == null) {
        return new Object();
    }
    var parsedResponse = parseJson(response);
    var contents = parsedResponse["contents"];
    var datatypeData = $.csv.toObjects(contents, {
        'separator' : '\t'
    });
    var datatypesObj = new Object();
    for (var i in datatypeData) {
        var row = datatypeData[i];
        var id = row["Sample"];
        var datatypes = new Array();
        for (var feature in row) {
            var value = row[feature];
            if (feature.trim() != "" && feature.trim() != "id" && feature.trim() != "Sample" && value != null && value.trim() != "") {
                datatypes.push(feature.trim());
            }
        }
        if (datatypes.length >= 1) {
            datatypesObj[id] = new Object();
            datatypesObj[id]["datatypes"] = datatypes;
        }
    }
    return datatypesObj;
}

setupDiv = function(containerDivId, chartNames) {
    var parentDivElem = document.getElementById(containerDivId);

    parentDivElem.appendChild(createDivElement('chartCrumbsDiv'));

    for (var i = 0; i < chartNames.length; i++) {
        var containerDivElem = createDivElement('chart' + (i + 1) + '_container', 'pieChartContainer');
        var chartDivElem = createDivElement('chart' + (i + 1), 'pieChart');
        parentDivElem.appendChild(containerDivElem);
        containerDivElem.appendChild(chartDivElem);
    }
};

pie_charts = function(config) {
    cohort = setCohortData(config['dataUrl']);

    var chartNames = ['studySite', 'biopsySite', 'subsequentDrugs', 'mutation_panel', 'ctc', 'acgh', 'rnaseq', 'ar_fish', 'pten_ihc'];

    setupDiv(config['containerDiv'], chartNames);

    chartObjMapping = initializeCharts(chartNames);
};
