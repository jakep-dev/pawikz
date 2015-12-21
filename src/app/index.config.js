(function ()
{
    'use strict';

    angular
        .module('fuse')
        .config(config);

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