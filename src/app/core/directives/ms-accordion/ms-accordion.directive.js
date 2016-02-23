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


    function MsAccordionController($scope)
    {
        var vm = this;

        vm.collapsed = $scope.initialCollapsed;

        vm.collapse = collapse;

        vm.titleClass =  $scope.titlebg || 'md-amber-A200-bg';

        //Toggle the collapse
        function collapse()
        {
            vm.collapsed = !$scope.collapsed;
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
                actions: "="
            },
            controller: 'MsAccordionController',
            controllerAs: 'vm',
            templateUrl: 'app/core/directives/ms-accordion/ms-accordion.html',
            transclude: true
        };
    }

})();