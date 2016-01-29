(function ()
{
    'use strict';

    angular
        .module('app.core')
        .directive('msBlank', msBlankDirective);

    /** @ngInject */
    function msBlankDirective()
    {
        return {
            restrict: 'E',
            scope   : {
            },
            templateUrl: 'app/core/directives/ms-template/templates/ms-blank/ms-blank.html'
        };
    }

})();