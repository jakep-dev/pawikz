/**
 * Created by sherindharmarajan on 11/19/15.
 */
(function ()
{
    'use strict';

    angular
        .module('app.overview', [])
        .run(runBlock)
        .config(config);


    /** @ngInject */
    function runBlock($rootScope, overviewBusiness)
    {
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams)
        {
            //overviewBusiness.save();
            //overviewBusiness.cancelPromise();
        });
    }

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
