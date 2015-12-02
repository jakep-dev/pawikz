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
        .directive('msAccordionTitle', msAccordionTitleDirective)
        .directive('msAccordionContent',msAccordionContentDirective)

    /** @ngInject */
    function MsAccordionController($scope, $element)
    {
        var vm = this;

        // Data
        vm.collapsed = false;

        // Methods
        vm.toggle = toggle;

        //////////

        /**
         * Toggle the accordion
         */
        function toggle()
        {
            if ( !isCollapsible() )
            {
                return;
            }

            // Toggle flipped status
            vm.collapsed = !vm.collapsed;

            // Toggle the 'collapsed' class
            $element.toggleClass('collapsed', vm.collapsed);
        }

        /**
         * Check if accordion is collapsible
         *
         * @returns {boolean}
         */
        function isCollapsible()
        {
            return (angular.isDefined($scope.collapsed) && $scope.collapsed === true);
        }
    }

    /** @ngInject */
    function msAccordionDirective()
    {
        return {
            restrict  : 'E',
            scope     : {
                collapsed: '=?'
            },
            controller: 'MsAccordionController',
            transclude: true,
            compile   : function (tElement)
            {
                tElement.addClass('ms-accordion');

                return function postLink(scope, iElement, iAttrs, MsWidgetCtrl, transcludeFn)
                {
                    // Custom transclusion
                    transcludeFn(function (clone)
                    {
                        iElement.empty();
                        iElement.append(clone);
                    });

                };
            }
        };
    }

    /** @ngInject */
    function msAccordionTitleDirective()
    {
        return {
            restrict  : 'E',
            require   : '^msAccordion',
            transclude: true,
            compile   : function (tElement)
            {
                tElement.addClass('ms-accordion-title');

                return function postLink(scope, iElement, iAttrs, MsAccordionCtrl, transcludeFn)
                {
                    // Custom transclusion
                    transcludeFn(function (clone)
                    {
                        iElement.empty();
                        iElement.append(clone);
                    });

                    // Methods
                    scope.toggleAccordion = MsAccordionCtrl.toggle;
                };
            }
        };
    }

    /** @ngInject */
    function msAccordionContentDirective()
    {
        return {
            restrict  : 'E',
            require   : '^msAccordion',
            transclude: true,
            compile   : function (tElement)
            {
                tElement.addClass('ms-accordion-content');

                return function postLink(scope, iElement, iAttrs, MsAccordionCtrl, transcludeFn)
                {
                    // Custom transclusion
                    transcludeFn(function (clone)
                    {
                        iElement.empty();
                        iElement.append(clone);
                    });

                    // Methods
                    scope.toggleAccordion = MsAccordionCtrl.toggle;
                };
            }
        };
    }

})();