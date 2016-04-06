(function ()
{
    'use strict';

    angular
        .module('app.core')
        .directive('msMessage', msMessageDirective);

    /** @ngInject */
    function msMessageDirective()
    {
        return {
            restrict: 'E',
            scope   : {
                message: '@'
            },
            templateUrl: 'app/core/directives/ms-template/templates/ms-message/ms-message.html'
        };
    }

})();