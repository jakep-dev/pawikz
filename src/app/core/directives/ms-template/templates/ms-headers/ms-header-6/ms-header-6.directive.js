(function ()
{
    'use strict';

    angular
        .module('app.core')
        .directive('msHeader6', msHeader6Directive);

    /** @ngInject */
    function msHeader6Directive()
    {
        return {
            restrict: 'E',
            scope   : {
                value: '@'
            },
            templateUrl: 'app/core/directives/ms-template/templates/ms-headers/ms-header-6/ms-header-6.html'
        };
    }

})();