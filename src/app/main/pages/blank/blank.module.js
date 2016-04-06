/**
 * Created by sdharmarajan on 11/4/2015.
 */
(function ()
{
    'use strict';

    angular
        .module('app.pages.blank', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider)
    {
        $stateProvider.state('app.pages_blank', {
            url    : '/pages/blank',
            views  : {
                'content@app': {
                    templateUrl: 'app/main/pages/blank/blank.html',
                    controller : 'BlankController as vm'
                }
            }
        });

        $translatePartialLoaderProvider.addPart('app/main/pages/blank');

    }

})();
