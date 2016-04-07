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
    function msChartDirective($rootScope, $compile, stockService, commonBusiness)
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

                                    //Creating new charts
                                    if(data.newCharts)
                                    {
                                        //mock chart

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

                                        var saveAllCharts = function saveAllCharts() {
                                            var startArr = [];
                                            scope.jsCharts.forEach(function(chart){
                                                var stockString = '';
                                                var jsChart = chart.filterState;
                                                var tearsheet = chart.tearsheet;
                                                if(!tearsheet.isMainChart){
                                                    jsChart.selectedPeers.forEach( function(stock) {
                                                        stockString =stockString + stock + ',';
                                                    });

                                                    jsChart.selectedIndices.forEach( function(indics) {
                                                        stockString = stockString + '^'+indics + ',';
                                                    });
                                                    jsChart.selectedCompetitors.forEach( function(competitors){
                                                        stockString = stockString + '@'+competitors + ',';
                                                    });
                                                    if(stockString !=='') {
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
                                                        item_id: tearsheet.itemId
                                                    };
                                                    if(jsChart.chart_id){
                                                        obj.chartId = parseInt(jsChart.chart_id)
                                                    }
                                                    startArr.push(obj);
                                                }

                                            });
                                            stockService.saveChartAllSettings(commonBusiness.companyId,
                                                commonBusiness.stepId, commonBusiness.projectId, startArr);
                                        };

                                        scope.saveAllCharts = saveAllCharts;
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


                                        var  renderJSCharts  = function (){
                                            scope.jsCharts = [];
                                            for(var i=0; i < data.newCharts.length ; i++){
                                                var chart = data.newCharts[i];
                                                var msChartPlaceHolderId = 'chart-'.concat(i);
                                                var tearsheet = {
                                                    type: 'stock',
                                                    isChartTitle: true,
                                                    isMainChart : chart.isMainChart,
                                                    mnemonicId: scope.mnemonicid,
                                                    itemId: scope.itemid,
                                                    chartOrder : i
                                                };
                                                var filterState = {};
                                                filterState.splits =chart.settings.isSplits;
                                                filterState.earnings = chart.settings.isEarnings;
                                                filterState.dividends = chart.settings.isDividents;
                                                filterState.interval = chart.settings.selectedPeriod;
                                                filterState.mainStock = '';
                                                filterState.selectedIndices = chart.settings.selectedIndicesList;
                                                filterState.selectedPeers = chart.settings.selectedPeerList;
                                                filterState.selectedCompetitors = chart.settings.selectedCompetitorsList;
                                                filterState.chart_id = chart.settings.chart_id;
                                                filterState.chart_date = chart.settings.chart_date;
                                                filterState.date_start = chart.settings.date_start;
                                                filterState.date_end = chart.settings.date_end;
                                                filterState.title = chart.settings.companyName;
                                                scope.jsCharts.push({
                                                    tearsheet : tearsheet,
                                                    filterState : filterState,
                                                    msChartPlaceHolderId : msChartPlaceHolderId,
                                                    title : chart.settings.companyName
                                                });

                                            }
                                        }
                                        renderJSCharts();
                                    }
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
                                                    title : ""
                                                });
                                            }else{
                                                console.warn('Excess chart tried to be added')
                                            }
                                        });
                                    }

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