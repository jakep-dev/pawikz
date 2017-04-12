﻿(function (pdfRoutes) {
    var async = require('async');
    var u = require('underscore');
    var fs = require('fs');
    var logger;

    function getImageBase64Data(imagePath) {
        var path = process.cwd() + '/' + imagePath;
        logger.info('--->' + path);
        var content = fs.readFileSync(path, 'base64');
        return content;
    };

    pdfRoutes.init = function (app, config, loggerObject) {
        logger = loggerObject;
        var client = config.restcall.client;
        var config = config;

        var dividendImageData = getImageBase64Data('src/assets/icons/images/Stock_Dividend.jpg');
        var earningsImageData = getImageBase64Data('src/assets/icons/images/Stock_Earnings.jpg');
        var splitImageData = getImageBase64Data('src/assets/icons/images/Stock_Split.jpg');

        config.parallel([
            app.post('/api/createTemplatePDFRequest', createTemplatePDFRequest),
            app.post('/api/downloadTemplatePDF', downloadTemplatePDF)
        ]);

        function getServiceDetails(serviceName) {
            return u.find(config.restcall.service, { name: serviceName });
        }

        function isDate(dateVal) {
            var d = new Date(dateVal);
            return d.toString() === 'Invalid Date' ? false : true;
        }

        function createPath(context) {
            var subContext = new Object();
            subContext.fs = require("fs");
            subContext.mkdirp = require('mkdirp');
            subContext.requestDir = context.service.exportOptions.pdfRequestDir + context.requestId;
            subContext.chartDir = subContext.requestDir + '/charts/';
            if (!subContext.fs.existsSync(subContext.requestDir)) {
                subContext.mkdirp.sync(subContext.chartDir);
            }
            return subContext.chartDir;
        }

        //context.ifcChartSettings[i].output ifcChartSetting chartName
        function setupGetIFCChartDataPoints(context, callback) {
            if ((context.errorMessages.length > 0) || !context.ifcChartSettings || !Array.isArray(context.ifcChartSettings) || (context.ifcChartSettings.length < 1)) {
                callback(null, context);
            } else {
                var subContext = new Object();
                subContext.i = 0;
                subContext.n = context.ifcChartSettings.length;
                subContext.settings = new Array();
                for (subContext.i = 0; subContext.i < subContext.n; subContext.i++) {
                    subContext.settings.push({
                        context: context,
                        index: subContext.i
                    });
                };
                async.map(subContext.settings, getIFCChartDataPoints, function (err, results) {
                    u.each(results, function (item) {
                        if (item) {
                            context.errorMessages.push(item);
                        }
                    });
                    context.ratioTypeMap = {};
                    context.ratioTypeMap = null;
                    delete context.ratioTypeMap;
                    delete context.defaultRatio;
                    delete context.defaultRatioLabel;
                    logger.info('[setupGetIFCChartDataPoints]Error Count = ' + context.errorMessages.length);
                    callback(null, context);
                });
            }
        }

        //setupGetIFCChartDataPoints --> chartSetting.context.chartSettings.output ifcChartSetting chartName
        //context.chartObjectArr
        function getIFCChartDataPoints(chartSetting, callback) {
            var subContext = new Object();
            subContext.url = config.restcall.url + '/' + chartSetting.context.service.name + '/' + chartSetting.context.service.methods.getFinancialChartData
            logger.info(subContext.url);
            subContext.args = {
                data: {
                    compare_name: chartSetting.context.ifcChartSettings[chartSetting.index].compareName,
                    short_name: chartSetting.context.ifcChartSettings[chartSetting.index].shortName,
                    compare_id: chartSetting.context.ifcChartSettings[chartSetting.index].compareId,
                    company_id: chartSetting.context.ifcChartSettings[chartSetting.index].companyId,
                    single_multi: chartSetting.context.ifcChartSettings[chartSetting.index].singleMulti,
                    ratioselect: chartSetting.context.ifcChartSettings[chartSetting.index].ratioSelect,
                    time_period: chartSetting.context.ifcChartSettings[chartSetting.index].timePeriod,
                    is_custom_date: chartSetting.context.ifcChartSettings[chartSetting.index].isCustomDate,
                    startdate: chartSetting.context.ifcChartSettings[chartSetting.index].startDate,
                    enddate: chartSetting.context.ifcChartSettings[chartSetting.index].endDate,
                    token: chartSetting.context.ssnid
                },
                headers: { "Content-Type": "application/json" }
            };

            client.post(subContext.url, subContext.args,
                function (data, response) {
                    subContext.errorMessage = null;
                    try {
                        if (data) {
                            if (data.data) {
                                if (!chartSetting.context.ifcChartSettings[chartSetting.index].ratioSelect) {
                                    subContext.rationSelect = chartSetting.context.defaultRatio;
                                } else {
                                    subContext.rationSelect = chartSetting.context.ifcChartSettings[chartSetting.index].ratioSelect;
                                }
                                subContext.yAxisLabel = chartSetting.context.ratioTypeMap[subContext.rationSelect];
                                if (!subContext.yAxisLabel) {
                                    subContext.yAxisLabel = chartSetting.context.defaultRatioLabel;
                                }
                                subContext.ifcChartSetting = getIFCChartObject(data.data, chartSetting.context.service.exportOptions.financialChartWidth, chartSetting.context.service.exportOptions.financialChartHeight, subContext.yAxisLabel);
                                subContext.chartName = chartSetting.context.ifcChartSettings[chartSetting.index].stepId + '.WU_RATIOS_CHART.WU_RATIOS_CHART.' + chartSetting.context.ifcChartSettings[chartSetting.index].chartId + '.part1.png';
                                //console.log(subContext.ifcChartSetting);
                                //<step_id>.WU_RATIOS_CHART.WU_RATIOS_CHART.<chart_id>.part1.png 
                                chartSetting.context.ifcChartSettings[chartSetting.index].output = {
                                    ifcChartSetting: subContext.ifcChartSetting,
                                    chartName: subContext.chartName
                                }
                                //console.log(chartSetting.context.ifcChartSettings[chartSetting.index].output.ifcChartSetting.xAxis.categories);
                                //console.log(chartSetting.context.ifcChartSettings[chartSetting.index].output.ifcChartSetting.series);
                                //console.log(chartSetting.context.ifcChartSettings[chartSetting.index].output);
                                chartSetting.context.chartObjectArr.push({
                                    infile: JSON.stringify(subContext.ifcChartSetting),
                                    callback: '',
                                    constr: '',
                                    outfile: subContext.chartName,
                                    page: 'STOCK_CHART'
                                });
                            } else {
                                subContext.errorMessage = '[getIFCChartDataPoints]data.data from ' + chartSetting.context.service.methods.getFinancialChartData + 'is null'
                                logger.error(subContext.errorMessage + '\nargs = ' + JSON.stringify(subContext.args));
                            }
                        } else {
                            subContext.errorMessage = '[getIFCChartDataPoints]data from ' + chartSetting.context.service.methods.getFinancialChartData + 'is null'
                            logger.error(subContext.errorMessage + '\nargs = ' + JSON.stringify(subContext.args));
                        }
                    } catch (exception) {
                        logger.error('[getIFCChartDataPoints]Error\n' + JSON.stringify(exception));
                        subContext.errorMessage = exception.message;
                    }
                    callback(null, subContext.errorMessage);
                }
            ).on('error',
                function (err) {
                    logger.error('[getIFCChartDataPoints]Error\n' + JSON.stringify(err));
                    subContext.message = 'Error connecting to ' + chartSetting.context.service.methods.getFinancialChartData + ' url:' + subContext.url;
                    callback(null, subContext.message);
                }
            );
        }

        function getIFCChartObject(data, width, height, yAxisLabel) {
            var context = new Object;
            context.dateList = new Array();
            context.dateArr = new Array();
            context.ratioNames = new Array();
            context.ratioNameArr = new Array();
            context.seriesSet = new Array();

            if (Array.isArray(data)) {
                context.n1 = data.length;
                for (context.i = 0; context.i < context.n1; context.i++) {
                    if (data[context.i].ratio_name) {
                        if (!context.ratioNames[data[context.i].ratio_name]) {
                            context.currentObj = new Object();
                            context.currentObj._count = 1;
                            context.currentObj.shortName = data[context.i].ratio_short_name;
                            context.currentObj.data = new Array();
                            context.ratioNames[data[context.i].ratio_name] = context.currentObj;
                            context.ratioNameArr.push(data[context.i].ratio_name);
                        } else {
                            context.currentObj = context.ratioNames[data[context.i].ratio_name];
                            context.currentObj._count = context.currentObj._count + 1;
                            if (context.currentObj.shortName != data[context.i].ratio_short_name) {
                                logger.warn(data[context.i].ratio_name + "'s short_name changed from " + context.currentObj.shortName + ' to ' + data[context.i].ratio_short_name);
                            }
                            context.currentObj.shortName = data[context.i].ratio_short_name;
                        }
                    }
                    if (data[context.i].datadate) {
                        context.dateValue = data[context.i].datadate.substring(0, 10);
                        if (!context.dateList[context.dateValue]) {
                            context.dateArr.push(context.dateValue);
                            context.currentList = new Array();
                            context.currentList[data[context.i].ratio_name] = new Object();
                            context.currentList[data[context.i].ratio_name].ratio_value = parseFloat(data[context.i].ratio_value);
                            context.currentList[data[context.i].ratio_name].percent_change = parseFloat(data[context.i].percent_change);
                            context.dateList[context.dateValue] = context.currentList;
                        } else {
                            context.currentList = context.dateList[context.dateValue];
                            if (data[context.i].ratio_name) {
                                if (!context.currentList[data[context.i].ratio_name]) {
                                    context.currentList[data[context.i].ratio_name] = new Object();
                                    context.currentList[data[context.i].ratio_name].ratio_value = parseFloat(data[context.i].ratio_value);
                                    context.currentList[data[context.i].ratio_name].percent_change = parseFloat(data[context.i].percent_change);
                                } else {
                                    logger.warn('Duplicate chart value for the same ratio_name and datadate.[' + context.dateValue + ',' + data[context.i].ratio_name + ']');
                                }
                            }
                        }
                    }
                }
            }

            context.dateArr.sort();
            context.n1 = context.dateArr.length;
            context.n2 = context.ratioNameArr.length;
            for (context.i = 0; context.i < context.n1; context.i++) {
                context.currentList = context.dateList[context.dateArr[context.i]];
                for (context.j = 0; context.j < context.n2; context.j++) {
                    context.currentObj = context.ratioNames[context.ratioNameArr[context.j]];
                    context.value = context.currentList[context.ratioNameArr[context.j]];
                    if (context.value) {
                        if (context.n2 > 1) {
                            context.currentObj.data.push(context.value.percent_change);
                        } else {
                            context.currentObj.data.push(context.value.ratio_value);
                        }
                    } else {
                        logger.warn('Missing ' + context.ratioNameArr[context.j] + ' value for datadate ' + context.dateArr[context.i]);
                        context.currentObj.data.push(null);
                    }
                }
            }

            context.n1 = context.ratioNameArr.length;
            for (context.i = 0; context.i < context.n1; context.i++) {
                context.currentObj = context.ratioNames[context.ratioNameArr[context.i]];
                if (context.currentObj.shortName) {
                    context.finalName = context.currentObj.shortName;
                } else {
                    context.finalName = context.ratioNameArr[context.i];
                }
                context.seriesSet.push({
                    data: context.currentObj.data,
                    connectNulls: true,
                    name: context.finalName
                });
            }
            if (context.n2 > 1) {
                yAxisLabel += ' - Percent Change';
            }
            context.chartObject = {
                chart: {
                    marginRight: 80,
                    spacingTop: 30,
                    spacingBottom: 4,
                    type: "line",
                    width: width,
                    height: height
                },
                exporting: {
                    enabled: false
                },
                title: {
                    text: '',
                    align: 'left',
                    margin: 0,
                    x: 30
                },
                credits: {
                    enabled: false
                },
                legend: {
                    enabled: true,
                    align: 'top',
                    verticalAlign: 'top',
                    x: 220,
                    y: -25,
                    itemDistance: 85,
                    symbolHeight: 20,
                    symbolWidth: 6,
                    symbolRadius: 4
                },
                xAxis: {
                    type: 'datetime',
                    categories: context.dateArr,
                    crosshair: {
                        width: 1,
                        color: 'gray',
                        dashStyle: 'shortdot'
                    },
                    showFirstLabel: true,
                    showLastLabel: true,
                    labels: {
                        align: 'center',
                        enabled: true
                    }
                },
                plotOptions: {
                    series: {
                        marker: { enabled: false }
                    }
                },
                yAxis: {
                    title: {
                        text: yAxisLabel
                    },
                    crosshair: {
                        width: 1,
                        color: 'gray',
                        dashStyle: 'shortdot'
                    }
                },
                tooltip: {
                    valueDecimals: 1,
                    positioner: function () {
                        return { x: 70, y: 0 }
                    },
                    enabled: true
                },
                series: context.seriesSet
            };

            context.ratioNames.length = 0;
            context.ratioNames = {};
            context.ratioNames = null;
            context.ratioNameArr.length = 0;
            context.dateList = {};
            context.dateList = null;
            delete context.dateArr;
            delete context.seriesSet;
            delete context.n1;
            delete context.i;
            delete context.currentObj;
            delete context.dateValue;
            delete context.currentList;
            delete context.n2;
            delete context.j;
            delete context.value;
            delete context.finalName;
            delete context.ratioNames;
            delete context.ratioNameArr;
            delete context.dateList;
            //console.log('----------------------------------------');
            //console.log(context);
            //console.log('----------------------------------------');
            return context.chartObject;
        }

        //context.ifcChartSettings
        function getAllSavedIFChartSettings(context, callback) {
            if (context.errorMessages.length > 0) {
                callback(null, context);
            } else {
                var subContext = new Object();
                subContext.methodName = '';
                if (!u.isUndefined(context.service) && !u.isNull(context.service)) {
                    subContext.methodName = context.service.methods.getAllSavedIFChartSettings;
                }
                subContext.url = config.restcall.url + '/' + context.service.name + '/' + subContext.methodName + '?project_id=' + context.project_id + '&ssnid=' + context.ssnid;
                logger.info(subContext.url);
                client.get(subContext.url,
                    function (data, response) {
                        subContext.ifcChartSettings = null;
                        try {
                            subContext.ifcChartSettings = getAllIFCChartSettingsResponse(data);
                            context.ifcChartSettings = subContext.ifcChartSettings;
                        }
                        catch (exception) {
                            logger.error('[getAllSavedIFChartSettings]Error\n' + JSON.stringify(exception));
                            context.errorMessages.push(exception.message);
                        }
                        callback(null, context);
                    }
                ).on('error',
                    function (err) {
                        console.log('[getAllSavedIFChartSettings]Error\n' + err);
                        subContext.message = 'Error connecting to ' + subContext.methodName + '. url:' + subContext.url;
                        context.errorMessages.push(subContext.message);
                        callback(null, context);
                    }
                );
            }
        }

        function getAllIFCChartSettingsResponse(data) {
            var subContext = new Object();
            if (data && data.items) {
                subContext.items = data.items;
            } else {
                subContext.items = [];
            }
            subContext.n1 = subContext.items.length;
            subContext.chartSettings = new Array();
            for (subContext.i = 0; subContext.i < subContext.n1; subContext.i++) {
                subContext.ifChartSettings = subContext.items[subContext.i].ifChartSettings;
                subContext.n2 = subContext.ifChartSettings.length;
                for (subContext.j = 0; subContext.j < subContext.n2; subContext.j++) {
                    subContext.chart = new Object();
                    subContext.chart.stepId = subContext.items[subContext.i].step_id;
                    subContext.chart.mnemonicId = subContext.items[subContext.i].mnemonic;
                    subContext.chart.itemId = subContext.items[subContext.i].item_id;
                    subContext.chart.chartId = subContext.ifChartSettings[subContext.j].chartId;
                    subContext.chart.sequence = subContext.ifChartSettings[subContext.j].sequence;
                    subContext.chart.compareName = subContext.ifChartSettings[subContext.j].compare_name;
                    subContext.chart.compareId = subContext.ifChartSettings[subContext.j].compare_id;
                    subContext.chart.companyId = subContext.ifChartSettings[subContext.j].company_id;
                    if (!subContext.chart.companyId) {
                        subContext.chart.companyId = subContext.ifChartSettings[subContext.j].compare_id[0];
                        subContext.ifChartSettings[subContext.j].company_id = subContext.chart.companyId;
                    }
                    subContext.chart.shortName = subContext.ifChartSettings[subContext.j].short_name;
                    subContext.chart.singleMulti = subContext.ifChartSettings[subContext.j].single_multi;
                    subContext.chart.ratioSelect = subContext.ifChartSettings[subContext.j].ratioselect;
                    subContext.chart.isCustomDate = subContext.ifChartSettings[subContext.j].is_custom_date;
                    subContext.chart.timePeriod = subContext.ifChartSettings[subContext.j].time_period;
                    subContext.chart.startDate = subContext.ifChartSettings[subContext.j].start_date;
                    subContext.chart.endDate = subContext.ifChartSettings[subContext.j].end_date;
                    subContext.chartSettings.push(subContext.chart);
                }
            }
            return subContext.chartSettings;
        }

        //context.ratioTypeMap
        //context.defaultRatio
        //context.defaultRatioLabel
        function getFinancialChartRatioTypes(context, callback) {
            if (context.errorMessages.length > 0) {
                callback(null, context);
            } else {
                var subContext = new Object();
                subContext.methodName = '';
                if (!u.isUndefined(context.service) && !u.isNull(context.service)) {
                    subContext.methodName = context.service.methods.getFinancialChartRatioTypes;
                }
                subContext.url = config.restcall.url + '/' + context.service.name + '/' + subContext.methodName + '?ssnid=' + context.ssnid;
                console.log(subContext.url);
                client.get(subContext.url,
                    function (data, response) {
                        try {
                            subContext.ratioTypes = data.data;
                            subContext.ratioTypeMap = [];
                            subContext.defaultRatio = null;
                            subContext.defaultRatioLabel = null;
                            subContext.n = subContext.ratioTypes.length;
                            for (subContext.i = 0; subContext.i < subContext.n; subContext.i++) {
                                if (!subContext.defaultRatio && subContext.ratioTypes[subContext.i].value) {
                                    subContext.defaultRatio = subContext.ratioTypes[subContext.i].value;
                                    subContext.defaultRatioLabel = subContext.ratioTypes[subContext.i].label;
                                }
                                if (subContext.ratioTypes[subContext.i].value) {
                                    if (!subContext.ratioTypeMap[subContext.ratioTypes[subContext.i].value]) {
                                        subContext.ratioTypeMap[subContext.ratioTypes[subContext.i].value]= subContext.ratioTypes[subContext.i].label;
                                    }
                                }
                            }
                            context.ratioTypeMap = subContext.ratioTypeMap;
                            context.defaultRatio = subContext.defaultRatio;
                            context.defaultRatioLabel = subContext.defaultRatioLabel;
                        } catch (exception) {
                            console.log('[getFinancialChartRatioTypes]Error\n' + exception);
                            context.errorMessages.push(exception.message);
                        }
                        callback(null, context);
                    }
                ).on('error',
                    function (err) {
                        console.log('[getFinancialChartRatioTypes]Error\n' + err);
                        subContext.message = 'Error connecting to ' + subContext.methodName + '. url:' + subContext.url;
                        context.errorMessages.push(subContext.message);
                        callback(null, context);
                    }
                );
            }
        }

        function processInteractiveFinancialCharts(context, callback) {

            function startup_IFC(callback) {
                callback(null, context);
            }

            async.waterfall([startup_IFC, getFinancialChartRatioTypes, getAllSavedIFChartSettings, setupGetIFCChartDataPoints],
                function (err, input) {
                    //console.log(context);
                    callback(null, context);
                }
            );

        }

        //context.chartSettings[i].output stockChartSetting volumeChartSetting chartName
        function setupGetChartDataPoints(context, callback) {
            if ((context.errorMessages.length > 0) || !context.chartSettings || !Array.isArray(context.chartSettings) || (context.chartSettings.length < 1)) {
                callback(null, context);
            } else {
                var subContext = new Object();
                subContext.i = 0;
                subContext.n = context.chartSettings.length;
                subContext.settings = new Array();
                for (subContext.i = 0; subContext.i < subContext.n; subContext.i++) {
                    subContext.settings.push({
                        context: context,
                        index: subContext.i
                    });
                };
                async.map(subContext.settings, getChartDataPoints, function (err, results) {
                    u.each(results, function (item) {
                        if (item) {
                            context.errorMessages.push(item);
                        }
                    });
                    console.log('[setupGetChartDataPoints]Error Count = ' + context.errorMessages.length);
                    callback(null, context);
                });
            }
        }

        //setupGetChartDataPoints --> chartSetting.context.chartSettings.output stockChartSetting volumeChartSetting chartName
        //context.chartObjectArr
        function getChartDataPoints(chartSetting, callback) {
            var subContext = new Object();
            if (chartSetting.context.chartSettings[chartSetting.index] && chartSetting.context.chartSettings[chartSetting.index].output) {
                console.log(chartSetting.context.service.methods.getStockData + ' API call---->', chartSetting.context.chartSettings[chartSetting.index].output.url);
                client.get(chartSetting.context.chartSettings[chartSetting.index].output.url,
                    function (data, response) {
                        subContext.errorMessage = null;
                        try {
                            chartSetting.context.chartSettings[chartSetting.index].output.activity = groupChartData(data);
                            subContext.activity = chartSetting.context.chartSettings[chartSetting.index].output.activity;
                            if (subContext.activity.datasets.length > 0) {
                                subContext.dataset = subContext.activity.datasets[0];
                                subContext.stockChartSetting = {
                                    chart: {
                                        marginRight: 80,
                                        spacingTop: subContext.dataset.spacingTop,
                                        spacingBottom: 4,
                                        zoomType: 'x',
                                        type: subContext.dataset.type,
                                        width: chartSetting.context.service.exportOptions.stockChartWidth,
                                        height: chartSetting.context.service.exportOptions.stockChartHeight
                                    },
                                    exporting: {
                                        enabled: false
                                    },
                                    title: {
                                        text: subContext.dataset.name,
                                        align: 'left',
                                        margin: 0,
                                        x: 30
                                    },
                                    credits: {
                                        enabled: false
                                    },
                                    legend: {
                                        enabled: subContext.dataset.showlegend,
                                        align: 'top',
                                        verticalAlign: 'top',
                                        x: 220,
                                        y: -25,
                                        itemDistance: 85,
                                        symbolHeight: 20,
                                        symbolWidth: 6,
                                        symbolRadius: 4
                                    },
                                    xAxis: {
                                        type: 'datetime',
                                        categories: subContext.activity.xData,
                                        crosshair: {
                                            width: 1,
                                            color: 'gray',
                                            dashStyle: 'shortdot'
                                        },
                                        labels: {
                                            //rotation: 0,
                                            //distance: 10,
                                            align: 'center',
                                            enabled: subContext.dataset.showxaxisLabel
                                        }
                                    },
                                    plotOptions: {
                                        series: {
                                            marker: { enabled: false }
                                        }
                                    },
                                    yAxis: {
                                        title: {
                                            text: subContext.dataset.yaxisTitle
                                        },
                                        crosshair: {
                                            width: 1,
                                            color: 'gray',
                                            dashStyle: 'shortdot'
                                        }
                                    },
                                    tooltip: {
                                        valueDecimals: subContext.dataset.valueDecimals,
                                        positioner: function () {
                                            return { x: 70, y: 0 }
                                        },
                                        enabled: subContext.dataset.showtooltip
                                    },
                                    lang: {
                                        noData: "No Data Available"
                                    },
                                    noData: {
                                        style: {
                                            fontWeight: 'bold',
                                            fontSize: '15px',
                                            color: '#FF0000'
                                        }
                                    },
                                    series: subContext.dataset.series
                                };
                                chartSetting.context.chartSettings[chartSetting.index].output.stockChartSetting = subContext.stockChartSetting;
                            } else {
                                subContext.stockChartSetting = null;
                            }

                            if (subContext.activity.datasets.length > 1) {
                                subContext.dataset = subContext.activity.datasets[1];
                                subContext.volumeChartSetting = {
                                    chart: {
                                        marginRight: 80,
                                        spacingTop: subContext.dataset.spacingTop,
                                        spacingBottom: 4,
                                        zoomType: 'x',
                                        type: subContext.dataset.type,
                                        width: chartSetting.context.service.exportOptions.volumeChartWidth,
                                        height: chartSetting.context.service.exportOptions.volumeChartHeight
                                    },
                                    exporting: {
                                        enabled: false
                                    },
                                    title: {
                                        text: subContext.dataset.name,
                                        align: 'left',
                                        margin: 0,
                                        x: 30
                                    },
                                    credits: {
                                        enabled: false
                                    },
                                    legend: {
                                        enabled: subContext.dataset.showlegend,
                                        align: 'top',
                                        verticalAlign: 'top',
                                        x: 220,
                                        y: -25,
                                        itemDistance: 85,
                                        symbolHeight: 20,
                                        symbolWidth: 6,
                                        symbolRadius: 4

                                    },
                                    xAxis: {
                                        type: 'datetime',
                                        categories: subContext.activity.xData,
                                        crosshair: {
                                            width: 1,
                                            color: 'gray',
                                            dashStyle: 'shortdot'
                                        },
                                        labels: {
                                            //rotation: 0,
                                            //distance: 10,
                                            align: 'center',
                                            enabled: subContext.dataset.showxaxisLabel
                                        }
                                    },
                                    plotOptions: {
                                        series: {
                                            marker: { enabled: false }
                                        }
                                    },
                                    yAxis: {
                                        title: {
                                            text: subContext.dataset.yaxisTitle
                                        },
                                        crosshair: {
                                            width: 1,
                                            color: 'gray',
                                            dashStyle: 'shortdot'
                                        }
                                    },
                                    tooltip: {
                                        valueDecimals: subContext.dataset.valueDecimals,
                                        positioner: function () {
                                            return { x: 70, y: 0 }
                                        },
                                        enabled: subContext.dataset.showtooltip
                                    },
                                    lang: {
                                        noData: "No Data Available"
                                    },
                                    noData: {
                                        style: {
                                            fontWeight: 'bold',
                                            fontSize: '15px',
                                            color: '#FF0000'
                                        }
                                    },
                                    series: subContext.dataset.series
                                };
                                chartSetting.context.chartSettings[chartSetting.index].output.volumeChartSetting = subContext.volumeChartSetting;
                            } else {
                                subContext.volumeChartSetting = null;
                            }


                            subContext.chartName = (chartSetting.context.chartSettings[chartSetting.index].step_id) +
                                "." + (chartSetting.context.chartSettings[chartSetting.index].mnemonic) +
                                "." +(chartSetting.context.chartSettings[chartSetting.index].item_id) +
                                "." +(chartSetting.context.chartSettings[chartSetting.index].chart_id);
                            chartSetting.context.chartSettings[chartSetting.index].output.chartName = subContext.chartName;
                            delete chartSetting.context.chartSettings[chartSetting.index].output.activity;
                            //console.log(chartSetting.context.chartSettings[chartSetting.index].output);
                            if (subContext.stockChartSetting) {
                                chartSetting.context.chartObjectArr.push({
                                    infile: JSON.stringify(subContext.stockChartSetting),
                                    callback: '',
                                    constr: '',
                                    outfile: subContext.chartName + '.part0.png',
                                    page: 'STOCK_CHART'
                                });
                            }
                            if (subContext.volumeChartSetting) {
                                chartSetting.context.chartObjectArr.push({
                                    infile: JSON.stringify(subContext.volumeChartSetting),
                                    callback: '',
                                    constr: '',
                                    outfile: subContext.chartName + '.part1.png',
                                    page: 'STOCK_CHART'
                                });
                            }

                        } catch (exception) {
                            console.log('[getChartDataPoints]Error\n' + exception);
                            subContext.errorMessage = exception.message;
                        }
                        //var chartDataFileName = chartSetting.output.chartName + ".txt";
                        //console.log(chartSetting.context.chartSettings[chartSetting.index].output.chartName);
                        callback(null, subContext.errorMessage);
                    }
                ).on('error',
                    function (err) {
                        console.log('[getChartDataPoints]Error\n' + err);
                        subContext.message = 'Error connecting to ' + chartSetting.context.service.methods.getStockData + '. url:' + chartSetting.context.chartSettings[chartSetting.index].output.url;
                        callback(null, subContext.message);
                    }
                );
            } else {
                console.log('[getChartDataPoints]' + chartSetting.context.service.methods.getStockData + ' API call----> MISSING');
                subContext.message = 'Invalid ' + chartSetting.context.service.methods.getStockData + ' url.';
                callback(null, subContext.message);
            }
        }

        function groupChartData(data) {
            var subContext = new Object();
            subContext.results = data;

            subContext.stockNames = new Array();
            subContext.stockNameArr = new Array();
            subContext.dateList = new Array();
            subContext.dateArr = new Array();
            subContext.dividendsList = new Array();
            subContext.earningsList = new Array();
            subContext.splitsList = new Array();
            subContext.volumeArr = new Array();
            subContext.datasets = new Array();
            subContext.seriesSet = new Array();
            subContext.datasetArr = new Array();
            subContext.volumeSetArr = new Array();

            if (subContext.results) {
                if (subContext.results.stockChartPrimaryData && Array.isArray(subContext.results.stockChartPrimaryData)) {
                    subContext.n = subContext.results.stockChartPrimaryData.length;
                    if (subContext.n > 0) {
                        for (subContext.i = 0; subContext.i < subContext.n; subContext.i++) {
                            subContext.primaryChartDataItem = subContext.results.stockChartPrimaryData[subContext.i];
                            if (subContext.primaryChartDataItem) {
                                if (subContext.primaryChartDataItem.ticker) {
                                    if (!subContext.stockNames[subContext.primaryChartDataItem.ticker]) {
                                        subContext.currentObj = new Object();
                                        subContext.currentObj._count = 1;
                                        subContext.currentObj.data = new Array();
                                        subContext.stockNames[subContext.primaryChartDataItem.ticker] = subContext.currentObj;
                                        subContext.mainTicker = subContext.primaryChartDataItem.ticker;
                                        subContext.stockNameArr.push(subContext.primaryChartDataItem.ticker);
                                    } else {
                                        subContext.currentObj = subContext.stockNames[subContext.primaryChartDataItem.ticker];
                                        subContext.currentObj._count = subContext.currentObj._count + 1;
                                    }
                                }
                                if (subContext.primaryChartDataItem.dataDate) {
                                    subContext.dateValue = subContext.primaryChartDataItem.dataDate.substring(0, 10);
                                    subContext.valueObject = new Object();
                                    subContext.valueObject.priceClose = parseFloat(subContext.primaryChartDataItem.priceClose);
                                    subContext.valueObject.percentChange = parseFloat(subContext.primaryChartDataItem.percentChange);
                                    subContext.valueObject.securityCode = subContext.primaryChartDataItem.securityCode;
                                    subContext.valueObject.priceOpen = parseFloat(subContext.primaryChartDataItem.priceOpen);
                                    subContext.valueObject.priceHigh = parseFloat(subContext.primaryChartDataItem.priceHigh);
                                    subContext.valueObject.priceLow = parseFloat(subContext.primaryChartDataItem.priceLow);
                                    subContext.valueObject.volume = parseFloat(subContext.primaryChartDataItem.volume);
                                    subContext.valueObject.currency = subContext.primaryChartDataItem.currency;

                                    if (!subContext.dateList[subContext.dateValue]) {
                                        subContext.dateArr.push(subContext.dateValue);
                                        subContext.currentList = new Array();
                                        subContext.currentList[subContext.primaryChartDataItem.ticker] = subContext.valueObject;
                                        subContext.dateList[subContext.dateValue] = subContext.currentList;
                                    } else {
                                        subContext.currentList = subContext.dateList[subContext.dateValue];
                                        if (subContext.primaryChartDataItem.ticker) {
                                            if (!subContext.currentList[subContext.primaryChartDataItem.ticker]) {
                                                subContext.currentList[subContext.primaryChartDataItem.ticker] = subContext.valueObject;
                                            } else {
                                                console.log('Duplicate chart value for the same ticker and dataDate.[' + subContext.dateValue + ',' + subContext.primaryChartDataItem.ticker + ']');
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                if (subContext.results.stockChartPeerData && Array.isArray(subContext.results.stockChartPeerData)) {
                    subContext.n = subContext.results.stockChartPeerData.length;
                    if (subContext.n > 0) {
                        for (subContext.i = 0; subContext.i < subContext.n; subContext.i++) {
                            subContext.peerDataItem = subContext.results.stockChartPeerData[subContext.i];
                            if (subContext.peerDataItem) {
                                if (subContext.peerDataItem.ticker) {
                                    if (!subContext.stockNames[subContext.peerDataItem.ticker]) {
                                        subContext.currentObj = new Object();
                                        subContext.currentObj._count = 1;
                                        subContext.currentObj.data = new Array();
                                        subContext.stockNames[subContext.peerDataItem.ticker] = subContext.currentObj;
                                        subContext.stockNameArr.push(subContext.peerDataItem.ticker);
                                    } else {
                                        subContext.currentObj = subContext.stockNames[subContext.peerDataItem.ticker];
                                        subContext.currentObj._count = subContext.currentObj._count + 1;
                                    }
                                }
                                if (subContext.peerDataItem.dataDate) {
                                    subContext.dateValue = subContext.peerDataItem.dataDate.substring(0, 10);
                                    subContext.valueObject = new Object();
                                    subContext.valueObject.priceClose = parseFloat(subContext.peerDataItem.priceClose);
                                    subContext.valueObject.percentChange = parseFloat(subContext.peerDataItem.percentChange);

                                    if (!subContext.dateList[subContext.dateValue]) {
                                        subContext.dateArr.push(subContext.dateValue);
                                        subContext.currentList = new Array();
                                        subContext.currentList[subContext.peerDataItem.ticker] = subContext.valueObject;
                                        subContext.dateList[subContext.dateValue] = subContext.currentList;
                                    } else {
                                        subContext.currentList = subContext.dateList[subContext.dateValue];
                                        if (subContext.peerDataItem.ticker) {
                                            if (!subContext.currentList[subContext.peerDataItem.ticker]) {
                                                subContext.currentList[subContext.peerDataItem.ticker] = subContext.valueObject;
                                            } else {
                                                console.log('Duplicate chart value for the same ticker and dataDate.[' + subContext.dateValue + ',' + subContext.peerDataItem.ticker + ']');
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                if (subContext.results.dividends && Array.isArray(subContext.results.dividends)) {
                    subContext.n = subContext.results.dividends.length;
                    for (subContext.i = 0; subContext.i < subContext.n; subContext.i++) {
                        if (subContext.results.dividends[subContext.i] && subContext.results.dividends[subContext.i].dataDate) {
                            subContext.dateValue = subContext.results.dividends[subContext.i].dataDate.substring(0, 10);
                            subContext.dividendsList[subContext.dateValue] = {
                                value: subContext.results.dividends[subContext.i].value,
                                valueInUsd: subContext.results.dividends[subContext.i].valueInUsd
                            };
                            if (!subContext.dateList[subContext.dateValue]) {
                                console.log('Can\'t find data point for dividend that happen on ' + subContext.dateValue + ' with value = ' + subContext.dividendsList[subContext.dateValue].value);
                            }
                        }
                    }
                }
                if (subContext.results.earnings && Array.isArray(subContext.results.earnings)) {
                    subContext.n = subContext.results.earnings.length;
                    for (subContext.i = 0; subContext.i < subContext.n; subContext.i++) {
                        if (subContext.results.earnings[subContext.i] && subContext.results.earnings[subContext.i].dataDate) {
                            subContext.dateValue = subContext.results.earnings[subContext.i].dataDate.substring(0, 10);
                            subContext.earningsList[subContext.dateValue] = {
                                value: subContext.results.earnings[subContext.i].value,
                                valueInUsd: subContext.results.earnings[subContext.i].valueInUsd
                            };
                            if (!subContext.dateList[subContext.dateValue]) {
                                console.log('Can\'t find data point for earnings that happen on ' + subContext.dateValue + ' with value = ' + subContext.earningsList[subContext.dateValue].value);
                            }
                        }
                    }
                }
                if (subContext.results.splits && Array.isArray(subContext.results.splits)) {
                    subContext.n = subContext.results.splits.length;
                    for (subContext.i = 0; subContext.i < subContext.n; subContext.i++) {
                        if (subContext.results.splits[subContext.i] && subContext.results.splits[subContext.i].dataDate) {
                            subContext.dateValue = subContext.results.splits[subContext.i].dataDate.substring(0, 10);
                            subContext.splitsList[subContext.dateValue] = {
                                value: subContext.results.splits[subContext.i].value,
                                valueInUsd: subContext.results.splits[subContext.i].valueInUsd
                            };
                            if (!subContext.dateList[subContext.dateValue]) {
                                console.log('Can\'t find data point for split that happen on ' + subContext.dateValue + ' with value = ' + subContext.splitsList[subContext.dateValue].value);
                            }
                        }
                    }
                }
            }

            if (subContext.results && subContext.results.stockChartPrimaryData && Array.isArray(subContext.results.stockChartPrimaryData) && (subContext.results.stockChartPrimaryData.length > 0)) {
                subContext.dateArr.sort();
                subContext.dateArr.forEach(function (dataDate) {
                    subContext.currentList = subContext.dateList[dataDate];
                    subContext.stockNameArr.forEach(function (ticker) {
                        subContext.currentObj = subContext.stockNames[ticker];
                        subContext.valueObject = subContext.currentList[ticker];
                        if (subContext.valueObject) {
                            if (subContext.stockNameArr.length > 1) {
                                subContext.value = subContext.valueObject.percentChange
                            } else {
                                subContext.value = subContext.valueObject.priceClose
                            }
                            if (ticker === subContext.mainTicker) {
                                subContext.volumeArr.push(subContext.valueObject.volume);
                                if (subContext.dividendsList[dataDate]) {
                                    subContext.currentObj.data.push({
                                        y: subContext.value,
                                        marker: {
                                            enabled: true,
                                            symbol: 'url(data:image/jpeg;base64,' + dividendImageData + ')'
                                        }
                                    });
                                } else if (subContext.earningsList[dataDate]) {
                                    subContext.currentObj.data.push({
                                        y: subContext.value,
                                        marker: {
                                            enabled: true,
                                            symbol: 'url(data:image/jpeg;base64,' + earningsImageData + ')'
                                        }
                                    });
                                } else if (subContext.splitsList[dataDate]) {
                                    subContext.currentObj.data.push({
                                        y: subContext.value,
                                        marker: {
                                            enabled: true,
                                            symbol: 'url(data:image/jpeg;base64,' + splitImageData + ')'
                                        }
                                    });
                                } else {
                                    subContext.currentObj.data.push(subContext.value);
                                }
                            } else {
                                subContext.currentObj.data.push(subContext.value);
                            }
                        } else {
                            console.log('Missing ' + ticker + ' value for datadate ' + dataDate);
                            subContext.currentObj.data.push(null);
                            if (ticker === subContext.mainTicker) {
                                subContext.volumeArr.push(null);
                            }
                        }
                    });
                });

                subContext.stockNameArr.forEach(function (ticker) {
                    subContext.currentObj = subContext.stockNames[ticker];
                    subContext.datasets.push({
                        name: ticker,
                        data: subContext.currentObj.data,
                        type: "spline",
                        valueDecimals: 1
                    });
                    subContext.seriesSet.push({
                        data: subContext.currentObj.data,
                        connectNulls: true,
                        name: ticker
                    });
                });

                if (subContext.stockNameArr.length > 1) {
                    subContext.firstChartTitle = 'Percent Change';
                } else {
                    subContext.firstChartTitle = 'Price';
                }

                subContext.datasetArr[subContext.datasetArr.length] = {
                    name: "",
                    yaxisTitle: subContext.firstChartTitle,
                    xaxisTitle: "",
                    series: subContext.seriesSet,
                    data: subContext.datasets,
                    type: "spline",
                    valueDecimals: 1,
                    showlegend: true,
                    showxaxisLabel: false,
                    showtooltip: true,
                    spacingTop: 30
                };

                subContext.volumeSetArr[subContext.volumeSetArr.length] = {
                    data: subContext.volumeArr
                };

                subContext.datasetArr[subContext.datasetArr.length] = {
                    name: '',
                    yaxisTitle: 'Volume (Millions)',
                    xaxisTitle: '',
                    series: subContext.volumeSetArr,
                    data: subContext.volumeArr,
                    type: 'column',
                    valueDecimals: 0,
                    showlegend: false,
                    showxaxisLabel: true,
                    showtooltip: false,
                    spacingTop: 7
                };
            } else {
                subContext.datasetArr[subContext.datasetArr.length] = {
                    "name": "",
                    "yaxisTitle": "",
                    "xaxisTitle": "",
                    "series": [{
                        "data": [],
                        "name": " "
                    }],
                    "data": [],
                    "type": "spline",
                    "showlegend": false,
                    "showxaxisLabel": false,
                    "showtooltip": false,
                    "spacingTop": 30,
                    "valueDecimals": 1
                };
            }
            subContext.ouput = {
                xData: subContext.dateArr,
                datasets: subContext.datasetArr
            };
            //console.log(subContext.ouput);

            subContext.dividendsList = {};
            subContext.dividendsList = null;
            delete subContext.dividendsList;
            subContext.earningsList = {};
            subContext.earningsList = null;
            delete subContext.earningsList;
            subContext.splitsList = {};
            subContext.splitsList = null;
            delete subContext.splitsList;
            subContext.dateList = {};
            subContext.dateList = null;
            delete subContext.dateList;
            subContext.stockNames = {};
            subContext.stockNames = null;
            delete subContext.stockNames;
            subContext.stockNameArr.length = 0;
            subContext.stockNameArr = null;
            delete subContext.stockNameArr;

            delete subContext.i;
            delete subContext.n;
            delete subContext.primaryChartDataItem;
            delete subContext.currentObj;
            delete subContext.mainTicker;
            delete subContext.dateValue;
            delete subContext.valueObject;
            delete subContext.dateArr;
            delete subContext.currentList;
            delete subContext.peerDataItem;
            delete subContext.value;
            delete subContext.volumeArr;
            delete subContext.datasets;
            delete subContext.seriesSet;
            delete subContext.firstChartTitle;
            delete subContext.datasetArr;
            delete subContext.volumeSetArr;

            return subContext.ouput;
        }

/*
        //function convServiceResptoChartFormat(data) {
        //    var subContext = new Object();
        //    subContext.xdataArr = [];
        //    subContext.datasetArr = [];
        //    subContext.results = data;
        //    if (subContext.results && subContext.results.stockChartPrimaryData && subContext.results.stockChartPrimaryData.length > 0) {
        //        subContext.firstDatasetArr = [];
        //        subContext.secondDatasetArr = [];
        //        subContext.firstchartSerArr = [];
        //        subContext.seriesByVolumes = {};
        //        subContext.seriesByTickers = {};
        //        subContext.secondchartSerArr = [];
        //        subContext.primarTickerName = '';
        //        subContext.firstChartTitle = 'Price';
        //        if (subContext.results && subContext.results.stockChartPrimaryData && subContext.results.stockChartPrimaryData.length > 0)
        //            subContext.primarTickerName = subContext.results.stockChartPrimaryData[0].ticker;
        //        subContext.peerData = null;
        //        subContext.lengthDiff = false;

        //        if (subContext.results.stockChartPeerData && subContext.results.stockChartPeerData.length) {
        //            subContext.peerData = subContext.results.stockChartPeerData;
        //            if (subContext.results.stockChartPeerData.length > 0) {
        //                subContext.lengthDiff = true;
        //            }
        //        }

        //        if (subContext.peerData) {
        //            subContext.firstChartTitle = 'Percent Change';
        //        }

        //        for (subContext.i = 0; subContext.i < subContext.results.stockChartPrimaryData.length; subContext.i++) {

        //            subContext.stock = subContext.results.stockChartPrimaryData[subContext.i];
        //            subContext.applyDividend = false;
        //            subContext.applyEarning = false;
        //            subContext.applySplit = false;
        //            //if(i%90 == 0)
        //            subContext.xdataArr[subContext.xdataArr.length] = subContext.stock.dataDate.substring(0, 10);

        //            subContext.firstDatasetArr[subContext.firstDatasetArr.length] = parseFloat((subContext.peerData && subContext.lengthDiff) ? subContext.stock.percentChange : subContext.stock.priceClose);
        //            subContext.secondDatasetArr[subContext.secondDatasetArr.length] = parseFloat(subContext.stock.volume);

        //            if (!subContext.seriesByTickers[subContext.stock.ticker]) {
        //                subContext.seriesByTickers[subContext.stock.ticker] = [];
        //            }

        //            if (subContext.results.dividends) {
        //                for (subContext.dividendCntr = 0; subContext.dividendCntr < subContext.results.dividends.length; subContext.dividendCntr++) {
        //                    if (subContext.stock.dataDate == subContext.results.dividends[subContext.dividendCntr].dataDate) {
        //                        subContext.applyDividend = true;
        //                    }
        //                }
        //            }

        //            if (subContext.results.earnings) {
        //                for (subContext.earningCntr = 0; subContext.earningCntr < subContext.results.earnings.length; subContext.earningCntr++) {
        //                    if (subContext.stock.dataDate == subContext.results.earnings[subContext.earningCntr].dataDate) {
        //                        subContext.applyEarning = true;
        //                    }
        //                }
        //            }

        //            if (subContext.results.splits) {
        //                for (subContext.splitsCntr = 0; subContext.splitsCntr < subContext.results.splits.length; subContext.splitsCntr++) {
        //                    if (subContext.stock.dataDate == subContext.results.splits[subContext.splitsCntr].dataDate) {
        //                        subContext.applySplit = true;
        //                    }
        //                }
        //            }
        //            if (subContext.applyDividend) {
        //                subContext.seriesByTickers[subContext.stock.ticker].push({
        //                    'y': parseFloat((subContext.peerData && subContext.lengthDiff) ? subContext.stock.percentChange : subContext.stock.priceClose),
        //                    'marker': {
        //                        'enabled': true,
        //                        'symbol': 'url(data:image/jpeg;base64,' + dividendImageData + ')'
        //                    }
        //                });
        //            }
        //            else if (subContext.applyEarning) {
        //                subContext.seriesByTickers[subContext.stock.ticker].push({
        //                    'y': parseFloat((subContext.peerData && subContext.lengthDiff) ? subContext.stock.percentChange : subContext.stock.priceClose),
        //                    'marker': {
        //                        'enabled': true,
        //                        'symbol': 'url(data:image/jpeg;base64,' + earningsImageData + ')'
        //                    }
        //                });
        //            }
        //            else if (subContext.applySplit) {
        //                subContext.seriesByTickers[subContext.stock.ticker].push({
        //                    'y': parseFloat((subContext.peerData && subContext.lengthDiff) ? subContext.stock.percentChange : subContext.stock.priceClose),
        //                    'marker': {
        //                        'enabled': true,
        //                        'symbol': 'url(data:image/jpeg;base64,' + splitImageData + ')'
        //                    }
        //                });
        //            }
        //            else {
        //                subContext.seriesByTickers[subContext.stock.ticker].push(parseFloat((subContext.peerData && subContext.lengthDiff) ? subContext.stock.percentChange : subContext.stock.priceClose));
        //            }

        //            if (!subContext.seriesByVolumes[subContext.stock.ticker]) {
        //                subContext.seriesByVolumes[subContext.stock.ticker] = [];
        //            }
        //            subContext.seriesByVolumes[subContext.stock.ticker].push(parseFloat(subContext.stock.volume));
        //        }

        //        if (subContext.peerData) {

        //            for (subContext.i = 0; subContext.i < subContext.results.stockChartPeerData.length; subContext.i++) {

        //                subContext.stock = subContext.results.stockChartPeerData[subContext.i];
        //                if (subContext.stock.ticker !== subContext.primarTickerName) {
        //                    subContext.xdataArr[subContext.xdataArr.length] = subContext.stock.dataDate;
        //                    subContext.firstDatasetArr[subContext.firstDatasetArr.length] = parseFloat(subContext.stock.percentChange);
        //                    // secondDatasetArr[secondDatasetArr.length] = parseFloat(stock.volume);

        //                    if (!subContext.seriesByTickers[subContext.stock.ticker]) {
        //                        subContext.seriesByTickers[subContext.stock.ticker] = [];
        //                    }
        //                    subContext.seriesByTickers[subContext.stock.ticker].push(parseFloat(subContext.stock.percentChange));

        //                    if (!subContext.seriesByVolumes[subContext.stock.ticker]) {
        //                        subContext.seriesByVolumes[subContext.stock.ticker] = [];
        //                    }
        //                    subContext.seriesByVolumes[subContext.stock.ticker].push(parseFloat(subContext.stock.volume));
        //                }
        //            }
        //        }

        //        // var stockName = results.stockChartPeerData[0].ticker;
        //        subContext.seriesSet = [];
        //        subContext.dataSet = [];
        //        for (subContext.key in subContext.seriesByTickers) {
        //            if (subContext.seriesByTickers.hasOwnProperty(subContext.key)) {
        //                subContext.seriesSet.push({
        //                    data: subContext.seriesByTickers[subContext.key],
        //                    name: subContext.key
        //                });
        //                subContext.dataSet.push(data);
        //            }
        //        }
        //        subContext.volumeSet = [];
        //        for (subContext.key in subContext.seriesByVolumes) {
        //            if (subContext.seriesByVolumes.hasOwnProperty(subContext.key)) {
        //                subContext.volumeSet.push({
        //                    data: subContext.seriesByVolumes[subContext.key]
        //                });
        //                subContext.dataSet.push(data);
        //            }
        //        }
        //        //console.log('seriesSet----->',seriesSet);
        //        // firstchartSerArr[firstchartSerArr.length] = {"name":stockName, "data": firstDatasetArr};
        //        //console.log('peerData: ' + peerData);

        //        subContext.datasetArr[subContext.datasetArr.length] = {
        //            "name": "",
        //            "yaxisTitle": subContext.firstChartTitle,
        //            "xaxisTitle": "",
        //            "series": subContext.seriesSet,
        //            "data": subContext.dataSet,
        //            "type": "spline",
        //            "valueDecimals": 1,
        //            "showlegend": true,
        //            "showxaxisLabel": false,
        //            "showtooltip": true,
        //            "spacingTop": 30,
        //            "xAxis": {
        //                labels: {
        //                    step: 3
        //                }
        //            }
        //        };
        //        subContext.secondchartSerArr[subContext.secondchartSerArr.length] = {
        //            "data": subContext.secondDatasetArr
        //            //,"pointStart": Date.UTC(xdataArr[0].split('-')[0], xdataArr[0].split('-')[1]-1, xdataArr[0].split('-')[2])
        //            //,"pointStart": Date(xdataArr[0])
        //            //,"pointInterval": 24 * 3600 * 1000
        //        };
        //        subContext.datasetArr[subContext.datasetArr.length] = {
        //            "name": "",
        //            "yaxisTitle": "Volume (Millions)",
        //            "xaxisTitle": "",
        //            "series": subContext.secondchartSerArr,
        //            "data": subContext.secondDatasetArr,
        //            "type": "column",
        //            "valueDecimals": 0,
        //            "showlegend": false,
        //            "showxaxisLabel": true,
        //            "showtooltip": false,
        //            "spacingTop": 7
        //        };
        //    } else {
        //        subContext.datasetArr[subContext.datasetArr.length] = {
        //            "name": "",
        //            "yaxisTitle": "",
        //            "xaxisTitle": "",
        //            "series": [{
        //                "data": [],
        //                "name": " "
        //            }],
        //            "data": [],
        //            "type": "spline",
        //            "showlegend": false,
        //            "showxaxisLabel": false,
        //            "showtooltip": false,
        //            "spacingTop": 30,
        //            "xAxis": {
        //                labels: {
        //                    step: 3
        //                }
        //            },
        //            "valueDecimals": 1
        //        };
        //    }
        //    subContext.ouput = {
        //        "xData": subContext.xdataArr,
        //        "datasets": subContext.datasetArr
        //    };
        //    //console.log(subContext.ouput);
        //    return subContext.ouput;

        //}
*/

        //context.chartSettings[i].output.url
        function getAllChartSettings(context, callback) {
            if (context.errorMessages.length > 0) {
                callback(null, context);
            } else {
                var subContext = new Object();
                subContext.methodName = '';
                if (!u.isUndefined(context.service) && !u.isNull(context.service)) {
                    subContext.methodName = context.service.methods.getAllChartSettings;
                }
                subContext.url = config.restcall.url + '/' + context.service.name + '/' + subContext.methodName + '?project_id=' + context.project_id + '&ssnid=' + context.ssnid;
                console.log(subContext.url);
                client.get(subContext.url,
                    function (data, response) {
                        subContext.chartSettings = null;
                        try {
                            subContext.chartSettings = getAllChartSettingsResponse(data, context);
                            context.chartSettings = subContext.chartSettings;
                        }
                        catch (exception) {
                            console.log('[getAllChartSettings]Error\n' + exception);
                            context.errorMessages.push(exception.message);
                        }
                        callback(null, context);
                    }
                ).on('error',
                    function (err) {
                        console.log('[getAllChartSettings]Error\n' + err);
                        subContext.message = 'Error connecting to ' + subContext.methodName + '. url:' + subContext.url;
                        context.errorMessages.push(subContext.message);
                        callback(null, context);
                    }
                );
            }
        }

        function getAllChartSettingsResponse(data, context) {
            var subContext = new Object();
            if (data && data.chartSettings) {
                subContext.chartSettings = data.chartSettings;
            } else {
                subContext.chartSettings = [];
            }
            subContext.n = subContext.chartSettings.length;
            for (subContext.i = 0; subContext.i < subContext.n; subContext.i++) {
                subContext.chartSetting = subContext.chartSettings[subContext.i];
                subContext.chartSetting.output = {};
                if (subContext.chartSetting.period) {
                    subContext.period = subContext.chartSetting.period.toUpperCase();
                } else {
                    subContext.period = '';
                }

                if (isDate(subContext.chartSetting.date_start)) {
                    subContext.from = new Date(subContext.chartSetting.date_start);
                }
                if (isDate(subContext.chartSetting.date_end)) {
                    subContext.to = new Date(subContext.chartSetting.date_end);
                }
                if (subContext.period === 'CUSTOM') {
                    if (subContext.from) {
                        subContext.start_date = subContext.from.getFullYear() + '-' + (subContext.from.getMonth() + 1) + '-' + subContext.from.getDate();
                    }
                    if (subContext.to) {
                        subContext.end_date = subContext.to.getFullYear() + '-' + (subContext.to.getMonth() + 1) + '-' + subContext.to.getDate();
                    };
                }

                if (subContext.chartSetting.peers) {
                    subContext.chartDataPeers = encodeURIComponent(subContext.chartSetting.peers);
                } else {
                    subContext.chartDataPeers = '';
                }

                subContext.chartSetting.output.url = config.restcall.url + '/' + context.service.name + '/' + context.service.methods.getStockData
                    + '?company_id=' + subContext.chartSetting.company_id
                    + '&peers=' + subContext.chartDataPeers
                    + '&period=' + subContext.period
                    + '&ssnid=' + context.ssnid
                    + '&splits=' + subContext.chartSetting.splits
                    + '&dividends=' + subContext.chartSetting.dividends
                    + '&earnings=' + subContext.chartSetting.earnings
                    + '&date_start=' + subContext.start_date
                    + '&date_end=' + subContext.end_date;
            }
            return subContext.chartSettings;
        }

        function processInteractiveStockCharts(context, callback) {

            function startup_ISC(callback) {
                callback(null, context);
            }

            async.waterfall([startup_ISC, getAllChartSettings, setupGetChartDataPoints],
                function (err, input) {
                    console.log(context.chartSettings);
                    callback(null, context);
                }
            );

        }

        //context.savedTable
        //context.chartObjectArr
        function getAllSavedTableList(context, callback) {
            if (context.errorMessages.length > 0) {
                callback(null, context);
            } else {
                var subContext = new Object();
                subContext.methodName = '';
                if (!u.isUndefined(context.service) && !u.isNull(context.service)) {
                    subContext.methodName = context.service.methods.getAllSavedSigDevItems;
                }

                subContext.args = 'project_id=' + context.project_id + '&ssnid=' + context.ssnid;
                subContext.url = config.restcall.url + '/' + context.service.name + '/' + subContext.methodName + '?' + subContext.args;
                console.log(subContext.methodName + ' API call---->', subContext.url);
                client.get(subContext.url,
                    function (data, response) {
                        try {
                            context.savedTable = data.items;
                        } catch (exception) {
                            console.log('[getAllSavedTableList]Error\n' + exception);
                            context.errorMessages.push(exception.message);
                        }
                        callback(null, context);
                    }
                ).on('error',
                    function (err) {
                        console.log('[getAllSavedTableList]Error\n' + err);
                        subContext.message = 'Error connecting to ' + subContext.methodName + '. url:' + subContext.url;
                        context.errorMessages.push(subContext.message);
                        callback(null, context);
                    }
                );
            }
        }

        //get saved table and add description if expanded
        function getSavedTable(context, callback) {
            if (context.errorMessages.length > 0) {
                callback(null, context);
            } else {
                if(context.savedTable && context.savedTable.length > 0) {
                    async.map(context.savedTable, function(item, callback){
                        processSavedItems(item, context, callback);
                    }, function(err, results){                        
                        callback(null, context);
                    });
                } else {
                    callback(null, context);
                }
            }
        }

        function processSavedItems(context, mainContext, callback) {
            if(context.savedSigDevItemList && context.savedSigDevItemList.length > 0) {
                async.map(context.savedSigDevItemList, function(item, callback){
                        processSavedList(item, mainContext, context.info, callback);
                    }, function(err, results){
                        callback(null, context);
                    }
                );
            } else {
                callback(null, context);
            }
            
        }
        
        function processSavedList(context, mainContext, tableInfo, callback) {
            if(context.savedSigDevItems && context.savedSigDevItems.length > 0) {
                async.map(context.savedSigDevItems, 
                    function(item, callback){
                        getExpandedDescription(item, mainContext, callback);
                    }, function(err, results){
                        u.each(results, 
                            function(item){
                                mainContext.chartObjectArr.push({
                                    infile: JSON.stringify(item),
                                    callback: '',
                                    constr: '',
                                    outfile: tableInfo.stepId + '.' + tableInfo.mnemonic + '.' + tableInfo.itemId + '.' + 'chart_id_placeholder' + '.part2.html',
                                    page: 'STOCK_TABLE',
                                    stepId: tableInfo.stepId,
                                    seqNo: item.seqNo
                                });
                            }
                        );
                        callback(null, context);
                    }
                );
            } else {
                callback(null, context);
            }
        }
        
        //add description for every row of mscad and sigdev
        function getExpandedDescription(context, mainContext, callback) {
            
            var subContext = new Object();

            subContext.functionList = new Array();
            subContext.functionList.push(getMscadList.bind(null, context.mascad, mainContext));
            subContext.functionList.push(getSigDevList.bind(null, context.sigdev, mainContext));
            
            async.parallel(subContext.functionList,
                function (err, input) {
                    callback(null, context);
                }
            );
        }

        function getMscadList(context, mainContext, callback) {
            async.map(context, 
                function(item, callback){
                        getMscadDesc(item, mainContext, callback);
                }, function(err, results){
                    callback(null, context);
                }
            );
        }

        function getMscadDesc(context, mainContext, callback) {
            if (context.tl_status && context.tl_status === 'Y') {
                var subContext = new Object();
                subContext.methodName = '';
                if (!u.isUndefined(mainContext.service) && !u.isNull(mainContext.service)) {
                    subContext.methodName = mainContext.service.methods.getMascadLargeLosseDetail;
                }

                subContext.args = 'mascad_id=' + context.mascadId + '&ssnid=' + mainContext.ssnid;
                subContext.url = config.restcall.url + '/charts/' + subContext.methodName + '?' + subContext.args;
                client.get(subContext.url,
                    function (data, response) {
                        try {
                            if(data.detail){
                                context.description = data.detail;
                            } else {
                                context.description = "No Data Available";
                            }                        
                        } catch (exception) {
                            console.log('[getSigDevDesc]Error\n' + exception);
                            context.errorMessages.push(exception.message);
                        }
                        callback(null, context);
                    }
                ).on('error',
                    function (err) {
                        console.log('[getSigDevDesc]Error\n' + err);
                        subContext.message = 'Error connecting to ' + subContext.methodName + '. url:' + subContext.url;
                        context.errorMessages.push(subContext.message);
                        callback(null, context);
                    }
                );
            } else {
                context.description = null;
                callback(null, context);
            }
        }

        function getSigDevList(context, mainContext, callback) {
            async.map(context, 
                function(item, callback){
                        getSigDevDesc(item, mainContext, callback);
                }, function(err, results){
                    callback(null, context);
                }
            );
        }

        function getSigDevDesc(context, mainContext, callback) {
            if (context.tl_status && context.tl_status === 'Y') {
                var subContext = new Object();
                subContext.methodName = '';
                if (!u.isUndefined(mainContext.service) && !u.isNull(mainContext.service)) {
                    subContext.methodName = mainContext.service.methods.getSignificantDevelopmentDetail;
                }

                subContext.args = 'sigdev_id=' + context.sigDevId + '&ssnid=' + mainContext.ssnid;
                subContext.url = config.restcall.url + '/charts/' + subContext.methodName + '?' + subContext.args;
                client.get(subContext.url,
                    function (data, response) {
                        try {
                            if(data.detail){
                                context.description = data.detail;
                            } else {
                                context.description = "No Data Available";
                            }                        
                        } catch (exception) {
                            console.log('[getSigDevDesc]Error\n' + exception);
                            context.errorMessages.push(exception.message);
                        }
                        callback(null, context);
                    }
                ).on('error',
                    function (err) {
                        console.log('[getSigDevDesc]Error\n' + err);
                        subContext.message = 'Error connecting to ' + subContext.methodName + '. url:' + subContext.url;
                        context.errorMessages.push(subContext.message);
                        callback(null, context);
                        }
                    );
            } else {
                context.description = null;
                callback(null, context);
            }
        }

        function processTables(context, callback) {

            function startup_Table(callback) {
                callback(null, context);
            }

            async.waterfall([startup_Table, getAllSavedTableList],
                function (err, input) {
                    console.log(context.savedTable);
                    console.log(context.savedTable[0]);
                    console.log(context.savedTable[0].info);
                    console.log(context.savedTable[0].savedSigDevItemList);
                    console.log(context.savedTable[0].savedSigDevItemList[0].savedSigDevItems);
                    callback(null, context);
                }
            );

        }

        function getPDFRequestId(context, callback) {
            if (context.errorMessages.length > 0) {
                callback(null, context);
            } else {
                var subContext = new Object();
                subContext.service = getServiceDetails('templateManager');
                subContext.methodName = '';
                if (!u.isUndefined(subContext.service) && !u.isNull(subContext.service)) {
                    subContext.methodName = subContext.service.methods.createTemplatePDFRequest;
                }
                subContext.stepArr = new Array();
                try {
                    u.each(context.ifcChartSettings,
                        function (chartSetting, index) {
                            if (u.indexOf(subContext.stepArr, chartSetting.stepId) == -1) {
                                subContext.stepArr.push(chartSetting.stepId);
                            }
                        }
                    );
                    u.each(context.chartSettings,
                        function (chartSetting, index) {
                            if (u.indexOf(subContext.stepArr, chartSetting.step_id) == -1) {
                                subContext.stepArr.push(chartSetting.step_id);
                            }
                        }
                    );
                    u.each(context.savedTable,
                        function (table, index) {
                            if (u.indexOf(subContext.stepArr, table.info.stepId) == -1) {
                                subContext.stepArr.push(table.stepId);
                            }
                        }
                    );
                    subContext.args = 'project_id=' + context.project_id + '&user_id=' + context.user_id + '&step_ids=' + subContext.stepArr.join(',') + '&file_name=' + (context.file_name).split(' ').join('+') +
                        '&company_name=' + (context.company_name).split(' ').join('+') + '&user_name=' + (context.user_name).split(' ').join('+') + '&ssnid=' + context.ssnid;

                    subContext.url = config.restcall.url + '/' + subContext.service.name + '/' + subContext.methodName + '?' + subContext.args;
                } catch (exception) {
                    context.errorMessages.push(exception.message);
                    callback(null, context);
                }

                console.log(subContext.methodName + ' API call---->', subContext.url);
                client.get(subContext.url,
                    function (data, response) {
                        subContext.pdfRequest = null;
                        try {
                            context.requestId = data.request.requestNo;
                            console.log("Created PDF request: " + context.requestId);
                            context.chartPath = createPath(context);
                            addImagePath(context);
                        } catch (exception) {
                            console.log(exception);
                            context.errorMessages.push(exception.message);
                        }
                        callback(null, context);
                    }
                ).on('error',
                    function (err) {
                        console.log(err);
                        subContext.message = 'Error connecting to ' + subContext.methodName + '. url:' + subContext.url;
                        context.errorMessages.push(subContext.message);
                        callback(null, context);
                    }
                );
            }
        }

        function addImagePath(context) {
            var subContext = new Object();
            subContext.n = context.chartObjectArr.length;
            for (subContext.i = 0; subContext.i < subContext.n; subContext.i++) {
                if (context.chartObjectArr[subContext.i].page == 'STOCK_CHART') {
                    context.chartObjectArr[subContext.i].outfile = context.chartPath + context.chartObjectArr[subContext.i].outfile
                } else if (context.chartObjectArr[subContext.i].page == 'STOCK_TABLE') {
                    subContext.filename = getTableFilename(context.chartObjectArr[subContext.i].stepId, context.chartObjectArr[subContext.i].seqNo, context.chartSettings);
                    delete context.chartObjectArr[subContext.i].stepId;
                    delete context.chartObjectArr[subContext.i].seqNo;
                    context.chartObjectArr[subContext.i].outfile = context.chartPath + subContext.filename;
                }
                console.log(context.chartObjectArr[subContext.i].outfile);
            }
        }

        function getTableFilename(stepId, seqNo, chartSettings) {
            var subContext = new Object();

            subContext.mnemonic = '';
            subContext.itemId = '';
            subContext.chartId = '';

            subContext.perStep = u.filter(chartSettings, function (chart) {
                if (chart.step_id === stepId) {
                    return chart;
                }
            });

            subContext.perStep = u.sortBy(subContext.perStep, 'chartId');

            if (subContext.perStep &&
                subContext.perStep[seqNo]) {

                subContext.mnemonic = subContext.perStep[seqNo].mnemonic || '';
                subContext.itemId = subContext.perStep[seqNo].item_id || '';
                subContext.chartId = subContext.perStep[seqNo].chart_id || '';

                return stepId + '.' + subContext.mnemonic + '.' + subContext.itemId + '.' + subContext.chartId + '.part2.html';
            }

            return null;
        }

        function setupGetImages(context, callback) {
            if (context.errorMessages.length > 0) {
                callback(null, context);
            } else {
                var subContext = new Object();
                subContext.n = context.chartObjectArr.length;
                subContext.settings = new Array();
                for (subContext.i = 0; subContext.i < subContext.n; subContext.i++) {
                    subContext.settings.push({
                        context: context,
                        index: subContext.i
                    });
                };
                async.map(subContext.settings, getImage, function (err, results) {
                    u.each(results, function (item) {
                        if (item) {
                            context.errorMessages.push(item);
                        }
                    });
                    callback(null, context);
                });
            }
        }

        function getImage(setting, callback) {
            var subContext = new Object();
            subContext.chartObj = setting.context.chartObjectArr[setting.index];
            subContext.args = {
                headers: {
                    "Content-Type": "application/json"
                },
                data: subContext.chartObj
            };

            console.log("Output File: " + subContext.chartObj.outfile);
            //fs.writeFile(subContext.chartObj.outfile + '.txt', JSON.stringify(subContext.chartObj));
            client.post(setting.context.service.exportOptions.phatomjsURL, subContext.args,
                function (data, response) {
                    console.log("Finished getImage call: " + data);
                    callback(null, null);
                }
            ).on('error',
                function (err) {
                    console.log(err);
                    subContext.message = 'Error connecting to chart to svg service.' + subContext.chartObj + '\n' + err;
                    callback(null, subContext.message);
                }
            );
        }

        function setSVGFileStatus(context, callback) {
            console.log('[setSVGFileStatus]Start \n' + context);
            if (context.errorMessages.length > 0) {
                callback(null, context);
            } else {
                var subContext = new Object();
                subContext.service = getServiceDetails('templateManager');
                subContext.methodName = '';
                if (!u.isUndefined(subContext.service) && !u.isNull(subContext.service)) {
                    subContext.methodName = subContext.service.methods.setSVGFileStatus;
                }

                subContext.args = 'request_id=' + context.requestId + '&svg_files_ready=Y&ssnid=' + context.ssnid;
                subContext.url = config.restcall.url + '/' + subContext.service.name + '/' + subContext.methodName + '?' + subContext.args;
                console.log(subContext.methodName + ' API call---->', subContext.url);
                client.get(subContext.url,
                    function (data, response) {
                        try {
                            context.responseCode = response.statusCode;
                            //reduce the amount of data being sent back to client, we need it for debugging chart problems
                            context.chartSettings = undefined;
                            context.ifcChartSettings = undefined;
                            context.savedTable = undefined;
                            context.chartObjectArr = undefined;
                            console.log(context);
                        } catch (exception) {
                            console.log(exception);
                            context.errorMessages.push('[setSVGFileStatus]' + exception.message);
                        }
                        console.log('[setSVGFileStatus]Request ' + context.requestId + ' OK\n' + context.errorMessages);
                        callback(null, context);
                    }
                ).on('error', function (err) {
                        console.log(err);
                        subContext.message = '[setSVGFileStatus]Error connecting to setSVGFileStatus. url:' + subContext.url;
                        context.errorMessages.push(subContext.message);
                        callback(null, context);
                    }
                );
            }
        }

        function getTemplatePDFStatus(context, next) {
            var subContext = new Object();
            subContext.service = getServiceDetails('templateManager');
            subContext.methodName = '';
            if (!u.isUndefined(subContext.service) && !u.isNull(subContext.service)) {
                subContext.methodName = subContext.service.methods.getTemplatePDFStatus;
            }

            subContext.args = 'request_id=' + context.requestId + '&ssnid=' + context.ssnid;
            subContext.url = config.restcall.url + '/' + subContext.service.name + '/' + subContext.methodName + '?' + subContext.args;
            //console.log(methodName + ' API call---->', url);
            subContext.statusResponse = {};

            client.get(subContext.url, function (data, response) {
                    try {
                        if (data.responseInfo.code === 200) {
                            subContext.statusResponse.error = false;
                            context.PDFStatusCode = data.request.status
                            context.PDFHTTPResponseCode = data.responseInfo.code;
                            context.PDFPercentComplete = data.request.percentComplete;
                            context.elapsedTime = ((new Date()).getTime() - context.startTime) / 1000;
                            if (data.request.status === "C") {
                                console.log('[' + context.requestId + '][' + context.elapsedTime + '][Code:' + context.PDFStatusCode + ']PDF generation complete.');
                                subContext.statusResponse.context = context;
                                console.log('[finished]getTemplatePDFStatus url:' + subContext.url);
                                next(subContext.statusResponse);
                            } else if (context.elapsedTime >= context.service.exportOptions.pdfRequestTimeout) {
                                subContext.statusResponse.error = true;
                                console.log('[else]getTemplatePDFStatus timeout. url:' + subContext.url);
                                next(subContext.statusResponse);
                            } else {
                                console.log('[' + context.requestId + '][' + context.elapsedTime + '][Code:' + context.PDFStatusCode + ']PDF generation ' + context.PDFPercentComplete + '% complete.');
                                context.data.progress = context.PDFPercentComplete;
                                sendStatus(context.ssnid, context.data);
                                setTimeout(function () {
                                    next();
                                }, 1000);
                            }
                        } else {
                            subContext.statusResponse.error = true;
                            console.log('[else]getTemplatePDFStatus return invalid status. url:' + subContext.url);
                            next(subContext.statusResponse);
                        }
                    } catch (exception) {
                        subContext.statusResponse.error = true;
                        console.log('[try/catch]Error connecting to getTemplatePDFStatus. url:' + subContext.url);
                        next(subContext.statusResponse);
                    }
                }
            ).on('error',
                function (err)
                {
                    console.log(err);
                    console.log('[on error]Error connecting to getTemplatePDFStatus. url:' + subContext.url);
                    subContext.statusResponse.error = true;
                    next(subContext.statusResponse);
                }
            );
        }

        function genericParallelSequence(context, callback) {
            if ((context.errorMessages.length > 0) || !context.sequences || !Array.isArray(context.sequences) || (context.sequences.length < 1)) {
                callback(null, context);
            } else {
                var subContext = new Object();
                subContext.i = 0;
                subContext.n = context.sequences.length;
                subContext.sequences = new Array();
                for (subContext.i = 0; subContext.i < subContext.n; subContext.i++) {
                    subContext.sequences.push({
                        context: context,
                        index: subContext.i
                    });
                };
                async.map(subContext.sequences, genericTaskList, function (err, results) {
                    u.each(results, function (item) {
                    });
                    //console.log(context);
                    callback(null, context);
                });
            }
        }

        function genericTaskList(taskContext, callback) {

            var subContext = new Object();
            subContext.taskContext = taskContext;
            function startup(callback) {
                callback(null, subContext.taskContext.context);
            }
            subContext.functionList = new Array();
            subContext.functionList.push(startup);
            subContext.n = taskContext.context.sequences[taskContext.index].length;
            for (subContext.i = 0; subContext.i < subContext.n; subContext.i++) {
                subContext.functionList.push(taskContext.context.sequences[taskContext.index][subContext.i]);
            }
            async.waterfall(subContext.functionList,
                function (err, input) {
                    callback(null, subContext.taskContext.context);
                }
            );
        }

        function sendStatus(token, data) {
            if (token in config.userSocketInfo) {
                //The value config.userSocketInfo[token] is null if user logs out from method disConnectionSocket in server/routes/socket/socket.js
                //Check if the token is still valid before sending status message
                if (config.userSocketInfo[token]) {
                config.userSocketInfo[token].emit('pdf-download-status', data);
                }
            }
        }

        function createTemplatePDFRequest(req, res, next) {

            var context = new Object();
            context.service = getServiceDetails('charts');
            context.ssnid = req.headers['x-session-token'];
            context.project_id = req.body.project_id;
            context.user_id = req.body.user_id;
            context.file_name = encodeURIComponent((req.body.file_name).trim());
            context.company_name = encodeURIComponent(req.body.company_name.trim());
            context.user_name = encodeURIComponent((req.body.user_name).trim());
            context.errorMessages = new Array();
            context.chartObjectArr = new Array();

            context.sequences = [
                [getFinancialChartRatioTypes, getAllSavedIFChartSettings, setupGetIFCChartDataPoints],
                [getAllChartSettings, setupGetChartDataPoints],
                [getAllSavedTableList, getSavedTable]
            ];

            function startup(callback) {
                callback(null, context);
            }

            async.waterfall([startup, genericParallelSequence
            //async.waterfall([startup, processInteractiveFinancialCharts, processInteractiveStockCharts, processTables
                , getPDFRequestId, setupGetImages, setSVGFileStatus],
                function (err, input) {
                    if (context.errorMessages.length > 0) {
                        console.log('Error occured in PDF Download request.');
                        console.log(context.errorMessages);
                        console.log('Returning error results back to caller.');
                        res.send(context);
                    } else {
                        console.log('setSVGFileStatus returned status: ' + context.responseCode);
                        if (context.responseCode == 200) {
                            context.room = 'pdf_' + context.requestId;
                            context.startTime = (new Date()).getTime();
                            context.data = {
                                projectId: context.project_id,
                                projectName: context.file_name,
                                requestId: context.requestId,
                                progress: 0
                            };
                            async.forever(
                                function (next) {
                                    getTemplatePDFStatus(context, next);
                                },
                                function (asyncResult) {
                                    if (asyncResult.error) {
                                        logger.error('---->Request ' + context.requestId + ' is incomplete.');
                                        //indicate an error during status check
                                        context.PDFPercentComplete = -1;
                                    } else {
                                        logger.info('---->Request ' + context.requestId + ' is complete.');
                                    }
                                    context.data.progress = context.PDFPercentComplete;
                                    logger.info('Sending socket message for request:' + context.data.requestId);
                                    sendStatus(context.ssnid, context.data);
                                }
                            );

                            //No errors, sent response back to call to add entry to notification center
                            res.send(context);
                        } else {
                            context.errorMessages.push('setSVGFileStatus returned status: ' + context.responseCode);
                            logger.error('Returning error setSVGStatus response code [' + context.responseCode + '] back to caller.');
                            res.send(context);
                        }
                    }
                }
            );
        }

        function downloadTemplatePDF(req, res, next) {
            var context = new Object();
            context.service = getServiceDetails('templateManager');
            context.methodName = '';
            context.ssnid = req.headers['x-session-token'];
            context.request_id = req.body.request_id;
            context.file_name = encodeURIComponent((req.body.file_name).trim());

            if (!u.isUndefined(context.service) && !u.isNull(context.service)) {
                context.methodName = context.service.methods.downloadTemplatePDF;
            }

            context.url = config.restcall.url + '/' + context.service.name + '/' + context.methodName + '?request_id=' + context.request_id + '&fileName=' + context.file_name + '&ssnid=' + context.ssnid;
            logger.info(context.url);
            client.get(context.url, { responseType: 'arraybuffer' }, function (data, response) {
                if (data) {
                    res.writeHead(200,
                        {
                            'Content-Type': 'application/pdf',
                            'Content-Disposition': 'attachment; filename=' + context.file_name,
                            'Content-Transfer-Encoding': 'BINARY',
                            'Content-Length': data.length
                        }
                    );
                    res.write(data);
                    res.end();
                }
            });
        }

    }

})(module.exports);