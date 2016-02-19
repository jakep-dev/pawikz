(function ()
{
    'use strict';

    angular
        .module('app.core')
        .directive('msImageChart', msImageChartDirective);

    /** @ngInject */
    function msImageChartDirective()
    {
        return {
            restrict: 'E',
            scope   : {
                url: '@'
            },
            templateUrl: 'app/core/directives/ms-chart/ms-image-chart/ms-image-chart.html'
        };
    }

})();