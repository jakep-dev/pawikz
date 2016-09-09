(function () {
    'use strict';

    angular
        .module('app.core')
        .controller('msChartPlaceHolderController', msChartPlaceHolderController)
        .directive('msChartPlaceholder', msChartPlaceholderDirective);

    /** @ngInject */
    function msChartPlaceHolderController($rootScope, $scope, dialog, $mdDialog, commonBusiness) {
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
        vm.resetChart = resetChart;
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
            if($scope.chart && $scope.chart.filterState && $scope.chart.filterState.title)
			{			
				$scope.chart.filterState.title = vm.title;
			} 
			else if ($scope.chart && $scope.chart.title) 
			{
				$scope.chart.title = vm.title;
			}
            if(!vm.isMainChart){
                commonBusiness.emitMsg('autosave');
            }
        }
        });

		if( $scope.chart && $scope.chart.filterState && $scope.chart.filterState.chart_id )
		{
			$scope.chart.filterState.chart_id = vm.id;
		}


        //@@TODO - For Testing
        vm.isStockChart = ($scope.chart && $scope.chart.tearsheet && !$scope.chart.tearsheet.isMainChart && $scope.chart.tearsheet.type &&
                $scope.chart.tearsheet.type=="image") ? true : false;

        //Reset the chart functionality.
        function resetChart(id, event) {
            //Confirmation Popup
            dialog.confirm('Would you like to delete?', 'All the changes made in this session will be deleted. Please confirm.',event, {
                ok: {
                    name: 'yes',
                    callBack: function () {
                        vm.onChartReset($scope.index);
                    }
                },
                cancel:{
                    name:'no',
                    callBack:function(){
                        return false;
                    }
                }
            });
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

            var position = $('#main').position();
            var width = $('#main').width() * .98;
            var html;

            $scope.hideFilters = true;
            switch ($scope.chart.tearsheet.type) {
                case 'stock':
                    html = '<ms-stock-chart chart-id="id" item-id="chart.tearsheet.itemId" ' +
                            'mnemonic-id="chart.tearsheet.mnemonicId" filter-state="chart.filterState" ' +
                            'hide-filters="hideFilters"></ms-stock-chart>';
                    break;

                case 'image':
                    html = '<ms-image-chart url="' + $scope.chart.tearsheet.url + '"></ms-image-chart>';
                    break;

                case 'bar':
                    break;
            }

            $mdDialog.show({
                scope: $scope,
                template: '<md-dialog flex="80" style="background: white; top: ' + position.top + 'px; left: ' + position.left + 'px; min-width:' + width + 'px">' +
                '<md-dialog-actions style="order:1 !important;">' +
                '    <md-button ng-click="closeDialog()" class="pull-right" > X' +
                '    </md-button>' +
                '  </md-dialog-actions>' +
                '  <md-dialog-content>' + html + '</md-dialog-content>' +
                '</md-dialog>',
                preserveScope:true,
                animate: 'full-screen-dialog',
                clickOutsideToClose:true,
                controller: function DialogController($scope, $mdDialog) {
                    $scope.closeDialog = function () {
                        $mdDialog.hide();
                    };
                    $scope.hideFiltters = true;
                }
            });

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
        function removeChart(id, event) {
            dialog.confirm('Would you like to delete?', 'Selected Stock chart will be deleted. Please confirm.',event, {
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
							vm.disableTitle = true;
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