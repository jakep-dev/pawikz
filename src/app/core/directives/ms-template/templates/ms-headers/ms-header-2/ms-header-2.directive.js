(function ()
{
    'use strict';

    angular
        .module('app.core')
        .directive('msHeader2', msHeader2Directive);

    /** @ngInject */
    function msHeader2Directive()
    {
        return {
            restrict: 'E',
            scope   : {
                value: '@'
            },
            templateUrl: 'app/core/directives/ms-template/templates/ms-headers/ms-header-2/ms-header-2.html'
        };
    }

})();