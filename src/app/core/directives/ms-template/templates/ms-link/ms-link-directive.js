(function ()
{
    'use strict';

    angular
        .module('app.core')
        .directive('msLink', msLinkDirective);

    /** @ngInject */
    function msLinkDirective()
    {
        return {
            restrict: 'E',
            scope   : {
                value: '@',
                href: '@',
                isdisabled: '=?'
            },
            templateUrl: 'app/core/directives/ms-template/templates/ms-link/ms-link.html'
        };
    }
})();