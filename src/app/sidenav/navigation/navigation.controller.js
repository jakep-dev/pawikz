(function ()
{
    'use strict';

    angular
        .module('app.navigation')
        .controller('NavigationController', NavigationController);

    /** @ngInject */
    function NavigationController(navConfig)
    {
        var vm = this;

        navConfig.sideNavItems = [];

        vm.sideNavItems = navConfig.sideNavItems;

        // Data
        vm.msScrollOptions = {
            suppressScrollX: true
        };


    }

})();


