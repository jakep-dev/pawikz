(function ()
{
    'use strict';

    angular
        .module('app.core')
        .directive('msLabel', msLabelDirective);

    /** @ngInject */
    function msLabelDirective()
    {
        return {
            restrict: 'E',
            scope   : {
                value: '@',
                classtype: '@'
            },
            templateUrl: 'app/core/directives/ms-template/templates/ms-label/ms-label.html'
        };
    }
})();