/**
 * Created by sherindharmarajan on 11/24/15.
 */
(function() {
    'use strict';

    angular
        .module('app.core')
        .controller('MsAccordionController', MsAccordionController)
        .directive('msAccordion', msAccordionDirective)


    function MsAccordionController($scope, $attrs, commonBusiness) {
        var vm = this;
        var loadCount = 1;

        vm.collapsed = $scope.initialCollapsed;
        vm.isExpandable = $scope.isExpandable;
        vm.actions = $scope.actions;
        vm.titleClass = $scope.titlebg || 'md-amber-A200-bg';
        vm.loadData = null;
        vm.isProcessComplete = false;
        vm.searchResult = false;

        vm.collapse = collapse;
        vm.applyClickEvent = applyClickEvent;

        init();

        commonBusiness.onMsg('collapsed', $scope, function(ev) {
           if ($attrs.id === 'SearchResult') {
                collapse();
            }
        });

        //Toggle the collapse
        function collapse() {

            vm.collapsed = !vm.collapsed;

            vm.isProcessComplete = true;
            
            if(!vm.collapsed){

                vm.loadData = !vm.collapsed;

                (loadCount <= 1 ) ? (vm.isProcessComplete = false) : (vm.isProcessComplete = true);
                
                 commonBusiness.emitWithArgument('loadDataValue', vm.loadData);
                 
                 commonBusiness.onMsg('loadValue', $scope, function(data) {
        
                    vm.isProcessComplete = true;

                     loadCount += 1;
                });
            }
        }

        function init() {
            if (!vm.isExpandable) {
                vm.collapse = false;
            }

            if ($attrs.id === 'SearchResult') {
                
                vm.searchResult = true;
                collapse();
            }
        }

        function applyClickEvent(action, $mdOpenMenu, ev) {
            if (action) {
                if (action.type === 'button' && action.callback) {
                    commonBusiness.emitMsg(action.callback);
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
                initialCollapsed: '=?collapsed',
                titlebg: '@',
                isExpandable: '=?',
                actions: '='
            },
            controller: 'MsAccordionController',
            controllerAs: 'vm',
            templateUrl: 'app/core/directives/ms-accordion/ms-accordion.html',
            transclude: true
        };
    }

})();