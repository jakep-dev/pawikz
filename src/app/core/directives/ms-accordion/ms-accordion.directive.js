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
        $scope.collapsed = $scope.initialCollapsed;

        $scope.collapse = collapse;

        //Toggle the collapse
        function collapse()
        {
            $scope.collapsed = !$scope.collapsed;
        }
    }

    /** @ngInject */
    function msAccordionDirective()
    {
        return {
            restrict  : 'E',
            scope     : {
                title: '@',
                initialCollapsed: '=?collapsed'
            },
            controller: 'MsAccordionController',
            templateUrl: 'app/core/directives/ms-accordion/ms-accordion.html',
            transclude: true
        };
    }

})();