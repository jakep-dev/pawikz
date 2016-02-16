(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('msStockSavedMenuController', msStockSavedMenuController)
        .directive('msStockSavedMenu', msStockSavedMenuDirective);

    /** @ngInject */
    function msStockSavedMenuController($mdSidenav) {
        var vm = this;

    }

    /** @ngInject */
    function msStockSavedMenuDirective()
    {
        return {
            restrict: 'E',
            scope : {
                removeSavedChart : '=',
                moveSavedChartDown : '=',
                moveSavedChartUp : '=',
                savedStockChart : '=',
                chartFilterState : '=',
                maximizeSavedChart : '='
            },
            templateUrl: 'app/core/directives/ms-chart/ms-stock-saved-menu/ms-stock-saved-menu.html',
            controller : 'msStockSavedMenuController',
            controllerAs : 'vm',
            bindToController :true
        };
    }
})();