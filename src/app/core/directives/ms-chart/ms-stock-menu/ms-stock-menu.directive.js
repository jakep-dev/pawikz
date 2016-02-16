(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('msStockMenuController',msStockMenuController)
        .directive('msStockMenu', msStockMenuDirective);


    function msStockMenuController($mdSidenav) {
        var vm = this;
        vm.toggleSidenav = toggleSidenav;
        vm.hideMenu = hideMenu;

        //Toggle Sidenav
        function toggleSidenav(sidenavId) {
            $mdSidenav(sidenavId).toggle();
        };

        function hideMenu() {
            if($('.md-open-menu-container')) {
                $('.md-open-menu-container').hide();
            }
        };
    }


    /** @ngInject */
    function msStockMenuDirective()
    {
        return {
            restrict: 'E',
            scope : {
                'saveChart' :'=',
                'maximizeChart' : '=',
                'chartFilterState' : '='
            },
            templateUrl: 'app/core/directives/ms-chart/ms-stock-menu/ms-stock-menu.html',
            controller : 'msStockMenuController',
            controllerAs : 'vm',
            bindToController :true
        };
    }
})();