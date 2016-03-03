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
        vm.title = $scope.tearsheet.chartSetting ? $scope.tearsheet.chartSetting.chartTitle: '';
        vm.id = $scope.id;
        vm.isChartTitle = $scope.tearsheet.isChartTitle;

        console.log('Placeholder Scope');
        console.log($scope);

        vm.addChart = addChart;
        vm.removeChart = removeChart;
        vm.maximizeChart = maximizeChart;
        vm.ResetChart = resetChart;
        vm.saveChart = saveChart;

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
            console.log('itemId--------------------------------',$scope.tearsheet,itemId);
            vm.saveChartSettings(stockString,periodValue, splitsValue, earningsValue, dividendsValue, start_date, end_date, companyId, chartTitle, mnemonic, itemId,stepId, projectId);

        }

        vm.saveChartSettings = function (stockString, selectedPeriod, splits, earnings, dividends, start_date, end_date, companyId, chartTitle, mnemonic, itemId,stepId, projectId) {
            stockService
                .saveChartSettings(stockString, selectedPeriod, splits, earnings, dividends, start_date, end_date, companyId, chartTitle, mnemonic, itemId,stepId, projectId)
                .then(function(data) {
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
                    var ele = $('#ms-chart-container');
                    var newScope = $scope.$parent.$new();
                    var html = '<ms-chart-placeholder id="stock-2" title="Chart Name 2  "></ms-chart-placeholder>';
                    ele.append($compile(html)(newScope));
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
                title: '@',
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

                            newScope.chartsetting = scope.tearsheet.chartSetting;
                            newScope.mnemonicid = scope.tearsheet.mnemonicId;
                            newScope.itemid = scope.tearsheet.itemId;

                            html = '<ms-stock-chart></ms-stock-chart>';
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