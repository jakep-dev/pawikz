(function ()
{
    'use strict';

    angular
        .module('app.core')
        .directive('msStepOverview', msStepOverviewDirective);

    /** @ngInject */
    function msStepOverviewDirective()
    {
        return {
            restrict: 'E',
            scope: {
                step: '='
            },
            templateUrl: 'app/core/directives/ms-step-overview/ms-step-overview.html'
        };
    }
})();