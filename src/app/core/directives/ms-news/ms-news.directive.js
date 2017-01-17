(function() {
    'use strict';

    angular
        .module('app.core')
        .controller('msNewsController', msNewsController)
        .directive('msNews', msNewsDirective);

    function msNewsController($scope) {
        var vm = this;
        vm.actions = [];
        
        defineAction();

        function defineAction() {

             vm.actions.push({
                id: 1,
                callback: '-Clear',
                icon: 'icon-eraser',
                isclicked: null,
                tooltip: 'Clear Selected Article',
                type: 'button'
            });

            vm.actions.push({
                id: 2,
                callback: '-Bookmark',
                icon: 'icon-bookmark',
                isclicked: null,
                tooltip: 'Attach Checked Article',
                type: 'button'
            });
        }
    }

    /** @ngInject */
    function msNewsDirective($compile) {
        return {
            restrict: 'E',
            scope: {
                name: '@',
                action: '@'
            },
            controller: 'msNewsController',
            controllerAs: 'vm',
            templateUrl: 'app/core/directives/ms-news/ms-news.html'
        };
    }
})();