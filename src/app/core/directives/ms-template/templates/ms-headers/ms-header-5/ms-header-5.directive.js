(function ()
{
    'use strict';

    angular
        .module('app.core')
        .directive('msHeader5', msHeader5Directive);

    /** @ngInject */
    function msHeader5Directive()
    {
        return {
            restrict: 'E',
            scope   : {
                value: '@'
            },
            templateUrl: 'app/core/directives/ms-template/templates/ms-headers/ms-header-5/ms-header-5.html'
        };
    }

})();