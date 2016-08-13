/**
 * Created by sherindharmarajan on 11/16/15.
 */
(function ()
{
    'use strict';

    angular
        .module('app.search', [])
        .config(config);

    /** @ngInject */
    function config($translatePartialLoaderProvider)
    {
        $translatePartialLoaderProvider.addPart('app/search');
    }
})();
