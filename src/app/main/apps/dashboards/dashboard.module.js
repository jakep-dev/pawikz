(function ()
{
    'use strict';

    angular
        .module('app.dashboard', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider)
    {
        $stateProvider.state('app.dashboard', {
            url    : '/dashboard/{userId}/{token}/{isNav}',
            views  : {
                'content@app': {
                    templateUrl: 'app/main/apps/dashboards/dashboard.html',
                    controller : 'DashboardController as vm'
                },
              'search-engine@app': {
                templateUrl: 'app/main/apps/dashboards/search/search.html',
                controller : 'DashboardSearchController as vm'
              }
            }
        });
    }

})();
