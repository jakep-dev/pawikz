(function ()
{
    'use strict';

    angular
        .module('app.components.charts.simple-chart', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider)
    {
        $stateProvider.state('app.components_charts_simple_chart', {
            url  : '/components/charts/simple-chart',
            views: {
                'content@app': {
                    templateUrl: 'app/main/components/charts/simple-chart/simple-chart.html',
                    controller : 'SimpleChartController as vm'
                }
            }
        });
    }

})();