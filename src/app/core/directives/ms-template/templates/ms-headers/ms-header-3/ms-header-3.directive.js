(function ()
{
    'use strict';

    angular
        .module('app.core')
        .directive('msHeader3', msHeader3Directive);

    /** @ngInject */
    function msHeader3Directive()
    {
        return {
            restrict: 'E',
            scope   : {
                value: '@'
            },
            templateUrl: 'app/core/directives/ms-template/templates/ms-headers/ms-header-3/ms-header-3.html'
        };
    }

})();