(function ()
{
    'use strict';

    angular
        .module('app.core')
        .directive('msHeader4', msHeader4Directive);

    /** @ngInject */
    function msHeader4Directive()
    {
        return {
            restrict: 'E',
            scope   : {
                value: '@'
            },
            templateUrl: 'app/core/directives/ms-template/templates/ms-headers/ms-header-4/ms-header-4.html'
        };
    }

})();