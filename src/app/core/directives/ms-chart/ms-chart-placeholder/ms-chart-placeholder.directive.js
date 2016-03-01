(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('msChartPlaceHolderController', msChartPlaceHolderController)
        .directive('msChartPlaceholder', msChartPlaceholderDirective);

    /** @ngInject */
    function msChartPlaceHolderController($scope, $element, $compile, dialog, $mdDialog)
    {
        var vm = this;
        var type = $scope.$parent.type;
        vm.title = $scope.title;
        vm.id = $scope.id;
        vm.isChartTitle = $scope.tearsheet.isChartTitle;

        console.log('Placeholder Scope');
        console.log($scope);

        vm.addChart = addChart;
        vm.removeChart = removeChart;
        vm.maximizeChart = maximizeChart;
        vm.ResetChart = resetChart;

        //Reset the chart functionality.
        function resetChart()
        {

        }

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

        /*
        function maximizeChart() {
            var elementWrapper = {};
            elementWrapper.target = document.getElementById('content');
            var position = $('#content').position();
            var width = $('#content').width();
            $mdDialog.show({
                targetEvent: elementWrapper,
                locals:{
                },
                template:
                '<md-dialog flex style="width: 100%; height: 100%">' +
                '<md-toolbar>'+
                '<div class="md-toolbar-tools">'+
                '<h2>Chart Details</h2>'+
                '<span flex></span>'+
                '<md-button class="md-icon-button" ng-click="cancel()">'+
                '<md-icon md-font-icon="icon-close">'+
                '</md-button>'+
                '</div>'+
                '</md-toolbar>'+
                '<md-dialog-content><ms-stock-chart></ms-stock-chart></md-dialog-content>'+
                '</md-dialog>',
                controller: function DialogController($scope, $mdDialog) {
                    $scope.cancel = function() {
                        $mdDialog.hide();
                    };
                    $scope.hideFilter = true;

                }
            });
        };
        */

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
                console.log('Inside Chart Place Holder');
                console.log(scope);
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