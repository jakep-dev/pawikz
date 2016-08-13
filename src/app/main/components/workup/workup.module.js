(function ()
{
    'use strict';

    angular
        .module('app.workup', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider)
    {
        $stateProvider.state('app.workup', {
            url    : '/workup/{userId}/{token}/{isNav}/{companyId}/{templateId}',
            views  : {
                'content@app': {
                    template: '',
                    controller : 'WorkUpController as vm'
                }
            }
        });
    }

})();
