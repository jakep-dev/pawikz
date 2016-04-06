/**
 * Created by sherindharmarajan on 11/19/15.
 */
(function ()
{
    'use strict';

    angular
        .module('app.overview', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider)
    {
        $stateProvider.state('app.overview', {
            url    : '/overview/{projectId}',
            views  : {
                'content@app': {
                    templateUrl: 'app/main/apps/overview/overview.html',
                    controller : 'OverviewController as vm'
                }
            }
        });
    }
})();
