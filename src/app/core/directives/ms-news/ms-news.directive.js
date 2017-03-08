(function() {
    'use strict';

    angular
        .module('app.core')
        .controller('msNewsController', msNewsController)
        .directive('msNews', msNewsDirective);

    function msNewsController($scope) {
        var vm = this;

        vm.actions = [];
        vm.deleteActionbtn = [];
        vm.title = $scope.title;
        vm.searchName = $scope.searchName;
        vm.expandEvent = "expand";
        vm.collapseEvent = "collapse";

        defineAction();
        deleteAction();

        function defineAction() {

            vm.actions.push({
                id: 1,
                callback: '-Clear',
                icon: 'icon-eraser',
                isclicked: null,
                tooltip: 'Clear Selected Article',
                disabled: false,
                type: 'button'
            });

            vm.actions.push({
                id: 2,
                callback: '-Bookmark',
                icon: 'icon-bookmark',
                isclicked: null,
                disabled: true,
                tooltip: 'Attach Checked Article',
                type: 'button'
            });
        }

        function deleteAction() {

            vm.deleteActionbtn.push({
                id: 1,
                callback: '-Remove',
                icon: 'icon-delete',
                isclicked: null,
                disabled: true,
                tooltip: 'Remove Bookmark',
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
                action: '@',
                title: '@',
                searchName: '@'
            },
            controller: 'msNewsController',
            controllerAs: 'vm',
            templateUrl: 'app/core/directives/ms-news/ms-news.html'
        };
    }
})();