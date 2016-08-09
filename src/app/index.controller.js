(function ()
{
    'use strict';

    angular
        .module('advisen')
        .controller('AppController', AppController);

    /** @ngInject */
    function AppController(fuseTheming, $scope, authBusiness, $window) {
        var vm = this;

        // Data
        vm.themes = fuseTheming.themes;
        authBusiness.initIdle($scope);
    }
})();