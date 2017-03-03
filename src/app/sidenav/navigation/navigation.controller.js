(function ()
{
    'use strict';

    angular
        .module('app.navigation')
        .controller('NavigationController', NavigationController);

    /** @ngInject */
    function NavigationController($scope, navConfig, commonBusiness)
    {
        var vm = this;

        navConfig.sideNavItems = [];
        vm.userName = '';
        vm.sideNavItems = navConfig.sideNavItems;

        // Data
        vm.msScrollOptions = {
            suppressScrollX: true
        };

        commonBusiness.onMsg('UserFullName', $scope, function(ev, data) {
            vm.userName = data;
        });

    }

})();


