(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('msFinancialChartController', msFinancialChartController)
        .directive('msFinancialChart', msFinancialChartDirective);

    function msFinancialChartController($scope, financialChartService, commonBusiness, financialChartBusiness) {
        var vm = this;
        vm.selectedIndex = "";
        vm.searchVal = '';
        vm.searchedStocks = [];
        vm.selectedStockCount = 1;
        vm.companyId = commonBusiness.companyId;

        vm.onFilterStateUpdate = function () {
            loadChartData();
            vm.onChartSave();
        };

        $scope.$on('filterSateUpdate', function (event) {
            $scope.$broadcast('resetEvents');
            loadChartData();
        });

        function loadChartData() {
            var filterState = vm.filterState;
            vm.fetchChartData(filterState.compareNames, filterState.compareIds, vm.companyId, filterState.chartMode, filterState.chartType, filterState.chartTypeLabel, filterState.chartPeriod, filterState.isCustomDate, filterState.startDate, filterState.endDate);
        }

        function groupChartData(data) {

            var dateList = new Array();
            var dateArr = new Array();
            var ratioNames = new Array();
            var ratioNameArr = new Array();
            var currentList;
            var currentObj;
            var dateValue;
            var value;
            var datasets = new Array();
            var seriesSet = new Array();

            if (Array.isArray(data)) {
                data.forEach(function (chartSetting) {
                    if (chartSetting.ratio_name) {
                        if (!ratioNames[chartSetting.ratio_name]) {
                            currentObj = new Object();
                            currentObj._count = 1;
                            currentObj.data = new Array();
                            ratioNames[chartSetting.ratio_name] = currentObj;
                            ratioNameArr.push(chartSetting.ratio_name);
                        } else {
                            currentObj = ratioNames[chartSetting.ratio_name];
                            currentObj._count = currentObj._count + 1;
                        }
                    }
                    if (chartSetting.datadate) {
                        dateValue = chartSetting.datadate.substring(0, 10);
                        if (!dateList[dateValue]) {
                            dateArr.push(dateValue);
                            currentList = new Array();
                            currentList[chartSetting.ratio_name] = parseFloat(chartSetting.ratio_value);
                            dateList[dateValue] = currentList;
                        } else {
                            currentList = dateList[dateValue];
                            if (chartSetting.ratio_name) {
                                if (!currentList[chartSetting.ratio_name]) {
                                    currentList[chartSetting.ratio_name] = parseFloat(chartSetting.ratio_value);
                                } else {
                                    console.log('Duplicate chart value for the same ratio_name and datadate.[' + dateValue + ',' + chartSetting.ratio_name + ']');
                                }
                            }
                        }
                    }
                });
            }

            dateArr.sort();
            dateArr.forEach(function (dataDate) {
                currentList = dateList[dataDate];
                ratioNameArr.forEach(function (ratioName) {
                    currentObj = ratioNames[ratioName];
                    value = currentList[ratioName];
                    if (value) {
                        currentObj.data.push(value);
                    } else {
                        console.log('Missing ' + ratioName + ' value for datadate ' + dataDate);
                        currentObj.data.push(null);
                    }
                });
            });

            ratioNameArr.forEach(function (ratioName) {
                currentObj = ratioNames[ratioName];
                datasets.push({
                    name: ratioName,
                    data: currentObj.data,
                    type: "spline",
                    valueDecimals: 1
                });
                seriesSet.push({
                    data: currentObj.data,
                    name: ratioName
                });
            });
            return {
                dateList: dateList,
                ratioNameArr: ratioNameArr,
                ratioNames: ratioNames,
                xData: dateArr,
                name: "",
                yaxisTitle: "",
                xaxisTitle: "",
                datasets: datasets,
                series: seriesSet,
                type: "spline",
                valueDecimals: 1,
                showlegend: true,
                showxaxisLabel: true,
                showtooltip: true,
                spacingTop: 30,
            };
        }

        vm.fetchChartData = function (compareNames, compareIds, companyId, singleMultiple, ratioSelect, chartTypeLabel, timePeriod, isCustomDate, startDate, endDate) {
            var yAxisLabel = chartTypeLabel;
            financialChartService.financialData(financialChartBusiness.getFinancialDataInputObject(compareNames, compareIds, companyId, singleMultiple, ratioSelect, timePeriod, isCustomDate, startDate, endDate))
                .then(function (data) {
                    //console.log(data);
                    //$scope.$emit('ticker', { 'ticker': data.stockChartPrimaryData[0].ticker });
                    vm.financialDataSet = groupChartData(data);
                    vm.financialDataSet.yaxisTitle = yAxisLabel;
                }
            );
        };

        loadChartData();

        vm.onPeerRemove = function (peer) {
        };
    }

    /** @ngInject */
    function msFinancialChartDirective() {
        return {
            restrict: 'E',
            //require: 'msStockChartToolBar',
            scope: {
                filterState: '=',
                mnemonicId: '=',
                itemId: '=',
                chartId: '=',
                hideFilters: '=',
                onChartSave: '='
            },
            templateUrl: 'app/core/directives/ms-chart/ms-financial-chart/ms-financial-chart.html',
            controller: 'msFinancialChartController',
            controllerAs: 'vm',
            bindToController: true
        };
    }

})();