(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('msChartPlaceHolderController', msChartPlaceHolderController)
        .directive('msChartPlaceholder', msChartPlaceholderDirective);


    function msChartPlaceHolderController($scope)
    {
        var vm = this;
        vm.title = $scope.title;

        //Need to have watch to save title auto-save feature.
        //Code should go into ms-chart-business.
    }

    /** @ngInject */
    function msChartPlaceholderDirective()
    {
        return {
            restrict: 'E',
            scope: {
                title: '@'
            },
            controller: 'msChartPlaceHolderController',
            controllerAs: 'vm',
            templateUrl: 'app/core/directives/ms-chart/ms-chart-placeholder/ms-chart-placeholder.html'
        };
    }

})();