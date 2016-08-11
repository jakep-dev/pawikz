(function ()
{
    'use strict';

    angular
        .module('advisen')
        .config(function($httpProvider, cfpLoadingBarProvider, KeepaliveProvider, IdleProvider, clientConfig)
        {
            $httpProvider.interceptors.push('interceptor');
            cfpLoadingBarProvider.includeSpinner = false;
            IdleProvider.idle(clientConfig.activity.idle);
            IdleProvider.timeout(clientConfig.activity.timeout);
            KeepaliveProvider.interval(clientConfig.activity.interval);
        });

    /** @ngInject */
    function config()
    {
        // Put your custom configurations here
        return (['$httpProvider', function($httpProvider) {
            $httpProvider.interceptors.push('interceptor');
        }]);
    }

})();