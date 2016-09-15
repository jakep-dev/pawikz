(function ()
{
    'use strict';

    angular
        .module('advisen')
        .controller('AppController', AppController);

    /** @ngInject */
    function AppController(fuseTheming, $scope, $window, authBusiness) {
        var vm = this;

        // Data
        vm.themes = fuseTheming.themes;
        authBusiness.initIdle($scope);

        //
        //$scope.onExit = function(event) {
        //    console.log('OnExit - ');
        //    console.log(event);
        //
        //
        //    //authBusiness.logOut();
        //    return 'You have made changes, but you did not save them yet.\nLeaving the page will revert all changes.';
        //};
        //
        //$window.onbeforeunload =  $scope.onExit;
    }
})();