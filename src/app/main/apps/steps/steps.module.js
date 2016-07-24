(function ()
{
    'use strict';

    angular
        .module('app.steps', [])
        .run(runBlock)
        .config(config);

    /** @ngInject */
    function runBlock($rootScope, templateBusiness, overviewBusiness)
    {
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams)
        {
            templateBusiness.save();
            templateBusiness.saveTable();
        });
    }

    /** @ngInject */
    function config($stateProvider)
    {
        console.log('Config Steps- ');
        console.log( angular.element('#main-content'));

        $stateProvider.state('app.steps', {
            url    : '/steps/{projectId}/{stepId}/{stepName}',
            params : {reloadCount:1},
            views  : {
                'content@app': {
                    templateUrl: 'app/main/apps/steps/steps.html',
                    controller : 'StepController as vm'
                }
            }
        });


    }
})();
