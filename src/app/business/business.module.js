(function ()
{
    'use strict';

    angular
        .module('app.business',
            [
                'app.common.business',
                'app.workup.business',
                'app.overview.business',
                'app.template.business',
                'app.template.business.format',
                'app.steps.business',
                'app.menu.business',
                'app.dashboard.business',
                'app.chart.stockchart.business',
                'app.chart.financialchart.business',
                'app.breadcrumb.business',
                'app.auth.business'
            ]);
})();
