(function ()
{
    'use strict';

    angular
        .module('app.navigation')
        .controller('NavigationController', NavigationController);

    /** @ngInject */
    function NavigationController($scope, store, navConfig, $interval)
    {
        var vm = this;

        navConfig.sideNavItems = [];
        vm.userName = null;
        vm.sideNavItems = navConfig.sideNavItems;

        // Data
        vm.msScrollOptions = {
            suppressScrollX: true
        };

        var userDetails = store.get('user-info');
        var promiseUser = null;

        userDetails = null;
        if(userDetails){
            vm.userName = userDetails.fullName;
        }
        else{
            promiseUser = $interval(function(){
                var userDetails = store.get('user-info');
                if (userDetails) {
                    vm.userName = userDetails.fullName;
                    $interval.cancel(promiseUser);
                }
            }, 1000);
        }

    }

})();


