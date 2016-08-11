(function ()
{
    'use strict';

    angular
        .module('app.business',
            [
                'app.common.business',
                'app.workup.business',
                'app.steps.business',
                'app.overview.business',
                'app.template.business',
                'app.menu.business',
                'app.dashboard.business',
                'app.chart.stockchart.business',
                'app.breadcrumb.business',
                'app.auth.business'
            ]);
})();
