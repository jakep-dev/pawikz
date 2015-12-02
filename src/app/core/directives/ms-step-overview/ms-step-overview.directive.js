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
            template: 'ms-step-overview.html'
        };
    }
})();