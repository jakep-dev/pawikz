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

        vm.iscollapsed = $scope.initialCollapsed;
        vm.isExpandable = $scope.isExpandable;
        vm.actions = $scope.actions;
        vm.titleClass = $scope.titlebg || 'md-amber-A200-bg';
        vm.isProcessComplete = true;
        vm.applyClickEvent = applyClickEvent;
        vm.loadSearchResult = loadSearchResult;

        init();

        if($scope.collapseSearchResult != null){
            
            commonBusiness.onMsg($scope.collapseSearchResult, $scope, function(ev) {
                toggleCollapse();
            });
        }

        commonBusiness.onMsg('load-search-result', $scope, function(ev) {
           vm.isProcessComplete = true;
        });

        //Toggle the collapse
        function loadSearchResult() {

            vm.iscollapsed  = !vm.iscollapsed ;

            if(!vm.iscollapsed  && $scope.expandSearchResult != null){
                
                vm.isProcessComplete = false;
                commonBusiness.emitMsg('search-result-expand');
            }

            doExpandOrCollapse();
        }

        function toggleCollapse(){
            vm.iscollapsed  = !vm.iscollapsed;
        }

        function doExpandOrCollapse(){
            $scope.expandSearchResult = null;
        }


        function init() {
            if (!vm.isExpandable) {
                vm.iscollapsed  = false;
            }

            if ($scope.collapseSearchResult != null) {   
                vm.isProcessComplete = true;
                toggleCollapse();
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
                actions: '=',
                collapseSearchResult: '@',
                expandSearchResult: '@'
            },
            controller: 'MsAccordionController',
            controllerAs: 'vm',
            templateUrl: 'app/core/directives/ms-accordion/ms-accordion.html',
            transclude: true
        };
    }

})();