(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('msChartPlaceHolderController', msChartPlaceHolderController)
        .directive('msChartPlaceholder', msChartPlaceholderDirective);

    /** @ngInject */
    function msChartPlaceHolderController($scope, $element, $compile, dialog)
    {
        var vm = this;
        var type = $scope.$parent.type;
        vm.title = $scope.title;
        vm.id = $scope.id;

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

            dialog.custom($scope.title, $('#' + id)[0].innerHTML, event, action);
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
    function msChartPlaceholderDirective()
    {
        return {
            restrict: 'E',
            scope: {
                title: '@',
                id: '@'
            },
            controller: 'msChartPlaceHolderController',
            controllerAs: 'vm',
            templateUrl: 'app/core/directives/ms-chart/ms-chart-placeholder/ms-chart-placeholder.html'
        };
    }

})();