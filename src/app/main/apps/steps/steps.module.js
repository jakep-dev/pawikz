(function ()
{
    'use strict';

    angular
        .module('app.steps', [])
        .run(runBlock)
        .config(config);

    /** @ngInject */
    function runBlock($rootScope, templateBusinessSave)
    {
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams)
        {
            templateBusinessSave.save();
        });
    }

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
