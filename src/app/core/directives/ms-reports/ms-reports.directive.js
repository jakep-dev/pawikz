(function() {
    'use strict';

    angular
        .module('app.core')
        .controller('msReportsController', msReportsController)
        .directive('msReports', msReportsDirective);

    function msReportsController() {
        var vm = this;

        vm.onLoadComplete = null;
        vm.initiateGetList = null;
        
        vm.onExpand = onExpand;
        vm.registerGetListCallback = registerGetListCallback;
        vm.getListComplete = getListComplete;
        vm.registerExpandCompleteCallback = registerExpandCompleteCallback;

        function onExpand() {
            if (vm.initiateGetList && (typeof (vm.initiateGetList) === 'function')) {
                vm.initiateGetList();
            }
        }

        function registerGetListCallback(callback) {
            vm.initiateGetList = callback;
        }

        function registerExpandCompleteCallback(callback) {
            vm.onLoadComplete = callback;
        }

        function getListComplete() {
            if (vm.onLoadComplete && (typeof (vm.onLoadComplete) === 'function')) {
                vm.onLoadComplete();
            }
        }         
    }

    /** @ngInject */
    function msReportsDirective($compile) {
        return {
            restrict: 'E',
            scope: {
            },
            controller: 'msReportsController',
            controllerAs: 'vm',
            templateUrl: 'app/core/directives/ms-reports/ms-reports.html'
        };
    }
})();