/**
 * Created by sherindharmarajan on 11/19/15.
 */
(function ()
{
    'use strict';

    angular
        .module('app.project-history', [])
        .config(config);


    /** @ngInject */
    function config($stateProvider)
    {
        $stateProvider.state('app.project-history', {
            url    : '/projectHistory/{projectId}/{userId}',
            views  : {
                'content@app': {
                    templateUrl: 'app/main/apps/project-history/project-history.html',
                    controller : 'ProjectHistoryController as vm'
                }
            }
        });
    }
})();
