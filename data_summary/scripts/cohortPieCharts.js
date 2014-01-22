/**
 * chrisw@soe.ucsc.edu
 * December 19, 2013
 * Draw pie charts using highcharts (http://www.highcharts.com/).
 */

// TODO use renderer to draw some element to act as a button to promote a chart to the top.
// http://api.highcharts.com/highcharts#Renderer
// https://stackoverflow.com/questions/11214481/how-can-i-add-element-with-attributes-to-svg-using-jquery

// var dataUrl = 'data_summary/data/cohort.json';
//var dataUrl = 'data_summary/data/cohort_dec28.json';
// on https://su2c-dev.ucsc.edu/
//var dataUrl = "/api/medbook/book/assetsBook/Book%3AProstate%20Cancer/Cohorts/WCDT%20Biopsies%3AJan%202014/Clinical/cohort_dec28.json";
var dataUrl = "data_summary/data/cohort_20140121.json";

/**
 * get the JSON data to create a cohortData object.
 */
function setCohortData(url) {
    var xhr = null;
    xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.onload = function() {
        var status = xhr.status;
        if (status != 200) {
            console.log("xhr error: " + status);
        }
    };
    xhr.send(null);
    var response = xhr.responseText;

    var parsedResponse = JSON && JSON.parse(response) || $.parseJSON(response);

    // value of contents is a stringified JSON
    var contents = JSON && JSON.parse(parsedResponse["contents"]) || $.parseJSON(parsedResponse["contents"]);

    // console.log(JSON.stringify(contents, null, '\t'));

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
            load : function() {
                var r = this.renderer;
                r.rect(10, 10, 16, 16, 3).attr({
                    "stroke-width" : 2,
                    "stroke" : 'red',
                    "fill" : 'yellow'
                }).on("click", function() {
                    console.log("clicked the square in: " + this.parentNode.parentNode.parentNode.id);
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
            format : '<b>{point.name}</b>: {point.y}'
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

var pieChartOptionsTemplate = {
    chart : chartOptions,
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
 * Set new series data directly on the chart instead of via chartOptions.
 * @param {Object} chartObject
 * @param {Object} chartData
 */
function setNewChartData(chartObject, chartData) {
    chartObject.series[0].data.length = 0;
    chartObject.series[0].setData(chartData);
}

/**
 * Redraw pie charts using the current selectionCriteria object.
 */
function redrawCharts() {
    var selectedIds = cohort.selectIds(selectionCriteria.getCriteria());

    var data = cohort.getPatientCounts(selectedIds, 'studySite');
    setNewChartData(studySiteChart, data);

    data = cohort.getPatientCounts(selectedIds, 'biopsySite');
    setNewChartData(biopsySiteChart, data);

    data = cohort.getPatientCounts(selectedIds, 'subsequentDrugs');
    setNewChartData(subsequentDrugsChart, data);

    data = cohort.getPatientCounts(selectedIds, 'treatmentDetails');
    setNewChartData(treatmentDetailsChart, data);

    studySiteChart.redraw();
    biopsySiteChart.redraw();
    subsequentDrugsChart.redraw();
    treatmentDetailsChart.redraw();

    updateChartCrumbs(selectionCriteria);
}

/**
 * initial drawing of charts
 */
function initializeCharts() {
    var selectedIds = cohort.selectIds(selectionCriteria.getCriteria());

    var studySiteData = cohort.getPatientCounts(selectedIds, 'studySite');
    var biopsySiteData = cohort.getPatientCounts(selectedIds, 'biopsySite');
    var subsequentDrugsData = cohort.getPatientCounts(selectedIds, 'subsequentDrugs');
    var treatmentDetailsData = cohort.getPatientCounts(selectedIds, 'treatmentDetails');

    var studySiteChartOptions = pieChartOptionsTemplate;
    var biopsySiteChartOptions = pieChartOptionsTemplate;
    var subsequentDrugsChartOptions = pieChartOptionsTemplate;
    var treatmentDetailsChartOptions = pieChartOptionsTemplate;

    setupChartOptions("chart01", "studySite", studySiteData, "Number of Samples by Study Site", studySiteChartOptions);
    studySiteChart = new Highcharts.Chart(studySiteChartOptions);

    setupChartOptions("chart02", "biopsySite", biopsySiteData, "Number of Samples by Biopsy Site", biopsySiteChartOptions);
    biopsySiteChart = new Highcharts.Chart(biopsySiteChartOptions);

    setupChartOptions("chart03", "subsequentDrugs", subsequentDrugsData, "Number of Samples by On-Study Drugs", subsequentDrugsChartOptions);
    subsequentDrugsChart = new Highcharts.Chart(subsequentDrugsChartOptions);

    setupChartOptions("chart04", "treatmentDetails", treatmentDetailsData, "Number of Samples by Treatment Details", treatmentDetailsChartOptions);
    treatmentDetailsChart = new Highcharts.Chart(treatmentDetailsChartOptions);

    updateChartCrumbs(selectionCriteria);
}

var studySiteChart = null;
var biopsySiteChart = null;
var subsequentDrugsChart = null;
var treatmentDetailsChart = null;
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
