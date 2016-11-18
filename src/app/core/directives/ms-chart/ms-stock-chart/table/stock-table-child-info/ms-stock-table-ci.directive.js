(function ()
{
    'use strict';

    angular
        .module('app.core')
        .directive('msStockTableCi', msStockTableCiDirective);

    function msStockTableCiDirective()
    {
        return {
            restrict: 'E',
            transclude: true,
            templateUrl: 'app/core/directives/ms-chart/ms-stock-chart/table/stock-table-child-info/ms-stock-table-ci.html'
        };
    }



})();