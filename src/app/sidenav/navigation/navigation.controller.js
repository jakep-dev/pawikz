(function ()
{
    'use strict';

    angular
        .module('app.navigation')
        .controller('NavigationController', NavigationController);

    /** @ngInject */
    function NavigationController($scope, store, navConfig, commonBusiness)
    {
        var vm = this;

        navConfig.sideNavItems = [];
        vm.userName = '';
        vm.sideNavItems = navConfig.sideNavItems;

        // Data
        vm.msScrollOptions = {
            suppressScrollX: true
        };

        var userDetails = store.get('user-info');

        if(userDetails){
            vm.userName = userDetails.fullName;
        }

    }

})();


