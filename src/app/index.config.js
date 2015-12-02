(function ()
{
    'use strict';

    angular
        .module('fuse')
        .config(config);

    /** @ngInject */
    function config()
    {
        // Put your custom configurations here
        return (['$httpProvider', function($httpProvider) {
            $httpProvider.interceptors.push('myInterceptor');
        }]);
    }

})();