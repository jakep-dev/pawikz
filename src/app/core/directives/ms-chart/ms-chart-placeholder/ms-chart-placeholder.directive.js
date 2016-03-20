(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('msChartPlaceHolderController', msChartPlaceHolderController)
        .directive('msChartPlaceholder', msChartPlaceholderDirective);

    /** @ngInject */
    function msChartPlaceHolderController($rootScope, $scope, $element, $compile, dialog, $mdDialog, stockChartBusiness, stockService, commonBusiness)
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
            $scope.filterState.endDate = new Date();
            $scope.filterState.interval ='3Y';

            var d = new Date();
            d.setFullYear(d.getFullYear() - 3);
            $scope.filterState.startDate=d;
            //$scope.onFilterStateUpdate();

            $scope.filterState.splits='N';
            $scope.filterState.earnings='N';
            $scope.filterState.dividends='N';
            $scope.filterState.mainStock='';
            $scope.filterState.selectedPeers=[];
            $scope.filterState.selectedIndices=[];

            $scope.$broadcast('filterSateUpdate');
        }

        //swap chart position
        function swapChart(direction){
            if($scope.tearsheet.type ==='stock'){
                $rootScope.$emit( "jsChart.moved",{ direction : direction, chartOrder : $scope.tearsheet.chartOrder});
            }
        };
        //save chart function
        function saveChart(){
            var splitsValue = $scope.filterState.splits == true ? 'Y': 'N';
            var earningsValue = $scope.filterState.earnings == true ? 'Y': 'N';
            var dividendsValue = $scope.filterState.dividends == true ? 'Y': 'N';
            var periodValue = $scope.filterState.interval;
            var mainStock = $scope.filterState.mainStock;
            var selectedPeerList = $scope.filterState.selectedPeers;
            var selectedIndicesList =  $scope.filterState.selectedIndices;
            var chart_id = $scope.filterState.chart_id;
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
            var from = $scope.filterState.startDate;
            var to = $scope.filterState.endDate;
            start_date = from.getFullYear() + '-' + (from.getMonth()+1) + '-' + from.getDate();
            end_date = to.getFullYear() + '-' + (to.getMonth()+1) + '-' + to.getDate();
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
                    console.log('chart saved ', response);
                    if(!$scope.filterState.chart_id && response && response.data && response.data.length > 0){
                        //update chart id
                        $scope.filterState.chart_id = response.data[0].chartId;
                    }
                });
        };

        //Maximize the chart
        function maximizeChart() {
            var elementWrapper = {};
            elementWrapper.target = document.getElementById('content');
            var position = $('#content').position();
            var width = $('#content').width();
            var html;
            switch ($scope.tearsheet.type)
            {
                case 'stock':
                    html = '<ms-stock-chart chart-id="id" item-id="tearsheet.itemId" mnemonic-id="tearsheet.mnemonicId" filter-state="filterState"></ms-stock-chart>';
                    break;

                case 'image':
                    html = '<ms-image-chart url="'+ $scope.tearsheet.url +'"></ms-image-chart>';
                    break;

                case 'bar':
                    break;
            }

            $mdDialog.show({
                targetEvent: elementWrapper,
                scope: $scope,
                template:
                '<md-dialog flex="100" style="position: absolute; top: '+ position.top+'px; left: '+ position.left+'px; min-width:'+width+'px">' +
                '<md-dialog-actions>' +
                '    <md-button ng-click="closeDialog()" class="md-primary pull-right" > X' +
                '    </md-button>' +
                '  </md-dialog-actions>' +
                '  <md-dialog-content>'+ html+'</md-dialog-content>'+
                '</md-dialog>',
                onComplete: afterShowAnimation,
                animate: 'full-screen-dialog',
                controller: function DialogController($scope, $mdDialog) {
                    $scope.closeDialog = function() {
                        $mdDialog.hide();
                    };
                }
            });
            // When the 'enter' animation finishes...
            function afterShowAnimation(scope, element, options) {
                // post-show code here: DOM element focus, etc.
            }
        };

        //to determine whether chart panel to be shown
        function toBeShown(){
            console.log('tobeshown',this.chartIndex,typeof this.chartIndex);
            return this.chartIndex < 5;
        }

        //Add new chart.
        function addChart() {
            var self =this;
            var chartIndex = $('.chart').length;
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
            if($scope.tearsheet.type ==='stock'){
                $rootScope.$emit( "jsChart.removed", $scope.tearsheet.chartOrder);
            }
            else {
                $('#' + id).remove();
            }

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
            link:function(scope, el, attrs ,vm)
            {
                //calculate unique identifier for each palceholder loaded in dom
                var  id = $('.chart').index($(el)),
                    chartId= 'chart-'+id;
                $(el).attr('id',chartId).attr('ng-if','vm.tobeShown()');
                vm.id = chartId;
                vm.chartIndex = id;
                console.log('chartIndex',chartId,vm);
                // $compile(el)(scope);


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
                    el.find('#ms-chart-placeholder-content').append($compile(html)(scope));
                }

            }
        };
    }

})();