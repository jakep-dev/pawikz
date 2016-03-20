(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('msChartPlaceHolderController', msChartPlaceHolderController)
        .directive('msChartPlaceholder', msChartPlaceholderDirective);

    /** @ngInject */
    function msChartPlaceHolderController($scope, $element, $compile, dialog, $mdDialog, stockChartBusiness, stockService, commonBusiness)
    {
        var vm = this;
        var type = $scope.$parent.type;

        vm.title = $scope.title;
        console.log(' vm.title--------------------->', vm.title);
        vm.id = $scope.id;
        vm.isChartTitle = vm.title ? true :  false;
        vm.isMainChart = ($scope.tearsheet && $scope.tearsheet.isMainChart) ? true :  false;


        vm.addChart = addChart;
        vm.removeChart = removeChart;
        vm.maximizeChart = maximizeChart;
        vm.ResetChart = resetChart;
        vm.saveChart = saveChart;

        vm.swapChart = swapChart;
        vm.saveChartSettings = saveChartSettings;


        //Reset the chart functionality.
        function resetChart()
        {

        }
        //save chart function
        function saveChart(){
            console.log('save chart');
            var splitsValue = stockChartBusiness.splits == true ? 'Y': 'N';
            var earningsValue = stockChartBusiness.earnings == true ? 'Y': 'N';
            var dividendsValue = stockChartBusiness.dividends == true ? 'Y': 'N';
            var periodValue = stockChartBusiness.interval;
            var mainStock = stockChartBusiness.mainStock;
            var selectedPeerList = stockChartBusiness.selectedPeers;
            var selectedIndicesList =  stockChartBusiness.selectedIndices;
            var stockString = '';
            if (mainStock)  {
                stockString = mainStock + ',';
            }

            selectedPeerList.forEach( function(stock) {
                stockString =stockString + stock + ',';
            });

            selectedIndicesList.forEach( function(indics) {
                stockString = stockString + '^'+indics + ',';
            });


            if(stockString !=='') {
                stockString = stockString.slice(0, -1);
            }
            var start_date, end_date;
            var from = stockChartBusiness.startDate;
            var to = stockChartBusiness.endDate;
            if (periodValue ==='CUSTOM') {
                start_date = from.getFullYear() + '-' + (from.getMonth()+1) + '-' + from.getDate();
                end_date = to.getFullYear() + '-' + (to.getMonth()+1) + '-' + to.getDate();
            }
            var chartTitle = $scope.tearsheet.chartSetting.chartTitle;
            var mnemonic = $scope.tearsheet.mnemonicId;
            var itemId = $scope.tearsheet.itemId;
            var companyId = commonBusiness.companyId;
            var projectId = commonBusiness.projectId;
            var stepId = commonBusiness.stepId;

            vm.saveChartSettings(stockString,periodValue, splitsValue, earningsValue, dividendsValue, start_date,
                end_date, companyId, chartTitle, mnemonic, itemId,stepId, projectId, chart_id);

        }

         function saveChartSettings(stockString, selectedPeriod, splits, earnings, dividends, start_date, end_date, companyId, chartTitle, mnemonic, itemId,stepId, projectId, chart_id) {
            stockService
                .saveChartSettings(stockString, selectedPeriod, splits, earnings, dividends, start_date, end_date, companyId, vm.title, mnemonic, itemId,stepId, projectId, chart_id)
                .then(function(response) {
                    //chart saved;
                    console.log('chart saved ');
                });
        };

        //Maximize the chart
        function maximizeChart(id, event)
        {
            var action = {
              ok:{
                  name: 'Close',
                  callBack: ''
              }
            };
            console.log('Dialog')
            console.log($('#' +id));

            dialog.custom($scope.title, 'Inject Dynamic Chart', event, action);
        }

        //Add new chart.
        function addChart() {
            switch (angular.lowercase(type)) {
                case 'stock':

                    if (chartIndex < 5){ //limit the chart count
                        var ele = $('#ms-chart-container');
                            var newScope = $scope.$parent.$new();

                            $scope.tearsheet.chartSetting.selectedPeriod = $scope.filterState.interval;
                            $scope.tearsheet.chartSetting.date_start = $scope.filterState.startDate;
                            $scope.tearsheet.chartSetting.date_end = $scope.filterState.endDate;
                            newScope.tearsheet = {
                                type: 'stock',
                                isChartTitle: true,
                                chartSetting: angular.copy($scope.tearsheet.chartSetting),
                                mnemonicId: $scope.tearsheet.mnemonicId,
                                itemId: $scope.tearsheet.itemId
                            };
                            newScope.title = vm.title;
                            var msChartPlaceHolderId = '1';
                            var html = '<ms-chart-placeholder id="chart-' + chartIndex + '" class="chart" title="title" tearsheet="tearsheet"></ms-chart-placeholder>';

                            ele.find('#chart-0').after($compile(html)(newScope));
                    }else
                        dialog.alert( 'Error',"Max5 charts could be added!",null, {ok:{name:'ok',callBack:function(){
                            console.warn('excess chart tried to be added');
                        }}});
                    break;
                default:
                    break;
            }
        }

        ///Remove selected chart.
        function removeChart(id)
        {
            console.log(id);
            $('#' + id).remove();
        }


        //Need to have watch to sa~ve title auto-save feature.
        //Code should go into ms-chart-business.
    }

    /** @ngInject */
    function msChartPlaceholderDirective($compile)
    {
        return {
            restrict: 'E',
            scope: {
                title: '=',
                id: '@',
                tearsheet: '='
            },
            controller: 'msChartPlaceHolderController',
            controllerAs: 'vm',
            templateUrl: 'app/core/directives/ms-chart/ms-chart-placeholder/ms-chart-placeholder.html',
            link:function(scope, el)
            {
                console.log('Inside Chart Place Holder-----------',scope.tearsheet);
                if(scope.tearsheet)
                {
                    var html = '';
                    var newScope = scope.$new();

                    switch (scope.tearsheet.type)
                    {
                        case 'stock':
                            scope.filterState = {};
                            scope.filterState.splits = scope.tearsheet.chartSetting.isSplits;
                            scope.filterState.earnings = scope.tearsheet.chartSetting.isEarnings;
                            scope.filterState.dividends = scope.tearsheet.chartSetting.isDividents;
                            scope.filterState.interval = scope.tearsheet.chartSetting.selectedPeriod;
                            scope.filterState.mainStock = '';
                            scope.filterState.selectedIndices = scope.tearsheet.chartSetting.selectedIndicesList;
                            scope.filterState.selectedPeers = scope.tearsheet.chartSetting.selectedPeerList;
                            scope.filterState.chart_id = scope.tearsheet.chartSetting.chart_id;
                            scope.filterState.chart_date = scope.tearsheet.chartSetting.chart_date;
                            scope.filterState.date_start = scope.tearsheet.chartSetting.date_start;
                            scope.filterState.date_end = scope.tearsheet.chartSetting.date_end;
                            scope.filterState.title = scope.title;
                            html = '<ms-stock-chart chart-id="id" item-id="tearsheet.itemId" mnemonic-id="tearsheet.mnemonicId" filter-state="filterState"></ms-stock-chart>';
                            break;

                        case 'image':
                            html = '<ms-image-chart url="'+ scope.tearsheet.url +'"></ms-image-chart>';
                            break;

                        case 'bar':
                            break;
                    }

                    el.find('#ms-chart-placeholder-content').append($compile(html)(newScope));
                }

            }
        };
    }

})();