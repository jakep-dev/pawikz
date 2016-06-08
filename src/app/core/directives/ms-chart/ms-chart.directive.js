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
    function msChartDirective($rootScope, $compile, stockService, commonBusiness, toast, $interval, clientConfig,store)
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
                                scope.itemid)
                                .then(function(data)
                                {
                                    var idCount = 1;
                                    //Saving the  data to rootScope to use at addIndices and competitors
                                    //$rootScope.savedChartData = data;
                                    //Creating Legacy Charts
                                    if(data.legacyCharts)
                                    {
                                        idCount=0;
                                        scope.oldCharts = [];
                                        angular.forEach(data.legacyCharts, function(chart)
                                        {
                                            ++idCount;
                                            console.log('idCount',idCount);
                                            if(idCount<4) {

                                                var tearsheet = {
                                                    type: 'image',
                                                    url: chart.url,
                                                    isChartTitle: true
                                                };
                                                scope.oldCharts.push({
                                                    tearsheet : tearsheet,
                                                    title : "",
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

                                            //$timeout(function(){
                                            //    renderJSCharts();
                                            //});
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
                                                console.log("printing chart object");
                                                //console.log(chart);
                                                //console.log('commonBusiness.stepId------->', commonBusiness);
                                                //console.log('scope.mnemonicid----->', scope.mnemonicid);
                                                //console.log('scope.item_id----->', scope.itemid);
                                                //console.log('scope.chart_id----->', scope.chartId);
                                                //console.log('scope.tearsheet.chart_id----->', scope.tearsheet.chart_id);
                                                //console.log('scope.chartSettings.chart_id----->', scope.chartSettings.chart_id);
                                                //console.log('scope.filterState.chart_id------->', scope.filterState.chart_id);
                                                //console.log('jsChart.chart_id------->', jsChart.chart_id);
                                                // console.log('chart_id*********************||', chartId);
                                                // console.log('chartSettings==============>', chart.settings.chart_id);


                                               // for (var i = 0; i < 2; i++) {
                                                    if (scope.jsCharts[j] != null)
                                                        var jsChart = scope.jsCharts[j].filterState;
                                                    if (jsChart.chart_id) {
                                                        //console.log('chart_id*********************>>', jsChart.chart_id);
                                                        var chartId = parseInt(jsChart.chart_id);
                                                        console.log('chart_id ===================>', chartId);
                                                    }
                                              //  }
                                                if(chartId) {
                                                    strSVGArr.push(strSVG);

                                                    var chartName = (commonBusiness.stepId) +
                                                        "." + (scope.mnemonicid) +
                                                        "." + (scope.itemid) +
                                                        "." + (chartId) + ".part" + (chartCnt%2)+ ".svg";
                                                    chartNameArr.push(chartName);
                                                }
                                               // if(chartCnt !==0){
                                                    if(chartCnt%2 != 0){
                                                        j++;
                                                    }
                                               // }


//Need to create one file per chart and save it to  /data/tmp/newTemplates/<request_folder>
                                            }
                                        }//hightchart loop end
                                        console.log('commonBusiness.projectId---------->', commonBusiness.projectId);
                                        console.log('commonBusiness.userId---------->', commonBusiness.userId);
                                        console.log('commonBusiness.stepId---------->', commonBusiness.stepId);
                                        console.log('commonBusiness.file_name---------->', commonBusiness.file_name);
                                        console.log('commonBusiness.company_name---------->', commonBusiness.companyName);
                                        console.log('commonBusiness.user_name---------->', commonBusiness.userName);


                                        var userDetails = store.get('user-info');
                                        var userName = "";
                                        if(userDetails)
                                        {
                                            userName = userDetails.fullName;
                                        }
                                        console.log('User Name',userName );

                                        //stockService.saveChartSvgInFile(chartNameArr, strSVGArr);
                                        stockService.createTemplatePDFRequest(commonBusiness.projectId,
                                            commonBusiness.userId,
                                            commonBusiness.stepId,
                                            chartNameArr.toString(),
                                            commonBusiness.companyName,
                                            userName,
                                            chartNameArr,
                                            strSVGArr,
                                            store.get('x-session-token'));
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
                                                    var obj = {
                                                        chart_title: jsChart.title ? jsChart.title : null,
                                                        peers: stockString,
                                                        period: jsChart.interval ? jsChart.interval : null,
                                                        date_start: jsChart.date_start,
                                                        date_end: jsChart.date_end,
                                                        dividends: jsChart.dividends ? "Y" : "N",
                                                        earnings: jsChart.earnings ? "Y" : "N",
                                                        splits: jsChart.splits ? "Y" : "N",
                                                        mnemonic: tearsheet.mnemonicId,
                                                        item_id: tearsheet.itemId,
                                                        chartType: chart.chartType
                                                    };
                                                    if(chart.chartType==='IMGURL'){
                                                        obj.project_image_code = chart.tearsheet.project_image_code;
                                                        obj.url = chart.tearsheet.url;
                                                    }
                                                    if (jsChart.chart_id) {
                                                        //console.log('chart_id*********************>>', jsChart.chart_id);
                                                        obj.chartId = parseInt(jsChart.chart_id);
                                                        //console.log('chart_id ===================>', obj.chartId);
                                                    }
                                                    startArr.push(obj);
                                                }

                                            });
                                        }

                                        return stockService.saveChartAllSettings(commonBusiness.companyId,
                                            commonBusiness.stepId, commonBusiness.projectId, startArr, store.get('x-session-token')) ;
                                    };

                                    scope.saveAllCharts = saveAllCharts;

                                    $rootScope.$on('exportAllCharts',function(){
                                        exportAllCharts();
                                    });

                                    $rootScope.$on('autosave',function(){
                                        setTimeout(function(){
                                            saveAllCharts().then(function(){
                                                toast.simpleToast("Saved Successfully");
                                            });
                                        },10000);
                                    });/*clientConfig.appSettings.autoSaveTimeOut);*/

                                    $rootScope.$on('saveAllChart',function(){
                                        saveAllCharts().then(function(){
                                            toast.simpleToast("Saved Successfully");
                                            stockService.getSavedChartData(
                                                commonBusiness.projectId,
                                                commonBusiness.stepId,
                                                scope.mnemonicid,
                                                scope.itemid)
                                                .then(function(data)
                                                {
                                                    stockService.AddManualSaveData(data.newCharts);
                                                });
                                        });
                                    });
                                });
                            break;
                        case 'bar':

                            break;

                        default:break;
                    }
                }
            }
        };
    }
})();