(function ()
{
    'use strict';

    angular
        .module('app.core')
        .directive('msText', msTextDirective);

    /** @ngInject */
    function msTextDirective()
    {
        return {
            restrict: 'E',
            scope   : {
                value: '@',
                isdisabled: '=?'
            },
            templateUrl: 'app/core/directives/ms-template/templates/ms-text/ms-text.html'
        };
    }

})();