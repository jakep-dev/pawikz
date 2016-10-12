(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('msChartController', msChartController)
        .directive('msChart', msChartDirective);

    /** @ngInject */
    function msChartController($scope) {
        var vm = this;

    }

    /** @ngInject */
    function msChartDirective($rootScope, $compile, $q, stockService, commonBusiness, templateBusiness, financialChartBusiness, financialChartService, toast, $interval, clientConfig, store)
    {
        return {
            restrict: 'E',
            scope : {
                type: '@',
                mnemonicid: '@',
                itemid: '@'
            },
            templateUrl: 'app/core/directives/ms-chart/ms-chart.html',
            controller : 'msChartController',
            link:
            {
                pre: function(scope, el)
                {
                    var html = '';
                    var newScope = null;
                    toast.simpleToast("Auto Save Enabled");
                    switch (angular.lowercase(scope.type))
                    {
                        case 'stock':
                            stockService.getSavedChartData(
                                commonBusiness.projectId,
                                commonBusiness.stepId,
                                scope.mnemonicid,
                                scope.itemid,store.get('x-session-token'))
                                .then(function(data)
                                {
                                    var idCount = 1;
                                    //Creating Legacy Charts
                                    if(data.legacyCharts)
                                    {
                                        idCount=0;
                                        scope.oldCharts = [];
                                        angular.forEach(data.legacyCharts, function(chart)
                                        {
                                            ++idCount;
                                            if(idCount<4) {

                                                var tearsheet = {
                                                    type: 'image',
                                                    url: chart.url,
													project_image_code: chart.project_image_code,
                                                    isChartTitle: true
                                                };
                                                scope.oldCharts.push({
                                                    tearsheet : tearsheet,
                                                    title : chart.chart_title,
                                                    chartType:chart.chartType
                                                });
                                            }else{
                                                console.warn('Excess chart tried to be added')
                                            }
                                        });
                                    }
                                    //Creating new charts
                                    if(data.newCharts)
                                    {
                                        //mock chart

                                        //data.newCharts.push.apply(data.newCharts,data.legacyCharts);

                                        data.newCharts.unshift({
                                            chartType: "JSCHART",
                                            isMainChart : true,
                                            settings : {
                                                companyName: commonBusiness.companyName,
                                                date_end: "",
                                                date_start: "",
                                                isDividents: false,
                                                isEarnings: false,
                                                isSplits: false,
                                                item_id: "WU_STOCK_CHART_3YR_EM",
                                                mainStock: "",
                                                mnemonic: "WU_STOCK_CHART_3YR",
                                                searchedStocks: [],
                                                selectedIndicesList: [],
                                                selectedPeerList: [],
                                                selectedCompetitorsList:[],
                                                selectedPeriod: "3Y",
                                                step_id: 3
                                            }
                                        });

                                        /*
                                         * Service call to save initali state  - Implementation for reset functionality 5/11/2016
                                         */
                                        var newCharts = data.newCharts;
                                        if(!stockService.GetInitialStateData().hasOwnProperty("newCharts")) {
                                            stockService.AddInitalStateData(angular.copy(data.newCharts));
                                        }

                                        scope.chartMoved = function (direction, index) {
                                            if(direction === 'U'){
                                                scope.moveSavedChartUp(index);
                                            }
                                            else if(direction === 'D'){
                                                scope.moveSavedChartDown(index);
                                            }
                                        };

                                        scope.moveSavedChartUp = function (index){
                                            //item is not at first index so we can re arrenge it
                                            if(index > 1) {
                                                var temp = scope.jsCharts[index -1];
                                                scope.jsCharts[index -1] =  scope.jsCharts[index];
                                                scope.jsCharts[index] = temp;
                                                saveAllCharts();
                                            }
                                        };

                                        scope.moveSavedChartDown = function (index){
                                            //item is not at last index so we can re arrenge it
                                            if(index !== -1 && index+1 !== scope.jsCharts.length) {
                                                var temp = scope.jsCharts[index+1];
                                                scope.jsCharts[index+1] =  scope.jsCharts[index];
                                                scope.jsCharts[index] = temp;
                                                saveAllCharts();
                                            }
                                        };

                                        scope.onChartRemove = function (index){
                                            scope.jsCharts.splice(index, 1);
                                            //chart remove chart the charts on server ..
                                            saveAllCharts();

                                        };

                                        scope.chartOldMoved = function (direction, index) {
                                            if(direction === 'U'){
                                                scope.moveSavedChartOldUp(index);
                                            }
                                            else if(direction === 'D'){
                                                scope.moveSavedChartOldDown(index);
                                            }
                                        };

                                        scope.moveSavedChartOldUp = function (index){
                                            //item is not at first index so we can re arrenge it
                                            if(index > 0) {
                                                var temp = scope.oldCharts[index -1];
                                                scope.oldCharts[index -1] =  scope.oldCharts[index];
                                                scope.oldCharts[index] = temp;
                                                saveAllCharts();
                                            }
                                        };

                                        scope.moveSavedChartOldDown = function (index){
                                            //item is not at last index so we can re arrenge it
                                            if(index !== -1 && index+1 !== scope.oldCharts.length) {
                                                var temp = scope.oldCharts[index+1];
                                                scope.oldCharts[index+1] =  scope.oldCharts[index];
                                                scope.oldCharts[index] = temp;
                                                saveAllCharts();
                                            }
                                        };

                                        scope.onChartOldRemove = function (index){
                                            scope.oldCharts.splice(index, 1);
                                            //chart remove chart the charts on server ..
                                            saveAllCharts();

                                        };

                                        scope.addNewChart = function (chart, index){
                                             //add new chart to array
                                            scope.jsCharts.splice(index+1, 0, chart);

                                            $rootScope.savedChartData = scope.jsCharts;
                                        };

                                        //Making this functinmlity to work for invidual chart as per requirement 17-05-2015
                                        var resetChart = function(id) {
                                            var lastStatedata = {};
                                            if (id!=0 && stockService.GetManualSaveData().hasOwnProperty("newCharts")) {
                                                lastStatedata = stockService.GetManualSaveData().newCharts[0];
                                            }
                                            else {
                                                lastStatedata = stockService.GetInitialStateData().newCharts;
                                            }

                                            //Get the particular chart from the array
                                            //scope.jsCharts = [];
                                            var chart = angular.copy(lastStatedata[(id == 0 ? 0 : id - 1)]);
                                            var msChartPlaceHolderId = 'chart-'.concat(id);
                                            var chartType = chart.chartType;
                                            var filterState = {};
                                            var chartSettings;

                                            chartSettings = (chart.settings)?chart.settings:chart.chartSetting;
                                            var tearsheet = {
                                                type: 'stock',
                                                isChartTitle: true,
                                                isMainChart: chart.isMainChart,
                                                mnemonicId: scope.mnemonicid,
                                                itemId: scope.itemid,
                                                chartOrder: id
                                            };
                                            filterState.splits = chartSettings.isSplits;
                                            filterState.earnings = chartSettings.isEarnings;
                                            filterState.dividends = chartSettings.isDividents;
                                            filterState.interval = chartSettings.selectedPeriod;
                                            filterState.mainStock = '';
                                            filterState.selectedIndices = chartSettings.selectedIndicesList;
                                            filterState.selectedPeers = chartSettings.selectedPeerList;
                                            filterState.selectedCompetitors = chartSettings.selectedCompetitorsList;
                                            filterState.chart_id = chartSettings.chart_id;
                                            filterState.chart_date = chartSettings.chart_date;
                                            filterState.date_start = chartSettings.date_start;
                                            filterState.date_end = chartSettings.date_end;
                                            filterState.title = chartSettings.companyName;

                                            scope.jsCharts[id] = {
                                                tearsheet: tearsheet,
                                                filterState: filterState,
                                                msChartPlaceHolderId: msChartPlaceHolderId,
                                                title: chartSettings.companyName,
                                                chartType: chartType
                                            };




                                        };

                                        scope.resetChart = resetChart;


                                        //@TODO - Need to move this to renderJSCharts function
                                        var renderJSTempChart = function() {
                                            //angular.injector(['ngCookies']).invoke(['$cookies',function($cookies){
                                            //    var data = $cookies.getObject('tempChartData');
                                            var data = {};
                                            if (stockService.GetManualSaveData().hasOwnProperty("newCharts")) {
                                                data = stockService.GetManualSaveData();

                                                //Main Chart
                                                data.newCharts.unshift({
                                                    chartType: "JSCHART",
                                                    isMainChart: true,
                                                    settings: {
                                                        companyName: commonBusiness.companyName,
                                                        date_end: "",
                                                        date_start: "",
                                                        isDividents: false,
                                                        isEarnings: false,
                                                        isSplits: false,
                                                        item_id: "WU_STOCK_CHART_3YR_EM",
                                                        mainStock: "",
                                                        mnemonic: "WU_STOCK_CHART_3YR",
                                                        searchedStocks: [],
                                                        selectedIndicesList: [],
                                                        selectedPeerList: [],
                                                        selectedCompetitorsList: [],
                                                        selectedPeriod: "3Y",
                                                        step_id: 3
                                                    }
                                                });
                                            }
                                            else {
                                                data = stockService.GetInitialStateData();
                                            }


                                            scope.jsCharts = [];
                                            for (var i = 0; i < data.newCharts.length; i++) {
                                                var chart = data.newCharts[i];
                                                var msChartPlaceHolderId = 'chart-'.concat(i);
                                                var chartType = data.newCharts[i].chartType;
                                                var filterState = {};
                                                var chartSettings;
                                                if (chartType == "IMGURL") {
                                                    chartSettings = chart.chartSetting;
                                                    var tearsheet = {
                                                        type: 'image',
                                                        isChartTitle: true,
                                                        url: chart.url,
                                                        mnemonicId: scope.mnemonicid,
                                                        itemId: scope.itemid,
                                                        chartOrder: i
                                                    };
                                                }
                                                else {
                                                    chartSettings = chart.settings;

                                                    //chartSettings.chart_id = msChartPlaceHolderId;
                                                    chartSettings.chart_type = chartType;

                                                    var tearsheet = {
                                                        type: 'stock',
                                                        isChartTitle: true,
                                                        isMainChart: chart.isMainChart,
                                                        mnemonicId: scope.mnemonicid,
                                                        itemId: scope.itemid,
                                                        chartOrder: i
                                                    };
                                                }
                                                filterState.splits = chartSettings.isSplits;
                                                filterState.earnings = chartSettings.isEarnings;
                                                filterState.dividends = chartSettings.isDividents;
                                                filterState.interval = chartSettings.selectedPeriod;
                                                filterState.mainStock = '';
                                                filterState.selectedIndices = chartSettings.selectedIndicesList;
                                                filterState.selectedPeers = chartSettings.selectedPeerList;
                                                filterState.selectedCompetitors = chartSettings.selectedCompetitorsList;
                                                filterState.chart_id = chartSettings.chart_id;
                                                filterState.chart_date = chartSettings.chart_date;
                                                filterState.date_start = chartSettings.date_start;
                                                filterState.date_end = chartSettings.date_end;
                                                filterState.title = chartSettings.companyName;
                                                filterState.chart_type =  chartSettings.chart_type;
                                               // filterState.period = chartSettings.period;
                                                scope.jsCharts.push({
                                                    tearsheet: tearsheet,
                                                    filterState: filterState,
                                                    msChartPlaceHolderId: msChartPlaceHolderId,
                                                    title: chartSettings.companyName,
                                                    chartType: chartType
                                                });
                                                // }}]);
                                            }
                                        };
                                        scope.renderJSTempChart = renderJSTempChart;


                                        var  renderJSCharts  = function (){
                                            scope.jsCharts = [];

                                            for(var i=0; i < data.newCharts.length ; i++){
                                                var chart = data.newCharts[i];
                                                var msChartPlaceHolderId = 'chart-'.concat(i);
                                                var chartType = data.newCharts[i].chartType;

                                                var filterState = {};
                                                var chartSettings;
                                                if(chartType=="IMGURL"){
                                                    chartSettings = chart.chartSetting;
                                                    var tearsheet = {
                                                        type: 'image',
                                                        isChartTitle: true,
                                                        url:chart.url,
                                                        mnemonicId: scope.mnemonicid,
                                                        itemId: scope.itemid,
                                                        chartOrder : i,
                                                        project_image_code:chartSettings.project_image_code
                                                    };
                                                }
                                                else{
                                                    chartSettings = chart.settings;
                                                    var tearsheet = {
                                                        type: 'stock',
                                                        isChartTitle: true,
                                                        isMainChart : chart.isMainChart,
                                                        mnemonicId: scope.mnemonicid,
                                                        itemId: scope.itemid,
                                                        chartOrder : i
                                                    };
                                                }
                                                filterState.splits =chartSettings.isSplits;
                                                filterState.earnings = chartSettings.isEarnings;
                                                filterState.dividends = chartSettings.isDividents;
                                                filterState.interval = chartSettings.selectedPeriod;
                                                filterState.mainStock = '';
                                                filterState.selectedIndices = chartSettings.selectedIndicesList;
                                                filterState.selectedPeers = chartSettings.selectedPeerList;
                                                filterState.selectedCompetitors = chartSettings.selectedCompetitorsList;
                                                filterState.chart_id = chartSettings.chart_id;
                                                filterState.chart_date = chartSettings.chart_date;
                                                filterState.date_start = chartSettings.date_start;
                                                filterState.date_end = chartSettings.date_end;
                                                filterState.title = chartSettings.companyName;
                                                scope.jsCharts.push({
                                                    tearsheet : tearsheet,
                                                    filterState : filterState,
                                                    msChartPlaceHolderId : msChartPlaceHolderId,
                                                    title : chartSettings.companyName,
                                                    chartType:chartType
                                                });
                                            }

                                            $rootScope.savedChartData = scope.jsCharts;
                                        }
                                        renderJSCharts();
                                    }


                                    var exportAllCharts = function exportAllCharts() {
                                        var allHighCharts = Highcharts.charts;
                                        var chartCntr = allHighCharts.length;
                                        var strSVG = '', strSVGArr = [], chartNameArr = [], chartName;
                                        var j = 0, chartidtemp = "";




                                        for (var chartCnt =0; chartCnt < chartCntr; chartCnt++) {
                                            var chart = allHighCharts[chartCnt];
                                            if (chart != undefined) {
                                                strSVG = chart.getSVG();
                                                    if (scope.chart_ids[j] != null)
                                                        var jsChart = scope.chart_ids[j];
                                                    if (jsChart) {
                                                        var chartId = jsChart;
                                                    }
                                                if(chartId) {
                                                    strSVGArr.push(strSVG);

                                                    var chartName = (commonBusiness.stepId) +
                                                        "." + (scope.mnemonicid) +
                                                        "." + (scope.itemid) +
                                                        "." + (chartId) + ".part" + (chartCnt%2)+ ".svg";
                                                    chartNameArr.push(chartName);
                                                }
                                                    if(chartCnt%2 != 0){
                                                        j++;
                                                    }

//Need to create one file per chart and save it to  /data/tmp/newTemplates/<request_folder>
                                            }
                                        }

                                        var userDetails = store.get('user-info');
                                        var userName = "",userId = null;

                                        if(userDetails)
                                        {
                                            userName = userDetails.fullName;
                                            userId = userDetails.userId;
                                        }

                                        var file_name = commonBusiness.projectName;

                                        //stockService.saveChartSvgInFile(chartNameArr, strSVGArr);
                                        stockService.createTemplatePDFRequest(commonBusiness.projectId,
                                            userId,
                                            commonBusiness.stepId,
                                            file_name,
                                            commonBusiness.companyName,
                                            userName,
                                            chartNameArr,
                                            strSVGArr,
                                            store.get('x-session-token')).then(function(data){
                                                var anchor = angular.element('<a/>');
                                                anchor.attr({
                                                    href: 'data:attachment/pdf;charset=utf-8,' + encodeURI(data),
                                                    target: '_blank',
                                                    download: file_name.trim()+'.pdf'
                                                })[0].click();

                                            });
                                    };

                                    var saveAllCharts = function saveAllCharts() {

                                        var startArr = [];
                                        if (scope.jsCharts != null) {
                                            scope.jsCharts.forEach(function (chart) {
                                                var stockString = '';
                                                var jsChart = chart.filterState;
                                                var tearsheet = chart.tearsheet;
                                                if (!tearsheet.isMainChart) {
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

                                                    //jsChart.chart_id = chart.msChartPlaceHolderId;
                                                    jsChart.chartType = chart.chartType;
                                                    var obj = {
                                                        chart_title: jsChart.title ? jsChart.title : null,
                                                        peers: stockString,
                                                        period: jsChart.interval ? jsChart.interval : null,
                                                        date_start: jsChart.date_start,
                                                        date_end: jsChart.date_end,
                                                        dividends: jsChart.dividends ? "Y" : "N",
                                                        earnings: jsChart.earnings ? "Y" : "N",
                                                        splits: jsChart.splits ? "Y" : "N",
                                                        chartType: jsChart.chartType ? jsChart.chartType :'JSCHART',
                                                        chart_id: chart.chart_id
                                                    };

                                                    if(chart.chartType==='IMGURL'){
                                                        obj.project_image_code = chart.tearsheet.project_image_code;
                                                        obj.url = chart.tearsheet.url;
                                                    }

                                                    startArr.push(obj);
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
													chartType : chart.chartType,
                                                    dividends: chart.dividends ? "Y" : "N",
                                                    earnings: chart.earnings ? "Y" : "N",
                                                    splits: chart.splits ? "Y" : "N",
													project_image_code: chart.tearsheet.project_image_code,
                                                    url: chart.tearsheet.url
												};
												startArr.push(obj);
											});
										}
										
                                        var defer = $q.defer();
                                        stockService.saveChartAllSettings(commonBusiness.companyId,
                                            commonBusiness.stepId, commonBusiness.projectId, scope.mnemonicid,
                                            scope.itemid, store.get('x-session-token'), startArr).then(function(response) {
                                                scope.chart_ids = [];
                                                toast.simpleToast("Saved Successfully");
                                              angular.forEach(response.data, function(respData) {
                                                  scope.chart_ids.push(respData.chart_id);
                                              })
                                                defer.resolve();
                                            });
                                        return defer.promise;
                                    };

                                    scope.saveAllCharts = saveAllCharts;

                                    $rootScope.$on('exportAllCharts',function(){
                                        exportAllCharts();
                                    });

                                    var autosaveTimeOut;
                                    commonBusiness.onMsg('autosave',scope, function(){
                                        if(autosaveTimeOut){
                                            clearTimeout(autosaveTimeOut);
                                        }
                                        autosaveTimeOut = setTimeout(function(){
                                            saveAllCharts();
                                        },10000);
                                    });/*clientConfig.appSettings.autoSaveTimeOut);*/

                                    commonBusiness.onMsg('saveAllChart',scope, function(){
                                        saveAllCharts().then(function(){
                                            stockService.getSavedChartData(
                                                commonBusiness.projectId,
                                                commonBusiness.stepId,
                                                scope.mnemonicid,
                                                scope.itemid,
                                                store.get('x-session-token'))
                                                .then(function(data)
                                                {
                                                    stockService.AddManualSaveData(data.newCharts);
                                                });
                                        });
                                    });
                                });
                            break;

                        case 'financial':

                            function getSavedFinancialChart() {
                                financialChartService.getSavedFinancialChart(financialChartBusiness.getSavedChartSettingsInputObject(commonBusiness.projectId, commonBusiness.stepId, scope.mnemonicid, scope.itemid))
                                    .then(function (data) {
                                        //console.log(data);
                                        var date1 = new Date();
                                        var month1 = '00' + (date1.getMonth() + 1);
                                        month1 = month1.substr(month1.length - 2);
                                        var year1 = date1.getFullYear();
                                        var day1 = '00' + date1.getDate();
                                        day1 = day1.substr(day1.length - 2);
                                        scope.jsCharts = [];
                                        if (data && data.chartSettings) {
                                            //Default Financial Chart
                                            scope.jsCharts.push(
                                                {
                                                    tearsheet: {
                                                        type: angular.lowercase(scope.type),
                                                        isChartTitle: true,
                                                        isMainChart: true,
                                                        mnemonicId: scope.mnemonicid,
                                                        itemId: scope.itemid
                                                    },
                                                    filterState: {
                                                        chartTitle: commonBusiness.companyName,
                                                        compareNames: [commonBusiness.companyName],
                                                        compareIds: [commonBusiness.companyId],
                                                        chartMode: 's',
                                                        //chartType: 'MARKET_CAP_DAILY',
                                                        chartType: financialChartBusiness.defaultRatio,
                                                        chartPeriod: '3',
                                                        isCustomDate: false,
                                                        startDate: month1 + '/' + day1 + '/' + year1,
                                                        endDate: month1 + '/' + day1 + '/' + (year1 - 3),
                                                        chartId: 0,
                                                        sequence: 0,
                                                        chartTypeLabel: financialChartBusiness.defaultRatioLabel
                                                    },
                                                    msChartPlaceHolderId: 'chart-0',
                                                    title: commonBusiness.companyName,
                                                    chartType: 'IFCHART'
                                                }
                                            );

                                            var financialChart;
                                            var index = 0;
                                            var n = data.chartSettings.length;

                                            data.chartSettings.sort(function (a, b) {
                                                return a.sequence - b.sequence;
                                            });
                                            for (index = 0; index < n; index++) {
                                                var chartSetting = data.chartSettings[index];
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
                                            var newFinancialCharts = scope.jsCharts;
                                            if (!financialChartService.GetInitialStateData().hasOwnProperty("newFinancialCharts")) {
                                                financialChartService.AddInitalStateData(angular.copy(scope.jsCharts));
                                            }
                                            $rootScope.savedChartData = scope.jsCharts;
                                        }

                                        function saveAllCharts() {
                                            var arr = new Array();
                                            var i;
                                            var n;
                                            n = scope.jsCharts.length;
                                            for (i = 1; i < n; i++) {
                                                arr.push(scope.jsCharts[i]);
                                            }
                                            templateBusiness.getReadyForAutoSaveInteractiveFinancialChart(commonBusiness.companyId, commonBusiness.projectId, commonBusiness.stepId, scope.mnemonicid, scope.itemid, arr);
                                        };

                                        scope.saveAllCharts = saveAllCharts;

                                        scope.chartMoved = function (direction, index) {
                                            if (direction === 'U') {
                                                scope.moveSavedChartUp(index);
                                            }
                                            else if (direction === 'D') {
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

                                        function getHighestId() {
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

                                            var id = getHighestId() + 1;
                                            chart.tearsheet.isMainChart = false;
                                            chart.msChartPlaceHolderId = 'chart-' +id;

                                            //add new chart to array
                                            scope.jsCharts.splice(index + 1, 0, chart);
                                            saveAllCharts();
                                            $rootScope.savedChartData = scope.jsCharts;
                                        };

                                        function resetChartFilter(filterState) {
                                            filterState.chartTitle = commonBusiness.companyName;
                                            filterState.compareNames = [commonBusiness.companyName];
                                            filterState.compareIds = [commonBusiness.companyId];
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
                                            if (financialChartService.GetInitialStateData().hasOwnProperty("newFinancialCharts")) {
                                                var lastStatedata = financialChartService.GetInitialStateData().newFinancialCharts;
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
                                                        selectedChart.filterState.compareIds = angular.copy(matchingChart.filterState.compareIds);
                                                        selectedChart.filterState.chartMode = matchingChart.filterState.chartMode;
                                                        selectedChart.filterState.chartType = matchingChart.filterState.chartType;
                                                        selectedChart.filterState.chartPeriod = matchingChart.filterState.chartPeriod;
                                                        selectedChart.filterState.isCustomDate = matchingChart.filterState.isCustomDate;
                                                        selectedChart.filterState.startDate = matchingChart.filterState.startDate;
                                                        selectedChart.filterState.endDate = matchingChart.filterState.endDate;
                                                        selectedChart.filterState.chartTypeLabel = matchingChart.filterState.chartTypeLabel;
                                                    } else {
                                                        resetChartFilter(selectedChart.filterState);
                                                    }
                                                } else {
                                                    resetChartFilter(selectedChart.filterState);
                                                }
                                            } else {
                                                resetChartFilter(selectedChart.filterState);
                                            }
                                            //scope.jsCharts[id] = selectedChart;
                                            scope.jsCharts[id] = angular.copy(selectedChart);
                                            if (matchingChart && (id != 0)) {
                                                saveAllCharts();
                                            }
                                        };

                                    });
                            };

                            var peerIndustries = financialChartBusiness.peerIndustries;
                            if (peerIndustries.length == 0) {
                                financialChartService.getFinancialChartPeerAndIndustries(commonBusiness.companyId)
                                    .then(function (data) {
                                        financialChartBusiness.peerIndustries = data;
                                    }
                                );
                            }

                            var ratioTypes = financialChartBusiness.ratioTypes;
                            if (ratioTypes.length == 0) {
                                financialChartService.getFinancialChartRatioTypes()
                                    .then(function (data) {
                                        financialChartBusiness.ratioTypes = data;
                                        getSavedFinancialChart();
                                    }
                                );
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