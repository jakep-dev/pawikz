(function () {
    'use strict';

    angular.module('app.core')
           .controller('msChartController', msChartController)
           .directive('msChart', msChartDirective);

    /** @ngInject */
    function msChartController($scope) {
        var vm = this;
    }

    /** @ngInject */
    function msChartDirective($rootScope, $compile, $q, stockService, commonBusiness, templateBusiness, templateBusinessFormat, templateBusinessSave, overviewBusiness, stockChartBusiness, financialChartBusiness, financialChartService, toast, $interval, clientConfig, store) {
        return {
            restrict: 'E',
            scope : {
                type: '@',
                mnemonicid: '@',
                itemid: '@'
            },
            templateUrl: 'app/core/directives/ms-chart/ms-chart.html',
            controller : 'msChartController',
            link: {
                pre: function(scope, el) {
                    var html = '';
                    var newScope = null;
                    toast.simpleToast("Auto Save Enabled");

                    function getDefaultTicker() {
                        var ticker;
                        if (overviewBusiness.templateOverview && overviewBusiness.templateOverview.ticker) {
                            ticker = overviewBusiness.templateOverview.ticker;
                        } else {
                            ticker = commonBusiness.companyName;
                        }
                        return ticker;
                    }

                    switch (angular.lowercase(scope.type)) {
                        case 'stock':

                            function getStockChartTitle() {
                                var ticker = getDefaultTicker();
                                var title;
                                if (ticker != commonBusiness.companyName) {
                                    title = commonBusiness.companyName + '(' + ticker + ')';
                                } else {
                                    title = commonBusiness.companyName;
                                }
                                return title;
                            }

                            var significantDevelopmentSources = stockChartBusiness.significantDevelopmentSources;
                            if (significantDevelopmentSources.length == 0) {
                                stockService.getSigDevSource()
                                .then(function (data) {
                                    stockChartBusiness.significantDevelopmentSources = data;
                                    getSavedStockChart();
                                });
                            } else {
                                getSavedStockChart();
                            }

                            function getSavedStockChart() {
                                stockService.getSavedChartDefer(commonBusiness.projectId, commonBusiness.stepId, scope.mnemonicid, scope.itemid)
                                .then(function (defferedData) {
                                    var data = defferedData[0];
                                    var sigDevTable = defferedData[1].item;

                                    function getTableInfo(index) {

                                        var tableInfo = [];
                                        var savedTable = _.find(sigDevTable,
                                            function (table) {
                                                if(table.seqNo === index) {
                                                    return table;
                                                }
                                            }
                                        );

                                        if (savedTable) {
                                            if(savedTable.sigdev && savedTable.sigdev.length > 0) {
                                                tableInfo.push({
                                                    source: {
                                                            value: 'SIGDEV',
                                                            label: stockChartBusiness.getSignificantDevelopmentSourceLabel('SIGDEV')
                                                    },
                                                    rows: savedTable.sigdev,
                                                    isDefaultChart: false
                                                });
                                            }

                                            if (savedTable.mascad && savedTable.mascad.length > 0) {
                                                tableInfo.push({
                                                    source: {
                                                        value: 'MASCAD',
                                                        label: stockChartBusiness.getSignificantDevelopmentSourceLabel('MASCAD')
                                                    },
                                                    rows: savedTable.mascad,
                                                    isDefaultChart: false
                                                });
                                            }
                                        }
                                        return tableInfo;
                                    }

                                    var idCount = 1;
                                    //Creating Legacy Charts
                                    if (data.legacyCharts) {
                                        var n;
                                        var index;
                                        var chartSetting;
                                        var stockChart;

                                        n = data.legacyCharts.length;
                                        scope.oldCharts = [];
                                        for (index = 0; index < n; index++) {
                                            chartSetting = data.legacyCharts[index];
                                            stockChart = new Object();
                                            stockChart.title = chartSetting.chart_title;
                                            stockChart.chartType = 'IMGURL';
                                            stockChart.tearsheet = {
                                                type: 'image',
                                                url: chartSetting.url,
                                                project_image_code: chartSetting.project_image_code,
                                                isChartTitle: true
                                            };
                                            scope.oldCharts.push(stockChart);
                                        }
                                    }
                                    //Creating new charts
                                    if (data.newCharts) {

                                        //mock chart
                                        // console.log('***************** ONEAL NEW CHARTS START ONEAL *****************');
                                        // console.log(data.newCharts);
                                        // console.log('***************** ONEAL NEW CHARTS  END  ONEAL *****************');
                                        // data.newCharts.unshift({
                                        //     chartType: "JSCHART",
                                        //     isMainChart : true,
                                        //     settings : {
                                        //         companyName: commonBusiness.companyName,
                                        //         date_end: "",
                                        //         date_start: "",
                                        //         isDividents: false,
                                        //         isEarnings: false,
                                        //         isSplits: false,
                                        //         item_id: "WU_STOCK_CHART_3YR_EM",
                                        //         mainStock: "",
                                        //         mnemonic: "WU_STOCK_CHART_3YR",
                                        //         searchedStocks: [],
                                        //         selectedIndicesList: [],
                                        //         selectedPeerList: [],
                                        //         selectedCompetitorsList:[],
                                        //         selectedPeriod: "3Y",
                                        //         step_id: 3
                                        //     }
                                        // });

                                        /*
                                         * Service call to save initial state - Implementation for reset functionality 5/11/2016
                                         */
                                        var newCharts = data.newCharts;

                                        // alert('renderJSCharts: ' + data.newCharts.length);
                                        scope.jsCharts = [];
                                        var chart;
                                        var chartSettings;

                                        for (var i = 0; i < data.newCharts.length; i++) {
                                            chart = data.newCharts[i];
                                            chartSettings = chart.settings;
                                            scope.jsCharts.push({
                                                tearsheet: {
                                                    type: angular.lowercase(scope.type),
                                                    isChartTitle: true,
                                                    isMainChart: chart.isMainChart,
                                                    mnemonicId: scope.mnemonicid,
                                                    itemId: scope.itemid,
                                                    chartOrder: i
                                                },
                                                filterState: {
                                                    title: chartSettings.companyName,
                                                    mnemonic: chartSettings.mnemonic,
                                                    item_id: chartSettings.item_id,
                                                    chart_id: chartSettings.chart_id,
                                                    mainStock: '',
                                                    interval: chartSettings.selectedPeriod,
                                                    chart_date: chartSettings.chart_date,
                                                    startDate: templateBusinessFormat.parseDate(chartSettings.date_start, 'YYYY-MM-DD'),
                                                    endDate: templateBusinessFormat.parseDate(chartSettings.date_end, 'YYYY-MM-DD'),
                                                    splits: chartSettings.isSplits,
                                                    earnings: chartSettings.isEarnings,
                                                    dividends: chartSettings.isDividents,
                                                    selectedIndices: chartSettings.selectedIndicesList,
                                                    selectedPeers: chartSettings.selectedPeerList,
                                                    selectedCompetitors: chartSettings.selectedCompetitorsList,
                                                    isDefault: chartSettings.isDefault
                                                },
                                                msChartPlaceHolderId: 'chart-'.concat(i),
                                                title: chartSettings.companyName,
                                                chartType: data.newCharts[i].chartType,
                                                tableInfo: getTableInfo(i)
                                            });
                                        }
                                        //console.log(scope.jsCharts);
                                        //reset default chart coming in from web service
                                        resetChartFilter(scope.jsCharts[0].filterState);
                                        scope.jsCharts[0].filterState.title = scope.jsCharts[0].title = getStockChartTitle();
                                        //console.log(scope.jsCharts);
                                        stockService.setInitialStateData(angular.copy(scope.jsCharts));
                                        $rootScope.savedChartData = scope.jsCharts;
                                    }

                                    scope.chartMoved = function (direction, index) {
                                        if (direction === 'U') {
                                            scope.moveSavedChartUp(index);
                                        } else if (direction === 'D') {
                                            scope.moveSavedChartDown(index);
                                        }
                                    };

                                    scope.moveSavedChartUp = function (index) {
                                        //item is not at first index so we can re arrenge it
                                        if (index > 1) {
                                            var temp = scope.jsCharts[index - 1];
                                            scope.jsCharts[index - 1] = scope.jsCharts[index];
                                            scope.jsCharts[index] = temp;
                                            saveAllCharts();
                                        }
                                    };

                                    scope.moveSavedChartDown = function (index) {
                                        //item is not at last index so we can re arrenge it
                                        if (index !== -1 && index + 1 !== scope.jsCharts.length) {
                                            var temp = scope.jsCharts[index + 1];
                                            scope.jsCharts[index + 1] = scope.jsCharts[index];
                                            scope.jsCharts[index] = temp;
                                            saveAllCharts();
                                        }
                                    };

                                    scope.onChartRemove = function (index) {
                                        scope.jsCharts.splice(index, 1);
                                        //chart remove chart the charts on server ..
                                        saveAllCharts();
                                    };

                                    scope.chartOldMoved = function (direction, index) {
                                        if (direction === 'U') {
                                            scope.moveSavedChartOldUp(index);
                                        } else if (direction === 'D') {
                                            scope.moveSavedChartOldDown(index);
                                        }
                                    };

                                    scope.moveSavedChartOldUp = function (index) {
                                        //item is not at first index so we can re arrenge it
                                        if (index > 0) {
                                            var temp = scope.oldCharts[index - 1];
                                            scope.oldCharts[index - 1] = scope.oldCharts[index];
                                            scope.oldCharts[index] = temp;
                                            saveAllCharts();
                                        }
                                    };

                                    scope.moveSavedChartOldDown = function (index) {
                                        //item is not at last index so we can re arrenge it
                                        if (index !== -1 && index + 1 !== scope.oldCharts.length) {
                                            var temp = scope.oldCharts[index + 1];
                                            scope.oldCharts[index + 1] = scope.oldCharts[index];
                                            scope.oldCharts[index] = temp;
                                            saveAllCharts();
                                        }
                                    };

                                    scope.onChartOldRemove = function (index) {
                                        scope.oldCharts.splice(index, 1);
                                        //chart remove chart the charts on server ..
                                        saveAllCharts();
                                    };

                                    function getHighestStockChartId() {
                                        var currentId = scope.jsCharts[0].msChartPlaceHolderId;
                                        var idNumber = parseInt(currentId.substr(6));
                                        var maxId = idNumber;
                                        scope.jsCharts.forEach(function (item) {
                                            currentId = item.msChartPlaceHolderId;
                                            idNumber = parseInt(currentId.substr(6));
                                            if (maxId < idNumber) {
                                                maxId = idNumber;
                                            }
                                        });
                                        return maxId;
                                    }

                                    scope.addNewChart = function (chart, index) {
                                        var id = getHighestStockChartId() + 1;
                                        chart.filterState.isDefault = 'N';
                                        chart.msChartPlaceHolderId = 'chart-' + id;

                                        //add new chart to array
                                        scope.jsCharts.splice(index + 1, 0, chart);
                                        var lastStatedata = stockService.getInitialStateData();
                                        if (lastStatedata) {
                                            lastStatedata.splice(index + 1, 0, angular.copy(chart));
                                        }
                                        saveAllCharts();
                                        $rootScope.savedChartData = scope.jsCharts;
                                    };

                                    function resetChartFilter(filterState) {
                                        filterState.interval = '3Y';
                                        filterState.chart_date = templateBusinessFormat.formatDate(new Date(), 'YYYY-MM-DD');
                                        filterState.startDate = '';
                                        filterState.endDate = '';
                                        filterState.splits = false;
                                        filterState.earnings = false;
                                        filterState.dividends = false;
                                        filterState.selectedIndices = [];
                                        filterState.selectedPeers = [];
                                        filterState.selectedCompetitors = [];
                                    };

                                    //Making this functinmlity to work for invidual chart as per requirement 17-05-2015
                                    scope.resetChart = function (id) {
                                        var selectedChart = scope.jsCharts[id];
                                        var matchingChart = null;
                                        var lastStatedata = stockService.getInitialStateData();
                                        if (lastStatedata && lastStatedata.length > 0) {
                                            lastStatedata.forEach(function (currentChart) {
                                                if (currentChart.msChartPlaceHolderId == selectedChart.msChartPlaceHolderId) {
                                                    matchingChart = currentChart;
                                                    return;
                                                }
                                            });

                                            if (matchingChart) {
                                                selectedChart.filterState.title = matchingChart.filterState.title;
                                                selectedChart.filterState.interval = matchingChart.filterState.interval;
                                                selectedChart.filterState.chart_date = matchingChart.filterState.chart_date;
                                                selectedChart.filterState.startDate = matchingChart.filterState.startDate;
                                                selectedChart.filterState.endDate = matchingChart.filterState.endDate;
                                                selectedChart.filterState.splits = matchingChart.filterState.splits;
                                                selectedChart.filterState.earnings = matchingChart.filterState.earnings;
                                                selectedChart.filterState.dividends = matchingChart.filterState.dividends;
                                                selectedChart.filterState.selectedIndices = angular.copy(matchingChart.filterState.selectedIndices);
                                                selectedChart.filterState.selectedPeers = angular.copy(matchingChart.filterState.selectedPeers);
                                                selectedChart.filterState.selectedCompetitors = angular.copy(matchingChart.filterState.selectedCompetitors);
                                                selectedChart.title = matchingChart.title;
                                                selectedChart.tableInfo = angular.copy(matchingChart.tableInfo);
                                            } else {
                                                resetChartFilter(selectedChart.filterState);
                                                selectedChart.filterState.title = selectedChart.title = getStockChartTitle();
                                            }
                                        } else {
                                            resetChartFilter(selectedChart.filterState);
                                            selectedChart.filterState.title = selectedChart.title = getStockChartTitle();
                                        }

                                        scope.jsCharts[id] = angular.copy(selectedChart);
                                        if (matchingChart && (id != 0)) {
                                            saveAllCharts();
                                        }
                                    };

                                    var saveAllCharts = function saveAllCharts() {
                                        var startArr = [];
                                        var savedTable = [];
                                        if (scope.jsCharts != null) {
                                            scope.jsCharts.forEach(function (chart) {
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
                                                    date_start: templateBusinessFormat.formatDate(jsChart.startDate, 'YYYY-MM-DD'),
                                                    date_end: templateBusinessFormat.formatDate(jsChart.endDate, 'YYYY-MM-DD'),
                                                    dividends: jsChart.dividends ? "Y" : "N",
                                                    earnings: jsChart.earnings ? "Y" : "N",
                                                    splits: jsChart.splits ? "Y" : "N",
                                                    chartType: jsChart.chartType ? jsChart.chartType : 'JSCHART',
                                                    mnemonic: jsChart.mnemonic,
                                                    item_id: jsChart.item_id,
                                                    isDefault: jsChart.isDefault
                                                    // , chart_id: jsChart.chart_id
                                                };

                                                if (chart.chartType === 'IMGURL') {
                                                    obj.project_image_code = chart.tearsheet.project_image_code;
                                                    obj.url = chart.tearsheet.url;
                                                }
                                                startArr.push(obj);
                                                // }
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

                                                    savedTable.push(perChart);
                                                }
                                            });
                                        }

                                        if (scope.oldCharts != null) {
                                            scope.oldCharts.forEach(function (chart) {
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
                                                startArr.push(obj);
                                            });
                                        }

                                        var saveObject = {
                                            newCharts: scope.jsCharts,
                                            oldCharts: scope.oldCharts
                                        };

                                        templateBusinessSave.getReadyForAutoSave(scope.itemid, scope.mnemonicid, saveObject, clientConfig.uiType.interactiveStockChart);
                                        templateBusinessSave.getReadyForAutoSave(scope.itemid, scope.mnemonicid, scope.jsCharts, clientConfig.uiType.significantDevelopmentItems);
                                    };

                                    scope.saveAllCharts = saveAllCharts;

                                    commonBusiness.onMsg('saveAllChart', scope,
                                        function () {
                                           var newList;
                                            var i;
                                            var n;

                                            newList = new Array();
                                            //skip the default chart use the default chart from load time
                                            var lastStatedata = stockService.getInitialStateData();
                                            newList.push(lastStatedata[0]);
                                            n = scope.jsCharts.length;
                                            for (i = 1; i < n; i++) {
                                                newList.push(angular.copy(scope.jsCharts[i]));
                                            }
                                            stockService.setInitialStateData(newList);
                                            saveAllCharts();
                                        }
                                    );

                                    commonBusiness.onMsg('updateInteractiveStockChartIds', scope, function (ev, data) {
                                        //console.log('Save Postprocessing here.');
                                    });

                                });
                            }
                            break;
                        case 'financial':

                            function getFinancialChartTitle(ratioLabel) {
                                var ticker = getDefaultTicker();
                                var title;
                                if (ticker != commonBusiness.companyName) {
                                    title = commonBusiness.companyName + '(' + ticker + ')';
                                } else {
                                    title = commonBusiness.companyName;
                                }
                                title += ' - ' + ratioLabel;
                                return title;
                            }

                            function getSavedFinancialChart() {
                                financialChartService.getSavedFinancialChart(financialChartBusiness.getSavedChartSettingsInputObject(commonBusiness.projectId, commonBusiness.stepId, scope.mnemonicid, scope.itemid))
                                .then(function (data) {
                                    //console.log(data);
                                    scope.jsCharts = [];
                                    if (data) {

                                        var financialChart;
                                        var chartSetting;
                                        var index;
                                        var n;

                                        if (data && data.attachments) {
                                            n = data.attachments.length;
                                            scope.oldCharts = [];
                                            for (index = 0; index < n; index++) {
                                                chartSetting = data.attachments[index];
                                                financialChart = new Object();
                                                financialChart.title = chartSetting.chartTitle;
                                                financialChart.chartType = 'IMGURL';
                                                financialChart.tearsheet = {
                                                    type: 'image',
                                                    url: chartSetting.url,
                                                    projectImageCode: chartSetting.projectImageCode,
                                                    isChartTitle: true
                                                };
                                                scope.oldCharts.push(financialChart);
                                            }
                                        }

                                        if (data && data.chartSettings) {
                                            var ticker = getDefaultTicker();
                                            var title = getFinancialChartTitle(financialChartBusiness.defaultRatioLabel);
                                            //Default Financial Chart
                                            scope.jsCharts.push({
                                                tearsheet: {
                                                    type: angular.lowercase(scope.type),
                                                    isChartTitle: true,
                                                    isMainChart: true,
                                                    mnemonicId: scope.mnemonicid,
                                                    itemId: scope.itemid
                                                },
                                                filterState: {
                                                    chartTitle: title,
                                                    compareNames: [commonBusiness.companyName],
                                                    compareIds: [commonBusiness.companyId],
                                                    shortNames: [ticker],
                                                    chartMode: 's',
                                                    //chartType: 'MARKET_CAP_DAILY',
                                                    chartType: financialChartBusiness.defaultRatio,
                                                    chartPeriod: '3',
                                                    isCustomDate: false,
                                                    startDate: '',
                                                    endDate: '',
                                                    chartId: 0,
                                                    sequence: 0,
                                                    chartTypeLabel: financialChartBusiness.defaultRatioLabel
                                                },
                                                msChartPlaceHolderId: 'chart-0',
                                                title: title,
                                                chartType: 'IFCHART'
                                            });
                                            
                                            n = data.chartSettings.length;

                                            data.chartSettings.sort(function (a, b) {
                                                return a.sequence - b.sequence;
                                            });

                                            for (index = 0; index < n; index++) {
                                                chartSetting = data.chartSettings[index];
                                                financialChart = new Object();
                                                financialChart.tearsheet = {
                                                    type: angular.lowercase(scope.type),
                                                    isChartTitle: true,
                                                    isMainChart: false,
                                                    mnemonicId: scope.mnemonicid,
                                                    itemId: scope.itemid
                                                }
                                                financialChart.filterState = chartSetting;
                                                financialChart.filterState.chartTypeLabel = financialChartBusiness.getRatioTypeLabel(financialChart.filterState.chartType);
                                                financialChart.msChartPlaceHolderId = 'chart-' + (index + 1);
                                                //Todo: waiting for web service change to return saved chart title
                                                financialChart.title = chartSetting.chartTitle;
                                                financialChart.chartType = 'IFCHART';
                                                scope.jsCharts.push(financialChart);
                                            }

                                            console.log(scope.jsCharts);
                                            financialChartService.setInitialStateData(angular.copy(scope.jsCharts));
                                            $rootScope.savedChartData = scope.jsCharts;
                                        }
                                    }

                                    function saveAllCharts() {
                                        var arr = new Array();
                                        var projectImageCodes = new Array();
                                        var i;
                                        var n;
                                        n = scope.jsCharts.length;
                                        for (i = 1; i < n; i++) {
                                            arr.push(scope.jsCharts[i]);
                                        }
                                        n = scope.oldCharts.length;
                                        for (i = 0; i < n; i++) {
                                            projectImageCodes.push(scope.oldCharts[i].tearsheet.projectImageCode);
                                        }
                                        var saveObject = {
                                            newCharts: arr,
                                            projectImageCodes: projectImageCodes
                                        };
                                        //templateBusiness.getReadyForAutoSaveInteractiveFinancialChart(commonBusiness.companyId, commonBusiness.projectId, commonBusiness.stepId, scope.mnemonicid, scope.itemid, saveObject);
                                        templateBusinessSave.getReadyForAutoSave(scope.itemid, scope.mnemonicid, saveObject, clientConfig.uiType.interactiveFinancialChart);
                                    };

                                    scope.saveAllCharts = saveAllCharts;

                                    commonBusiness.onMsg('saveAllChart', scope,
                                        function () {
                                            var newList;
                                            var i;
                                            var n;

                                            newList = new Array();
                                            //skip the default chart use the default chart from load time
                                            var lastStatedata = financialChartService.getInitialStateData();
                                            newList.push(lastStatedata[0]);
                                            n = scope.jsCharts.length;
                                            for (i = 1; i < n; i++) {
                                                newList.push(angular.copy(scope.jsCharts[i]));
                                            }
                                            financialChartService.setInitialStateData(newList);
                                            saveAllCharts();
                                        }
                                    );

                                    commonBusiness.onMsg('updateInteractiveFinancialChartIds', scope, function (ev, data) {
                                        var i;
                                        var n1;
                                        var n2;
                                        if (data.projectImageCode && data.projectImageCode.length > 0) {
                                            n1 = data.projectImageCode.length;
                                            n2 = scope.oldCharts.length;
                                            if (n1 === n2) {
                                                for (i = 0; i < n1; i++) {
                                                    scope.oldCharts[i].tearsheet.projectImageCode = data.projectImageCode[i];
                                                }
                                            }
                                        }
                                        if (data.ifChartSettings && data.ifChartSettings.length > 0) {
                                            n1 = data.ifChartSettings.length;
                                            n2 = scope.jsCharts.length - 1;
                                            if (n1 === n2) {
                                                for (i = 0; i < n1; i++) {
                                                    scope.jsCharts[i + 1].filterState.chartId = data.ifChartSettings[i].chartId;
                                                }
                                            }
                                        }

                                    });

                                    scope.chartMoved = function (direction, index) {
                                        if (direction === 'U') {
                                            scope.moveSavedChartUp(index);
                                        } else if (direction === 'D') {
                                            scope.moveSavedChartDown(index);
                                        }
                                    };

                                    scope.moveSavedChartUp = function (index) {
                                        //item is not at first index so we can re arrenge it
                                        if (index > 1) {
                                            var temp = scope.jsCharts[index - 1];
                                            scope.jsCharts[index - 1] = scope.jsCharts[index];
                                            scope.jsCharts[index] = temp;
                                            saveAllCharts();
                                        }
                                    };

                                    scope.moveSavedChartDown = function (index) {
                                        //item is not at last index so we can re arrenge it
                                        if (index !== -1 && index + 1 !== scope.jsCharts.length) {
                                            var temp = scope.jsCharts[index + 1];
                                            scope.jsCharts[index + 1] = scope.jsCharts[index];
                                            scope.jsCharts[index] = temp;
                                            saveAllCharts();
                                        }
                                    };

                                    scope.onChartRemove = function (index) {
                                        scope.jsCharts.splice(index, 1);
                                        //chart remove chart the charts on server ..
                                        saveAllCharts();
                                    };

                                    scope.chartOldMoved = function (direction, index) {
                                        if (direction === 'U') {
                                            scope.moveSavedChartOldUp(index);
                                        } else if (direction === 'D') {
                                            scope.moveSavedChartOldDown(index);
                                        }
                                    };

                                    scope.moveSavedChartOldUp = function (index) {
                                        //item is not at first index so we can re arrenge it
                                        if (index > 0) {
                                            var temp = scope.oldCharts[index - 1];
                                            scope.oldCharts[index - 1] = scope.oldCharts[index];
                                            scope.oldCharts[index] = temp;
                                            saveAllCharts();
                                        }
                                    };

                                    scope.moveSavedChartOldDown = function (index) {
                                        //item is not at last index so we can re arrenge it
                                        if (index !== -1 && index + 1 !== scope.oldCharts.length) {
                                            var temp = scope.oldCharts[index + 1];
                                            scope.oldCharts[index + 1] = scope.oldCharts[index];
                                            scope.oldCharts[index] = temp;
                                            saveAllCharts();
                                        }
                                    };

                                    scope.onChartOldRemove = function (index) {
                                        var deletedChart;
                                        deletedChart = scope.oldCharts.splice(index, 1)[0];
                                        saveAllCharts();
                                    };

                                    function getHighestFinancialChartId() {
                                        var currentId = scope.jsCharts[0].msChartPlaceHolderId;
                                        var idNumber = parseInt(currentId.substr(6));
                                        var maxId = idNumber;
                                        scope.jsCharts.forEach(function (item) {
                                            currentId = item.msChartPlaceHolderId;
                                            idNumber = parseInt(currentId.substr(6));
                                            if (maxId < idNumber) {
                                                maxId = idNumber;
                                            }
                                        });
                                        return maxId;
                                    }

                                    scope.addNewChart = function (chart, index) {
                                        var id = getHighestFinancialChartId() +1;
                                        chart.tearsheet.isMainChart = false;
                                        chart.msChartPlaceHolderId = 'chart-' + id;

                                        //add new chart to array
                                        scope.jsCharts.splice(index + 1, 0, chart);
                                        var lastStatedata = financialChartService.getInitialStateData();
                                        if (lastStatedata) {
                                            lastStatedata.splice(index + 1, 0, angular.copy(chart));
                                        }
                                        saveAllCharts();
                                        $rootScope.savedChartData = scope.jsCharts;
                                    };

                                    function resetChartFilter(filterState) {
                                        filterState.compareNames = [commonBusiness.companyName];
                                        filterState.compareIds = [commonBusiness.companyId];
                                        filterState.shortNames = [getDefaultTicker()];
                                        filterState.chartMode = 'S';
                                        filterState.chartType = financialChartBusiness.defaultRatio;
                                        filterState.chartPeriod = '3';
                                        filterState.isCustomDate = false;
                                        filterState.startDate = '';
                                        filterState.endDate = '';
                                        filterState.chartTypeLabel = financialChartBusiness.defaultRatioLabel;
                                    };

                                    scope.resetChart = function (id) {
                                        var selectedChart = scope.jsCharts[id];
                                        var matchingChart = null;
                                        var lastStatedata = financialChartService.getInitialStateData();
                                        if (lastStatedata && lastStatedata.length > 0) {
                                            lastStatedata.forEach(function (currentChart) {
                                                if (currentChart.msChartPlaceHolderId == selectedChart.msChartPlaceHolderId) {
                                                    matchingChart = currentChart;
                                                    return;
                                                }
                                            });

                                            if (matchingChart) {
                                                selectedChart.filterState.chartTitle = matchingChart.filterState.chartTitle;
                                                selectedChart.filterState.compareNames = angular.copy(matchingChart.filterState.compareNames);
                                                selectedChart.filterState.shortNames = angular.copy(matchingChart.filterState.shortNames);
                                                selectedChart.filterState.compareIds = angular.copy(matchingChart.filterState.compareIds);
                                                selectedChart.filterState.chartMode = matchingChart.filterState.chartMode;
                                                selectedChart.filterState.chartType = matchingChart.filterState.chartType;
                                                selectedChart.filterState.chartPeriod = matchingChart.filterState.chartPeriod;
                                                selectedChart.filterState.isCustomDate = matchingChart.filterState.isCustomDate;
                                                selectedChart.filterState.startDate = matchingChart.filterState.startDate;
                                                selectedChart.filterState.endDate = matchingChart.filterState.endDate;
                                                selectedChart.filterState.chartTypeLabel = matchingChart.filterState.chartTypeLabel;
                                                selectedChart.title = matchingChart.title;
                                            } else {
                                                resetChartFilter(selectedChart.filterState);
                                                selectedChart.filterState.title = selectedChart.title = getFinancialChartTitle(selectedChart.filterState.chartTypeLabel);
                                            }
                                        } else {
                                            resetChartFilter(selectedChart.filterState);
                                            selectedChart.filterState.title = selectedChart.title = getFinancialChartTitle(selectedChart.filterState.chartTypeLabel);
                                        }
                                        //scope.jsCharts[id] = selectedChart;
                                        scope.jsCharts[id] = angular.copy(selectedChart);
                                        if (matchingChart && (id != 0)) {
                                            saveAllCharts();
                                        }
                                    };
                                });
                            };

                            var peerIndustries;
                            if (financialChartService.getCurrentCompanyId() === commonBusiness.companyId) {
                                peerIndustries = financialChartBusiness.peerIndustries;
                            } else {
                                peerIndustries = [];
                            }
                            if (peerIndustries.length == 0) {
                                financialChartService.getFinancialChartPeerAndIndustries(commonBusiness.companyId)
                                .then(function (data) {
                                    financialChartBusiness.peerIndustries = data;
                                });
                            }

                            var ratioTypes = financialChartBusiness.ratioTypes;
                            if (ratioTypes.length == 0) {
                                financialChartService.getFinancialChartRatioTypes()
                                .then(function (data) {
                                    financialChartBusiness.ratioTypes = data;
                                    getSavedFinancialChart();
                                });
                            } else {
                                getSavedFinancialChart();
                            }
                            break;
                        case 'bar':
                            break;
                        default:
                            break;
                    }
                }
            }
        };
    }
})();