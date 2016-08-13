(function ()
{
    'use strict';

    angular
        .module('app.bottomsheet', [])
        .config(config);

    /** @ngInject */
    function config($translatePartialLoaderProvider)
    {
        //$translatePartialLoaderProvider.addPart('app/bottomsheet');
    }
})();
