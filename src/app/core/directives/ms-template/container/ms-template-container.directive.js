(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('MsTemplateContainerController', MsTemplateContainerController)
        .directive('msTemplateContainer', msTemplateContainerDirective)
        .directive('msTemplateContainerHeader', msTemplateContainerHeaderDirective)
        .directive('msTemplateContainerContent', msTemplateContainerContentDirective)
        .directive('msTemplateContainerFooter', msTemplateContainerFooterDirective);

    /** @ngInject */
    function MsTemplateContainerController($scope, $element)
    {
        var vm = this;
    }

    /** @ngInject */
    function msTemplateContainerDirective() {
        return {
            restrict  : 'E',
            scope     : {},
            transclude: true,
            controller: 'MsTemplateContainerController',
            compile   : function (tElement) {
                tElement.addClass('ms-template-container');
                return function postLink(scope, iElement, iAttrs,
                                         MsTemplateContainerController, transcludeFn) {
                    transcludeFn(function (clone) {
                        iElement.empty();
                        iElement.append(clone);
                    });
                };
            }
        }
    }

    /** @ngInject */
    function msTemplateContainerHeaderDirective() {
        return {
            restrict  : 'E',
            scope     : {},
            require   : '^msTemplateContainer',
            transclude: true,
            compile   : function (tElement) {
                tElement.addClass('ms-template-container-header');
                return function postLink(scope, iElement, iAttrs,
                                         MsTemplateContainerController, transcludeFn) {
                    transcludeFn(function (clone) {
                        iElement.empty();
                        iElement.append(clone);
                    });
                };
            }
        }
    }

    /** @ngInject */
    function msTemplateContainerContentDirective() {
        return {
            restrict  : 'E',
            scope     : {},
            require   : '^msTemplateContainer',
            transclude: true,
            compile   : function (tElement) {
                tElement.addClass('ms-template-container-content');
                return function postLink(scope, iElement, iAttrs,
                                         MsTemplateContainerController, transcludeFn) {
                    transcludeFn(function (clone) {
                        iElement.empty();
                        iElement.append(clone);
                    });
                };
            }
        }
    }

    /** @ngInject */
    function msTemplateContainerFooterDirective() {
        return {
            restrict  : 'E',
            scope     : {},
            require   : '^msTemplateContainer',
            transclude: true,
            compile   : function (tElement) {
                tElement.addClass('ms-template-container-footer');
                return function postLink(scope, iElement, iAttrs,
                                         MsTemplateContainerController, transcludeFn) {
                    transcludeFn(function (clone) {
                        iElement.empty();
                        iElement.append(clone);
                    });
                };
            }
        }
    }

})();