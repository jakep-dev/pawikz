(function ()
{
    'use strict';

    angular
        .module('app.steps', [])
        .run(runBlock)
        .config(config);

    /** @ngInject */
    function runBlock($rootScope, templateBusiness)
    {
        $rootScope.$on('$stateChangeStart', function ()
        {
            templateBusiness.save();
            templateBusiness.saveTable();
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
