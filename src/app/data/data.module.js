/**
 * Created by sherindharmarajan on 1/3/16.
 */
(function ()
{
    'use strict';

    angular
        .module('app.data',
            [
                'app.auth.service',
                'app.chart.service',
                'app.financial.chart.service',
                'app.dashboard.service',
                'app.overview.service',
                'app.template.service',
                'app.workup.service',
                'app.news.service'
            ]);
})();
