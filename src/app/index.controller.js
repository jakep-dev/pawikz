(function ()
{
    'use strict';

    angular
        .module('advisen')
        .controller('AppController', AppController);

    /** @ngInject */
    function AppController(fuseTheming, $scope, authBusiness) {
        var vm = this;

        // Data
        vm.themes = fuseTheming.themes;
        authBusiness.initIdle($scope);
    }
})();