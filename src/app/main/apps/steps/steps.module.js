(function ()
{
    'use strict';

    angular
        .module('app.steps', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider)
    {
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
