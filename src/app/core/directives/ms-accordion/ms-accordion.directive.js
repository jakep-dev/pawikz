/**
 * Created by sherindharmarajan on 11/24/15.
 */
(function() {
    'use strict';

    angular
        .module('app.core')
        .controller('MsAccordionController', MsAccordionController)
        .directive('msAccordion', msAccordionDirective)


    function MsAccordionController($scope, $attrs, commonBusiness, newsBusiness) {
        var vm = this;

        vm.isCollapsed = $scope.initialCollapsed;
        vm.isExpandable = $scope.isExpandable;
        vm.titleClass = $scope.titlebg || 'md-amber-A200-bg';
        vm.isProcessComplete = true;
        vm.row = $scope.row;
        vm.onExpand = $scope.onExpand;
        vm.registerExpandCompleteCallback = $scope.registerExpandCompleteCallback;
        vm.registerToggleCollapseCallback = $scope.registerToggleCollapseCallback;
        vm.registerCollapseAccordionCallback = $scope.registerCollapseAccordionCallback;
        vm.registerExpandAccordionCallback = $scope.registerExpandAccordionCallback;
        vm.applyClickEvent = applyClickEvent;
        vm.onExpandCollapse = onExpandCollapse;

        init();

        function onExpandComplete() {
            vm.isProcessComplete = true;
        }
        vm.onExpandComplete = onExpandComplete;
        if(vm.registerExpandCompleteCallback) {
            vm.registerExpandCompleteCallback(vm.onExpandComplete);
        }

        //Toggle the collapse
        function onExpandCollapse() {
            vm.isCollapsed = !vm.isCollapsed;
            if (!vm.isCollapsed && vm.isProcessComplete) {
                if (vm.registerExpandCompleteCallback) {
                    vm.isProcessComplete = false;
                }
                if (vm.onExpand) {
                    vm.onExpand();
                }
            }
        }

        function toggleCollapse() {
            vm.isCollapsed = !vm.isCollapsed;
        }
        if (vm.registerToggleCollapseCallback) {
            vm.registerToggleCollapseCallback(toggleCollapse);
        }

        function collapseAccordion() {
            if (!vm.isCollapsed) {
                vm.isCollapsed = true;
            }
        }
        if (vm.registerCollapseAccordionCallback) {
            vm.registerCollapseAccordionCallback(collapseAccordion);
        }

        function expandAccordion() {
            if (vm.isCollapsed) {
                vm.isCollapsed = false;
            }
        }
        if (vm.registerExpandAccordionCallback) {
            vm.registerExpandAccordionCallback(expandAccordion);
        }

        function init() {
            if (!vm.isExpandable) {
                vm.isCollapsed = false;
            }

            if($scope.collapseNewsAttachment != null){
                vm.isCollapsed = false;
            }
        }

        function applyClickEvent(action, $mdOpenMenu, ev) {
            if (action) {
                if (action.type === 'button' && action.callback) {
                    if (typeof(action.callback) === 'function') {
                        if ($.isNumeric(vm.row)) {
                            action.callback(vm.row);
                        } else {
                            action.callback();
                        }
                    } else {
                        commonBusiness.emitMsg(action.callback);
                    }
                } else if (action.type === 'menu') {
                    $mdOpenMenu(ev);
                }

                if (action.isclicked !== null) {
                    action.isclicked = !action.isclicked;
                }
            }
        }
    }

    /** @ngInject */
    function msAccordionDirective() {
        return {
            restrict: 'E',
            scope: {
                title: '@',
                initialCollapsed: '@',
                titlebg: '@',
                isExpandable: '=?',
                actions: '=',
                index: '=',
                row: '=',
                onExpand: '=',
                registerExpandCompleteCallback: '=',
                registerToggleCollapseCallback: '=',
                registerCollapseAccordionCallback: '=',
                registerExpandAccordionCallback: '=',
                collapseNewsAttachment: '@'
            },
            controller: 'MsAccordionController',
            controllerAs: 'vm',
            templateUrl: 'app/core/directives/ms-accordion/ms-accordion.html',
            transclude: true
        };
    }

})();