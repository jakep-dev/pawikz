(function ()
{
    'use strict';

    angular
        .module('app.dashboard-project', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider)
    {

        $stateProvider.state('app.dashboard-project', {
            url    : '/dashboard-project/:userId/:token',
            views  : {
                'content@app': {
                    templateUrl: 'app/main/apps/dashboards/project/dashboard-project.html',
                    controller : 'DashboardProjectController as vm'
                },
              'search-engine@app': {
                templateUrl: 'app/main/apps/dashboards/project/search/search-project.html',
                controller : 'DashboardProjectController as vm'
              }
            }
        });
    }

})();
