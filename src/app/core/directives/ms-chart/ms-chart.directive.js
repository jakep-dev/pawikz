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
    function msChartDirective($compile, stockService, commonBusiness)
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
                                        data.newCharts.push({
                                            chartTitle :'Mock chart'
                                        });
                                        angular.forEach(data.newCharts, function(chart)
                                        {
                                            var msChartPlaceHolderId = 'chart-'.concat(++idCount);
                                            newScope = scope.$new();

                                            newScope.tearsheet = {
                                                type: 'stock',
                                                isChartTitle: true,
                                                chartSetting: {
                                                    chartTitle : chart.chartTitle
                                                },
                                                mnemonicId: scope.mnemonicid,
                                                itemId: scope.itemid
                                            };

                                            html += '<ms-chart-placeholder id="'+ msChartPlaceHolderId +' title="'+ chart.chartTitle +'" tearsheet="tearsheet"></ms-chart-placeholder>';
                                            el.find('#ms-chart-container').append($compile(html)(newScope));
                                        });

                                        var saveAllCharts = function saveAllCharts() {
                                            var startArr = [];
                                            scope.jsCharts.forEach(function(chart){
                                                var stockString = '';
                                                var jsChart = chart.tearsheet;
                                                jsChart.chartSetting.selectedPeerList.forEach( function(stock) {
                                                    stockString =stockString + stock + ',';
                                                });

                                                jsChart.chartSetting.selectedIndicesList.forEach( function(indics) {
                                                    stockString = stockString + '^'+indics + ',';
                                                });
                                                if(stockString !=='') {
                                                    stockString = stockString.slice(0, -1);
                                                }
                                                console.log('jsChart.chartSetting.chart_id---->',jsChart.chartSetting.chart_id);
                                                if(jsChart.chartSetting.chart_id){
                                                    startArr.push({
                                                        chart_title: jsChart.chartSetting.companyName,
                                                        peers: stockString,
                                                        period:jsChart.chartSetting.selectedPeriod,
                                                        date_start:jsChart.chartSetting.date_start,
                                                        date_end:jsChart.chartSetting.date_end,
                                                        dividends: jsChart.chartSetting.isDividents,
                                                        earnings: jsChart.chartSetting.isEarnings,
                                                        splits:jsChart.chartSetting.isSplits,
                                                        mnemonic:jsChart.chartSetting.mnemonic,
                                                        item_id:jsChart.chartSetting.item_id,
                                                        chartId : parseInt(jsChart.chartSetting.chart_id)
                                                    });
                                                }

                                            });
                                            stockService.saveChartAllSettings(commonBusiness.companyId,
                                                commonBusiness.stepId, commonBusiness.projectId, startArr);
                                        };
                                        $rootScope.$on(
                                            "jsChart.removed",
                                            function(event,order) {
                                                if(order){
                                                    console.log('charts removed ');
                                                    scope.jsCharts.splice(order, 1);
                                                    //chart remove chart the charts on server ..
                                                    console.log('chart removed ------------------', scope.jsCharts);
                                                    saveAllCharts();
                                                }
                                            }
                                        );

                                        $rootScope.$on(
                                            "jsChart.moved",
                                            function(event,data) {
                                                console.log( "Responding to event ---------",data );
                                                if(data.direction = 'U'){
                                                    scope.moveSavedChartUp(data.chartOrder);
                                                }
                                                else if(data.direction = 'D'){
                                                    scope.moveSavedChartDown(data.chartOrder);
                                                }
                                            }
                                        );

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


                                        var  renderJSCharts  = function (){
                                            scope.jsCharts = [];
                                            for(var i=0; i < data.newCharts.length ; i++){
                                                var chart = data.newCharts[i];

                                                console.log('chart----------------------------->',chart);
                                                var msChartPlaceHolderId = 'chart-'.concat(i);
                                                //newScope = scope.$new();

                                                var tearsheet = {
                                                    type: 'stock',
                                                    isChartTitle: true,
                                                    isMainChart : chart.isMainChart,
                                                    chartSetting: chart.settings,
                                                    mnemonicId: scope.mnemonicid,
                                                    itemId: scope.itemid,
                                                    chartOrder : i
                                                };
                                                scope.jsCharts.push({
                                                    tearsheet : tearsheet,
                                                    msChartPlaceHolderId : msChartPlaceHolderId,
                                                    title : chart.settings.companyName
                                                });
                                                //html = '<ms-chart-placeholder class="chart" id="' + msChartPlaceHolderId + '" title="' + chart.settings.companyName + '" tearsheet="tearsheet" ></ms-chart-placeholder>';

                                                //el.find('#ms-chart-container').append($compile(html)(newScope));

                                            }
                                        }
                                        renderJSCharts();
                                    }
                                    //Creating Legacy Charts
                                    console.log('data-------------------------->>',data);
                                    if(data.legacyCharts)
                                    {
                                        angular.forEach(data.legacyCharts, function(chart)
                                        {
                                            var msChartPlaceHolderId = 'chart-'.concat(++idCount);

                                            newScope = scope.$new();
                                            newScope.tearsheet = {
                                                type: 'image',
                                                url: chart.url,
                                                isChartTitle: true
                                            };

                                            html += '<ms-chart-placeholder id="'+msChartPlaceHolderId+'" title="" tearsheet="tearsheet"></ms-chart-placeholder>';
                                            el.find('#ms-chart-container').append($compile(html)(newScope));
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