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
    function msChartDirective($rootScope, $compile, stockService, commonBusiness, toast, $interval, clientConfig)
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

                                        scope.addNewChart = function (chart, index){
                                             //add new chart to array
                                            scope.jsCharts.splice(index+1, 0, chart);
                                        };


                                        //@TODO - Need to move this to renderJSCharts function
                                        var renderJSTempChart = function(){
                                            angular.injector(['ngCookies']).invoke(['$cookies',function($cookies){
                                                var data = $cookies.getObject('tempChartData');

                                                //Main Chart
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
                                                scope.jsCharts = [];
                                                for(var i=0; i < data.newCharts.length ; i++) {
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
                                                            chartOrder: i
                                                        };
                                                    }
                                                    else{
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
                                                    scope.jsCharts.push({
                                                        tearsheet: tearsheet,
                                                        filterState: filterState,
                                                        msChartPlaceHolderId: msChartPlaceHolderId,
                                                        title: chartSettings.companyName,
                                                        chartType:chartType
                                                    });
                                                }
                                            }]);
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
                                                        chartOrder : i
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
                                        }
                                        renderJSCharts();
                                    }

                                    var saveAllCharts = function saveAllCharts() {
                                        var startArr = [];
                                        scope.jsCharts.forEach(function(chart){
                                            var stockString = '';
                                            var jsChart = chart.filterState;
                                            var tearsheet = chart.tearsheet;
                                            if(!tearsheet.isMainChart){
                                                if(jsChart.selectedPeers){
                                                    jsChart.selectedPeers.forEach( function(stock) {
                                                        stockString =stockString + stock + ',';
                                                    });
                                                }
                                                if(jsChart.selectedIndices){
                                                    jsChart.selectedIndices.forEach( function(indics) {
                                                        stockString = stockString + '^'+indics + ',';
                                                    });
                                                }
                                                if(jsChart.selectedCompetitors){
                                                    jsChart.selectedCompetitors.forEach( function(competitors){
                                                        stockString = stockString + '@'+competitors + ',';
                                                    });
                                                }
                                                if(stockString && stockString !=='') {
                                                    stockString = stockString.slice(0, -1);
                                                }
                                                var obj = {
                                                    chart_title: jsChart.title,
                                                    peers: stockString,
                                                    period:jsChart.interval,
                                                    date_start:jsChart.date_start,
                                                    date_end:jsChart.date_end,
                                                    dividends: jsChart.dividends ? "Y" : "N",
                                                    earnings: jsChart.earnings  ? "Y" : "N",
                                                    splits:jsChart.splits ? "Y" : "N",
                                                    mnemonic: tearsheet.mnemonicId,
                                                    item_id: tearsheet.itemId,
                                                    chartType:chart.chartType
                                                };
                                                if(jsChart.chart_id){
                                                    obj.chartId = parseInt(jsChart.chart_id)
                                                }
                                                startArr.push(obj);
                                            }

                                        });

                                        return stockService.saveChartAllSettings(commonBusiness.companyId,
                                            commonBusiness.stepId, commonBusiness.projectId, startArr);
                                    };

                                    scope.saveAllCharts = saveAllCharts;

                                    $interval(function(){
                                        saveAllCharts().then(function(){
                                            toast.simpleToast("Saved Successfully");
                                        });
                                    }, 360000); /*clientConfig.appSettings.autoSaveTimeOut);*/
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