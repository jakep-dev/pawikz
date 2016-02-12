(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('msChartController', msChartController)
        .directive('msChart', msChartDirective);

    /** @ngInject */
    function msChartController(dialog, $mdSidenav, $mdDialog, stockService) {
        var vm = this;

        vm.saveChart = saveChart;
        vm.removeSavedChart = removeSavedChart;
        vm.moveSavedChartUp = moveSavedChartUp;
        vm.moveSavedChartDown = moveSavedChartDown;
        vm.maximizeChart = maximizeChart;
        vm.toggleSidenav = toggleSidenav;
        vm.getSavedCharts = getSavedCharts;

        //variables
        vm.chartFilterState = {
            mainStock : "TSLA",
            companyName : 'TSLA',
            selectedPeriod : '3Y',
            selectedIndicesList : [],
            selectedPeerList : [],
            searchedStocks : [],
            isSplits : false,
            isEarnings : false,
            isDividents : false,
            to: {},
            from: {},
            eventOptionVisibility : false,
            dateOptionVisibility : false,
            comparisonOptionVisibility : false
        };

        //hard coded break grounds
        vm.savedStockCharts = [];

        //methods
        function saveChart() {
            if(vm.savedStockCharts.length < 5){
                vm.savedStockCharts.unshift(angular.copy(vm.chartFilterState));
            }
            else {
                // as length is already five we will override last chart
                dialog.alert( 'Error',"We can not save more then 5 charts!",null,'alertId',{ok:{name:'ok',callBack:function(){
                    console.log('clicked ok');
                }}});
            }
        };

        function removeSavedChart(chart) {
            var index = vm.savedStockCharts.indexOf(chart);
            if(index !== -1) {
                vm.savedStockCharts.splice(index, 1)
            }
        };

        function moveSavedChartUp(chart){
            var index = vm.savedStockCharts.indexOf(chart);
            //item is not at first index so we can re arrenge it
            if(index !== 0) {
                var temp = vm.savedStockCharts[index -1];
                vm.savedStockCharts[index -1] =  vm.savedStockCharts[index];
                vm.savedStockCharts[index] = temp;
            }
        };

        function moveSavedChartDown(chart){
            var index = vm.savedStockCharts.indexOf(chart);
            //item is not at last index so we can re arrenge it
            if(index !== -1 && index+1 !== vm.savedStockCharts.length) {
                var temp = vm.savedStockCharts[index+1];
                vm.savedStockCharts[index+1] =  vm.savedStockCharts[index];
                vm.savedStockCharts[index] = temp;
            }

        };

        function maximizeChart(chartFilterState) {
            var elementWrapper = {};
            elementWrapper.target = document.getElementById('content');
            var position = $('#content').position();
            var width = $('#content').width();
            $mdDialog.show({
                targetEvent: elementWrapper,
                locals:{
                    chartFilterState: chartFilterState
                },
                template:
                '<md-dialog flex="100" style="position: absolute; top: '+ position.top+'px; left: '+ position.left+'px; min-width:'+width+'px">' +
                '<md-dialog-actions>' +
                '    <md-button ng-click="closeDialog()" class="md-primary pull-right" > X' +
                '    </md-button>' +
                '  </md-dialog-actions>' +
                '  <md-dialog-content><ms-stock-chart-with-filter chart-filter-state="chartFilterState" hide-filters = "hideFilter"></ms-stock-chart-with-filter>'+
                '</md-dialog>',
                onComplete: afterShowAnimation,
                animate: 'full-screen-dialog',
                controller: function DialogController($scope, $mdDialog, chartFilterState) {
                    $scope.closeDialog = function() {
                        $mdDialog.hide();
                    };
                    $scope.chartFilterState = chartFilterState;
                    $scope.hideFilter = true;
                }
            });
            // When the 'enter' animation finishes...
            function afterShowAnimation(scope, element, options) {
                // post-show code here: DOM element focus, etc.
            }
        };

        //Toggle Sidenav
        function toggleSidenav(sidenavId) {
            $mdSidenav(sidenavId).toggle();
        }

        vm.selectedStockCount = 1;
        //get list of saved charts.
        vm.oldSavedCharts = [];
        function getSavedCharts() {
            //hard coded for now
            stockService
                .getSavedChartData(100168041, 3, 'WU_STOCK_CHART_3YR', 'WU_STOCK_CHART_3YR_EM')
                .then(function(data) {
                    if(data  && data.savedChartList) {
                        data.savedChartList.forEach(function (savedChart) {
                            if (savedChart.chartType  === 'IMGURL'){
                                vm.oldSavedCharts.push(savedChart);
                            }
                            else  if (savedChart.chartType  === 'JSCHART'){
                                var chart = {};
                                chart.chartType = 'JSCHART';
                                chart.settings = {
                                    mainStock : "",
                                    companyName : savedChart.chartSetting.chart_title,
                                    selectedPeriod : savedChart.chartSetting.period.toUpperCase(),
                                    selectedIndicesList : [],
                                    selectedPeerList : [],
                                    searchedStocks : [],
                                    to: {},
                                    from: {},
                                    isSplits : (savedChart.chartSetting.dividends === 'Y')? true : false,
                                    isEarnings : (savedChart.chartSetting.earnings === 'Y')? true : false,
                                    isDividents : (savedChart.chartSetting.splits === 'Y')? true : false,
                                    eventOptionVisibility : false,
                                    dateOptionVisibility : false,
                                    comparisonOptionVisibility : false
                                };
                                var peers = savedChart.chartSetting.peers.split(',');
                                for (var i = 0; i < peers.length;  i++) {
                                    var peer = peers[i].trim();
                                    if(peer.charAt(0) === '^') {
                                        chart.settings.selectedIndicesList.push(peer.substring(1, peer.length));
                                    }
                                    else {
                                        chart.settings.selectedPeerList.push(peer);
                                    }
                                }
                                if (savedChart.chartSetting.date_start) {
                                    var dateStart = savedChart.chartSetting.date_start.split('-');
                                    chart.settings.from = {
                                        year : dateStart[0],
                                        month : dateStart[1],
                                        date : dateStart[2]
                                    };
                                }
                                if (savedChart.chartSetting.date_end) {
                                    var dateEnd = savedChart.chartSetting.date_end.split('-');
                                    chart.settings.to = {
                                        year : dateEnd[0],
                                        month : dateEnd[1],
                                        date : dateEnd[2]
                                    };
                                }
                                vm.oldSavedCharts.push(chart);
                            }

                        });
                    }
                });
        };

        vm.getSavedCharts();
    }

    /** @ngInject */
    function msChartDirective()
    {
        return {
            restrict: 'E',
            scope : {
            },
            templateUrl: 'app/core/directives/ms-chart/ms-chart/ms-chart.html',
            controller : 'msChartController',
            controllerAs : 'vm',
            bindToController :true
        };
    }
})();