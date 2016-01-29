(function ()
{
    'use strict';

    angular
        .module('app.core')
        .directive('msHeader1', msHeader1Directive);

    /** @ngInject */
    function msHeader1Directive()
    {
        return {
            restrict: 'E',
            scope   : {
                value: '@'
            },
            templateUrl: 'app/core/directives/ms-template/templates/ms-headers/ms-header-1/ms-header-1.html'
        };
    }

})();