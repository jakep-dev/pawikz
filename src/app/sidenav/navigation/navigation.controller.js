(function ()
{
    'use strict';

    angular
        .module('app.navigation')
        .controller('NavigationController', NavigationController);

    /** @ngInject */
    function NavigationController($rootScope)
    {
        var vm = this;

        $rootScope.projectOverview = [];

        // Data
        vm.msScrollOptions = {
            suppressScrollX: true
        };


    }

})();


