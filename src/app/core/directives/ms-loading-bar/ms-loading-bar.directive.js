(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('MsLoadingBarController', msLoadingBarController)
        .directive('msLoadingBar', msLoadingBarDirective);

    /** @ngInject */
    function msLoadingBarController($scope, commonBusiness) {
        var vm = this;
        vm.message = "";
        vm.currentProgress = 0;

        commonBusiness.onMsg('LoadingBarMessage', $scope, function(message) {
            vm.message = message;
        });

        commonBusiness.onMsg('LoadingBarProgress', $scope, function(currentProgress) {
            vm.currentProgress = currentProgress;
        });
    }

    /** @ngInject */
    function msLoadingBarDirective()
    {
        return {
            restrict: 'E',
            scope:{
            },
            controller: 'MsLoadingBarController',
            controllerAs: 'vm',
            templateUrl: 'app/core/directives/ms-loading-bar/ms-loading-bar.html'
        };
    }
})();