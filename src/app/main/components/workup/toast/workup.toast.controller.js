(function ()
{
    'use strict';

    angular
        .module('app.workup')
        .controller('WorkUpToastController', WorkUpToastController);
})();

/** @ngInject */
function WorkUpToastController($rootScope, $location, $mdToast)
{
    var vm = this;

    vm.title = $rootScope.toastTitle;

    vm.closeToast = function() {
        $mdToast.hide();
    };

    vm.navigateToWorkUp = function(e) {
        $mdToast.hide();
        $location.url('/overview/' + $rootScope.toastProjectId);
    };
}