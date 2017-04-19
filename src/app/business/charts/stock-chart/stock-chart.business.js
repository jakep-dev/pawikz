/**
 * Created by sherindharmarajan on 1/4/16.
 */
(function() {
    'use strict';

    angular
        .module('app.chart.stockchart.business', [])
        .service('stockChartBusiness', stockChartBusiness);

    /* @ngInject */
    function stockChartBusiness(commonBusiness) {

        var sigDevSourcesMap = null;
        var indices = [];
        var indicesMap = null;
        var competitors = [];
        var competitorMap = null;
        var updateChartIdCallback = null;

        //Absolute minimum date for which we have data for charts
        var minimumChartDate = new Date(1996, 0, 1, 0, 0, 0, 0);

        function toDateString(dateObj, format) {
            if (angular.isDate(dateObj)) {
                if (!format) {
                    format = 'MM/DD/YYYY';
                }
                var m = moment(dateObj.toISOString().substring(0, 10), 'YYYY-MM-DD');
                return m.format(format);
            } else {
                return '';
            }
        }

        var business = {
            sigDevSources: [],
            getSignificantDevelopmentSourceLabel: getSignificantDevelopmentSourceLabel,
            getSaveChartInputObject: getSaveChartInputObject,
            getSaveStockChartInputObject: getSaveStockChartInputObject,
            getSaveSigDevInputObject: getSaveSigDevInputObject,
            getSaveStockSigDevInputObject: getSaveStockSigDevInputObject
        }

        Object.defineProperty(business, 'minimumChartDate', {
            enumerable: true,
            configurable: false,
            get: function () {
                return minimumChartDate;
            }
        });

        Object.defineProperty(business, 'significantDevelopmentSources', {
            enumerable: true,
            configurable: false,
            get: function () {
                return business.sigDevSources;
            },
            set: function (value) {
                business.sigDevSources = value;
                sigDevSourcesMap = [];
                business.sigDevSources.forEach(function (item) {
                    if (item.value) {
                        if (!sigDevSourcesMap[item.value]) {
                            sigDevSourcesMap[item.value] = item.label;
                        }
                    }
                });
            }
        });

        Object.defineProperty(business, 'indices', {
            enumerable: true,
            configurable: false,
            get: function () {
                return indices;
            },
            set: function (value) {
                indices = value;
                indicesMap = [];
                indices.forEach(function (indicesItem) {
                    if (indicesItem.value) {
                        if (!indicesMap[indicesItem.value]) {
                            indicesMap[indicesItem.value] = indicesItem.description;
                        }
                    }
                });
            }
        });

        Object.defineProperty(business, 'competitors', {
            enumerable: true,
            configurable: false,
            get: function () {
                return competitors;
            },
            set: function (value) {
                competitors = value;
                competitorMap = [];
                competitors.forEach(function (competitorItem) {
                    if (competitorItem.ticker) {
                        if (!competitorMap[competitorItem.ticker]) {
                            competitorMap[competitorItem.ticker] = competitorItem.companyName;
                        }
                    }
                });
            }
        });

        Object.defineProperty(business, 'updateChartIdCallback', {
            enumerable: true,
            configurable: false,
            get: function () {
                return updateChartIdCallback;
            },
            set: function (value) {
                updateChartIdCallback = value;
            }
        });

        function getSignificantDevelopmentSourceLabel(significantDevelopmentSourceValue) {
            if (sigDevSourcesMap) {
                return sigDevSourcesMap[significantDevelopmentSourceValue];
            } else {
                return null;
            }
        }

        function getSaveStockChartInputObject(projectId, stepId, companyId, mnemonicId, itemId, value) {
            /** INPUT
            {
                projectId: projectId,
                stepId: stepId,
                companyId: companyId,
                mnemonicId: mnemonicId,
                itemId: itemId,
                value: { 
                    newCharts: jsCharts,
                    oldCharts: oldCharts
                }
            }
            */
            /** OUTPUT
                data: {
                    //Changing keynames as per jake plaras email on 26/5/2016
                    company_id: companyId,
                    step_id: stepId,
                    project_id: projectId,
                    //ssnid: ssnid,
                    chartSettings: chartSettings
                }
            */
            var saveObject = new Object;
            //Changing keynames as per jake plaras email on 26/5/2016
            saveObject.company_id = companyId;
            saveObject.step_id = stepId;
            saveObject.project_id = projectId;
            saveObject.chartSettings = new Array();

            if (value.newCharts != null) {
                value.newCharts.forEach(function (chart) {
                    var stockString = '';
                    var jsChart = chart.filterState;
                    var tearsheet = chart.tearsheet;
                    // if (!tearsheet.isMainChart) {
                    if (jsChart.selectedPeers) {
                        jsChart.selectedPeers.forEach(function (stock) {
                            stockString = stockString + stock + ',';
                        });
                    }
                    if (jsChart.selectedIndices) {
                        jsChart.selectedIndices.forEach(function (indics) {
                            stockString = stockString + '^' + indics + ',';
                        });
                    }
                    if (jsChart.selectedCompetitors) {
                        jsChart.selectedCompetitors.forEach(function (competitors) {
                            stockString = stockString + '@' + competitors + ',';
                        });
                    }
                    if (stockString && stockString !== '') {
                        stockString = stockString.slice(0, -1);
                    }

                    jsChart.chartType = chart.chartType;
                    var obj = {
                        chart_title: jsChart.title ? jsChart.title : null,
                        peers: stockString,
                        period: jsChart.interval ? jsChart.interval : null,
                        date_start: toDateString(jsChart.startDate, 'YYYY-MM-DD'),
                        date_end: toDateString(jsChart.endDate, 'YYYY-MM-DD'),
                        dividends: jsChart.dividends ? "Y" : "N",
                        earnings: jsChart.earnings ? "Y" : "N",
                        splits: jsChart.splits ? "Y" : "N",
                        chartType: jsChart.chartType ? jsChart.chartType : 'JSCHART',
                        mnemonic: jsChart.mnemonic,
                        item_id: jsChart.item_id,
                        isDefault: jsChart.isDefault
                    };
                    saveObject.chartSettings.push(obj);
                });
            }

            if (value.oldCharts != null) {
                value.oldCharts.forEach(function (chart) {
                    var obj = {
                        chart_title: chart.title ? chart.title : null,
                        peers: chart.stockString ? chart.stockString : null,
                        period: chart.interval ? chart.interval : null,
                        date_start: chart.date_start ? chart.date_start : "",
                        date_end: chart.date_end ? chart.date_end : "",
                        chartType: chart.chartType,
                        dividends: chart.dividends ? "Y" : "N",
                        earnings: chart.earnings ? "Y" : "N",
                        splits: chart.splits ? "Y" : "N",
                        project_image_code: chart.tearsheet.project_image_code,
                        url: chart.tearsheet.url
                    };
                    saveObject.chartSettings.push(obj);
                });
            }
            return saveObject;
        }

        function getSaveChartInputObject(mnemonicItem) {
            /** INPUT
            {
                companyId: companyId,
                projectId: projectId,
                stepId: stepId,
                mnemonicId: mnemonicId,
                itemId: itemId,
                value: { 
                    newCharts: jsCharts,
                    oldCharts: oldCharts
                }
            }
            */
            /** OUTPUT
                data: {
                    //Changing keynames as per jake plaras email on 26/5/2016
                    company_id: companyId,
                    step_id: stepId,
                    project_id: projectId,
                    //ssnid: ssnid,
                    chartSettings: chartSettings
                }
            */
            var saveObject = new Object;
            //Changing keynames as per jake plaras email on 26/5/2016
            saveObject.company_id = mnemonicItem.companyId;
            saveObject.step_id = mnemonicItem.stepId;
            saveObject.project_id = mnemonicItem.projectId;
            saveObject.chartSettings = new Array();

            if (mnemonicItem.value.newCharts != null) {
                mnemonicItem.value.newCharts.forEach(function (chart) {
                    var stockString = '';
                    var jsChart = chart.filterState;
                    var tearsheet = chart.tearsheet;
                    // if (!tearsheet.isMainChart) {
                    if (jsChart.selectedPeers) {
                        jsChart.selectedPeers.forEach(function (stock) {
                            stockString = stockString + stock + ',';
                        });
                    }
                    if (jsChart.selectedIndices) {
                        jsChart.selectedIndices.forEach(function (indics) {
                            stockString = stockString + '^' + indics + ',';
                        });
                    }
                    if (jsChart.selectedCompetitors) {
                        jsChart.selectedCompetitors.forEach(function (competitors) {
                            stockString = stockString + '@' + competitors + ',';
                        });
                    }
                    if (stockString && stockString !== '') {
                        stockString = stockString.slice(0, -1);
                    }

                    jsChart.chartType = chart.chartType;
                    var obj = {
                        chart_title: jsChart.title ? jsChart.title : null,
                        peers: stockString,
                        period: jsChart.interval ? jsChart.interval : null,
                        date_start: toDateString(jsChart.startDate, 'YYYY-MM-DD'),
                        date_end: toDateString(jsChart.endDate, 'YYYY-MM-DD'),
                        dividends: jsChart.dividends ? "Y" : "N",
                        earnings: jsChart.earnings ? "Y" : "N",
                        splits: jsChart.splits ? "Y" : "N",
                        chartType: jsChart.chartType ? jsChart.chartType : 'JSCHART',
                        mnemonic: jsChart.mnemonic,
                        item_id: jsChart.item_id,
                        isDefault: jsChart.isDefault
                    };
                    saveObject.chartSettings.push(obj);
                });
            }

            if (mnemonicItem.value.oldCharts != null) {
                mnemonicItem.value.oldCharts.forEach(function (chart) {
                    var obj = {
                        chart_title: chart.title ? chart.title : null,
                        peers: chart.stockString ? chart.stockString : null,
                        period: chart.interval ? chart.interval : null,
                        date_start: chart.date_start ? chart.date_start : "",
                        date_end: chart.date_end ? chart.date_end : "",
                        chartType: chart.chartType,
                        dividends: chart.dividends ? "Y" : "N",
                        earnings: chart.earnings ? "Y" : "N",
                        splits: chart.splits ? "Y" : "N",
                        project_image_code: chart.tearsheet.project_image_code,
                        url: chart.tearsheet.url
                    };
                    saveObject.chartSettings.push(obj);
                });
            }
            return saveObject;
        }

        function getSaveStockSigDevInputObject(projectId, stepId, companyId, mnemonicId, itemId, value) {
            var saveObject = new Object;
            saveObject.project_id = projectId;
            saveObject.step_id = stepId;
            saveObject.mnemonic = mnemonicId;
            saveObject.item_id = itemId;
            saveObject.items = new Array();

            if (value != null) {
                value.forEach(function (chart) {
                    var jsChart = chart.filterState;
                    if (jsChart.isDefault === 'N') {
                        var perChart = {
                            sigdevIdItems: [],
                            mascadItems: []
                        };
                        angular.forEach(chart.tableInfo, function (table) {

                            switch (table.source.value) {
                                case 'SIGDEV':
                                    if (table.rows && table.rows.length > 0) {
                                        perChart.sigdevIdItems = _.map(table.rows, function (row) {
                                            return {
                                                sigdevId: row.sigDevId,
                                                tl_status: row.tl_status || 'N'
                                            };
                                        });
                                    }
                                    break;
                                case 'MASCAD':
                                    if (table.rows && table.rows.length > 0) {
                                        perChart.mascadItems = _.map(table.rows, function (row) {
                                            return {
                                                mascadId: row.mascadId,
                                                tl_status: row.tl_status || 'N'
                                            };
                                        });
                                    }
                                    break;
                            }

                        });

                        //As per WS team, add null if empty
                        if (perChart.sigdevIdItems.length === 0) {
                            perChart.sigdevIdItems.push(null);
                        }
                        if (perChart.mascadItems.length === 0) {
                            perChart.mascadItems.push(null);
                        }

                        saveObject.items.push(perChart);
                    }
                });
            }
            return saveObject;
        }

        function getSaveSigDevInputObject(mnemonicItem) {
            /** INPUT
            {
                companyId: companyId,
                projectId: projectId,
                stepId: stepId,
                mnemonicId: mnemonicId,
                itemId: itemId,
                value: jsCharts
            }
            */
            /** OUTPUT
                data: {
                    project_id: projectId,
                    step_id: stepId,
                    mnemonic: mnemonic,
                    item_id: itemId,
                    items: sigDevItems
                }
            */
            var saveObject = new Object;
            saveObject.project_id = mnemonicItem.projectId;
            saveObject.step_id = mnemonicItem.stepId;
            saveObject.mnemonic = mnemonicItem.mnemonicId;
            saveObject.item_id = mnemonicItem.itemId;
            saveObject.items = new Array();

            if (mnemonicItem.value != null) {
                mnemonicItem.value.forEach(function (chart) {
                    var jsChart = chart.filterState;
                    if (jsChart.isDefault === 'N') {
                        var perChart = {
                            sigdevId: [],
                            mascadId: [],
                        };
                        angular.forEach(chart.tableInfo, function (table) {

                            switch (table.source.value) {
                                case 'SIGDEV':
                                    if (table.rows && table.rows.length > 0) {
                                        perChart.sigdevId = _.map(table.rows, function (row) {
                                            return row.sigDevId;
                                        });
                                    }
                                    break;
                                case 'MASCAD':
                                    if (table.rows && table.rows.length > 0) {
                                        perChart.mascadId = _.map(table.rows, function (row) {
                                            return row.mascadId;
                                        });
                                    }
                                    break;
                            }

                        });

                        //As per WS team, add null if empty
                        if (perChart.sigdevId.length === 0) {
                            perChart.sigdevId.push(null);
                        }
                        if (perChart.mascadId.length === 0) {
                            perChart.mascadId.push(null);
                        }

                        saveObject.items.push(perChart);
                    }
                });
            }
            return saveObject;
        }

        return business;
    }

})();
