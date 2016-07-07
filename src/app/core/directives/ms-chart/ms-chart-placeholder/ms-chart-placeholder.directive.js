(function () {
    'use strict';

    angular
        .module('app.core')
        .controller('msChartPlaceHolderController', msChartPlaceHolderController)
        .directive('msChartPlaceholder', msChartPlaceholderDirective);

    /** @ngInject */
    function msChartPlaceHolderController($rootScope, $scope, $element, $compile, dialog, $mdDialog, stockChartBusiness, stockService, commonBusiness, $state, $stateParams) {
        var vm = this;
        var type = $scope.$parent.type;
        vm.title = $scope.chartTitle;
        vm.id = $scope.id;
        vm.isChartTitle = vm.title ? true : false;
        vm.isMainChart = ($scope.chart && $scope.chart.tearsheet && $scope.chart.tearsheet.isMainChart) ? true : false;
        $scope.filterState = {};
        vm.addChart = addChart;
        vm.removeChart = removeChart;
        vm.maximizeChart = maximizeChart;
        vm.ResetChart = resetChart;
        vm.saveChart = saveChart;
        vm.swapChart = swapChart;
        vm.onChartSave = $scope.onChartSave;
        vm.onChartReset = $scope.onChartReset;

        if(vm.isMainChart) {
            $scope.$on('ticker', function (event, args) {
                if(vm.title.indexOf(' (' + args.ticker + ')') == -1) {
                    vm.title += ' (' + args.ticker + ')';
                }
            });
        }
        $scope.$watch('vm.title',function(newValue,oldValue){
        if(oldValue!=newValue){
            $scope.chart.filterState.title = vm.title;
        }
        });
        $scope.chart.filterState.chart_id = vm.id;


        //@@TODO - For Testing
        vm.isStockChart = ($scope.chart && $scope.chart.tearsheet && !$scope.chart.tearsheet.isMainChart && $scope.chart.tearsheet.type &&
                $scope.chart.tearsheet.type=="image") ? true : false;

        //Reset the chart functionality.
        function resetChart(id) {
            //Confirmation Popup
            dialog.confirm('All the changes made in this session will be deleted. Please confirm', null,null, {
                ok: {
                    name: 'yes', callBack: function () {
                        vm.onChartReset($scope.index);
                    }
                },
                cancel:{
                    name:'no',callBack:function(){
                        return false;
                    }
                }
            });
            // $state.reload();
            //console.log($state.current);
           // $state.go($state.current, {reloadCount: ($stateParams.reloadCount + 1)});
            /**
             $scope.filterState.endDate = new Date();
             $scope.filterState.interval = '3Y';

             var d = new Date();
             d.setFullYear(d.getFullYear() - 3);
             $scope.filterState.startDate = d;
             //$scope.onFilterStateUpdate();

             $scope.filterState.splits = 'N';
             $scope.filterState.earnings = 'N';
             $scope.filterState.dividends = 'N';
             $scope.filterState.mainStock = '';
             $scope.filterState.selectedPeers = [];
             $scope.filterState.selectedIndices = [];
             $scope.filterState.selectedCompetitors = [];

             $scope.$broadcast('filterSateUpdate');
             **/
        }

        //swap chart position
        function swapChart(direction) {
            //if ($scope.chart.tearsheet.type === 'stock') {
                $scope.chartMoved(direction, $scope.index);
            //}
        };
        //save chart function
        function saveChart() {
            vm.onChartSave();
        }


        //Maximize the chart
        function maximizeChart() {
            var elementWrapper = {};
            elementWrapper.target = document.getElementById('content');
            var position = $('#content').position();
            var width = $('#content').width();
            var html;
            console.log('$scope.chart.tearsheet.type------->', $scope.chart.tearsheet.type);
            $scope.hideFilters = true;
            switch ($scope.chart.tearsheet.type) {
                case 'stock':
                    html = '<ms-stock-chart chart-id="id" item-id="chart.tearsheet.itemId" mnemonic-id="chart.tearsheet.mnemonicId" filter-state="chart.filterState" hide-filters="hideFilters"></ms-stock-chart>';
                    break;

                case 'image':
                    html = '<ms-image-chart url="' + $scope.chart.tearsheet.url + '"></ms-image-chart>';
                    break;

                case 'bar':
                    break;
            }

            $mdDialog.show({
                //targetEvent: elementWrapper,
                scope: $scope,
                template: '<md-dialog flex="80" style="position: absolute;background: white; top: ' + position.top + 'px; left: ' + position.left + 'px; min-width:' + width + 'px">' +
                '<md-dialog-actions style="order:1 !important;">' +
                '    <md-button ng-click="closeDialog()" class="pull-right" > X' +
                '    </md-button>' +
                '  </md-dialog-actions>' +
                '  <md-dialog-content>' + html + '</md-dialog-content>' +
                '</md-dialog>',
                onComplete: afterShowAnimation,
                preserveScope:true,
                animate: 'full-screen-dialog',
                controller: function DialogController($scope, $mdDialog) {
                    $scope.closeDialog = function () {
                        $mdDialog.hide();
                    };
                    $scope.hideFiltters = true;
                }
            });
            // When the 'enter' animation finishes...
            function afterShowAnimation(scope, element, options) {
                // post-show code here: DOM element focus, etc.
            }
        };

        //Add new chart.
        function addChart() {
            var self = this;
            var chartIndex = $('.chart').length;
            switch (angular.lowercase(type)) {
                case 'stock':
                    if (chartIndex < 5) { //limit the chart count
                        var ele = $('#ms-chart-container');

                        var msChartPlaceHolderId = '1';
                        var chartToBeAdded = {
                            tearsheet: {
                                type: 'stock',
                                isChartTitle: true,
                                mnemonicId: $scope.chart.tearsheet.mnemonicId,
                                itemId: $scope.chart.tearsheet.itemId
                            },
                            filterState: angular.copy($scope.chart.filterState),
                            msChartPlaceHolderId: msChartPlaceHolderId,
                            title: $scope.chartTitle
                        }
                        $scope.addNewChart(chartToBeAdded, $scope.index);
                    } else
                        dialog.alert('Error', "Max5 charts could be added!", null, {
                            ok: {
                                name: 'ok', callBack: function () {
                                    console.warn('excess chart tried to be added');
                                }
                            }
                        });

                    break;
                default:
                    break;
            }

            //Calling SaveAll functionality to implement reset functionality
            $rootScope.$broadcast("saveAllChart");
        }

        ///Remove selected chart.
        function removeChart(id) {
            console.log(id);
            dialog.confirm('Selected Stock chart will be deleted. Please confirm.', null,null, {
                ok: {
                    name: 'yes', callBack: function () {
                        if ($scope.chart) {
                            $scope.onChartRemove($scope.index, $scope.chart.tearsheet.type);
                        }
                        else {
                            $('#' + id).remove();
                        }
                    }
                },
                cancel:{
                    name:'no',callBack:function(){
                        return false;
                    }
                }
            });

        }


        //Need to have watch to sa~ve title auto-save feature.
        //Code should go into ms-chart-business.
    }

    /** @ngInject */
    function msChartPlaceholderDirective($compile) {
        return {
            restrict: 'E',
            scope: {
                chartTitle: '=',
                id: '@',
                tearsheet: '=',
                addNewChart: '=',
                index: '=',
                chart: '=',
                chartMoved: '=',
                onChartRemove: '=',
                onChartSave: '=',
                onChartReset:'='
            },
            controller: 'msChartPlaceHolderController',
            controllerAs: 'vm',
            templateUrl: 'app/core/directives/ms-chart/ms-chart-placeholder/ms-chart-placeholder.html',
            link: function (scope, el, attrs, vm) {
                //calculate unique identifier for each palceholder loaded in dom
                var id = $('.chart').index($(el)),
                    chartId = 'chart-' + id;
                $(el).attr('id', chartId).attr('ng-if', 'vm.tobeShown()');
                vm.id = chartId;
                vm.chartIndex = id;

                if (scope.chart && scope.chart.tearsheet) {
                    var html = '';
                    switch (scope.chart.tearsheet.type) {
                        case 'stock':
                            html = '<ms-stock-chart chart-id="vm.id" item-id="chart.tearsheet.itemId" mnemonic-id="chart.tearsheet.mnemonicId" filter-state="chart.filterState"></ms-stock-chart>';
                            break;

                        case 'image':
                            html = '<ms-image-chart url="' + scope.chart.tearsheet.url + '"></ms-image-chart>';
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