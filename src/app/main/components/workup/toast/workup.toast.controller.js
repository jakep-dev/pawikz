(function ()
{
    'use strict';

    angular
        .module('app.workup')
        .controller('WorkUpToastController', WorkUpToastController);
})();


function WorkUpToastController($rootScope, $location, $mdToast)
{
    var vm = this;

    vm.closeToast = function() {
        $mdToast.hide();
    };

    vm.navigateToWorkUp = function(e) {
        $mdToast.hide();
        $location.url('/overview/' + $rootScope.projectId);
    };
}