(function ()
{
    'use strict';

    angular
        .module('fuse')
        .config(function($httpProvider, cfpLoadingBarProvider)
        {
            $httpProvider.interceptors.push('interceptor');
            //cfpLoadingBarProvider.spinnerTemplate =  '<div><span class="fa fa-spinner">Loading...</div>';
            //cfpLoadingBarProvider.latencyThreshold = 1;
            cfpLoadingBarProvider.includeSpinner = false;
        });

    /** @ngInject */
    function config()
    {
        console.log('Inside Configuration of app');

        // Put your custom configurations here
        return (['$httpProvider', function($httpProvider) {
            $httpProvider.interceptors.push('interceptor');
        }]);
    }

})();