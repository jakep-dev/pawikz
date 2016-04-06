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
            views  : {
                'content@app': {
                    templateUrl: 'app/main/apps/steps/steps.html'
                }
            }
        });

        $stateProvider.state('app.steps.stepName', {
            url    : '/{stepName}',
            params : {reloadCount:1},
            templateUrl: 'app/main/apps/steps/step-name.html',
            controller : 'StepController as vm'
        });
    }
})();
