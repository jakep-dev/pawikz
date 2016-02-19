(function ()
{
    'use strict';

    angular
        .module('app.core')
        .directive('msStockChart', msStockChartDirective);

    /** @ngInject */
    function msStockChartDirective()
    {
        return {
            restrict: 'E',
            scope   : {

            },
            templateUrl: 'app/core/directives/ms-chart/ms-stock-chart/ms-stock-chart.html'
        };
    }

})();