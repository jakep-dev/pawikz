/**
 * Created by sherindharmarajan on 11/24/15.
 */
(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('MsAccordionController', MsAccordionController)
        .directive('msAccordion', msAccordionDirective)


    function MsAccordionController($scope, commonBusiness)
    {
        var vm = this;

        vm.collapsed = $scope.initialCollapsed;
        vm.isExpandable = $scope.isExpandable;
        vm.actions = $scope.actions;
        vm.titleClass =  $scope.titlebg || 'md-amber-A200-bg';
        
        vm.collapse = collapse;
        vm.applyClickEvent = applyClickEvent;

        init();

        //Toggle the collapse
        function collapse()
        {
            vm.collapsed = !vm.collapsed;
        }



        function init()
        {
            if(!vm.isExpandable)
            {
                vm.collapse = false;
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
    function msAccordionDirective()
    {
        return {
            restrict  : 'E',
            scope     : {
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