/**
 * Created by sherindharmarajan on 12/20/15.
 */
(function() {
    'use strict';

    console.log('blocks.interceptor');

    angular
        .module('blocks.interceptor')
        .factory('interceptor',ConfigInterceptor)



    /** @ngInject */
    function ConfigInterceptor($q, $location, $rootScope, store, logger){
        return {
            response: function(response){
                $rootScope.isOperation = false;
                return response || $q.when(response);
            },
            request: function(request)
            {
                $rootScope.isOperation = true;
                request.headers['x-session-token'] = store.get('x-session-token');
                return request || $q.when(request);
            },
            requestError: function(rejection)
            {
                return rejection || $q.when(rejection);
            },
            responseError: function(rejection)
            {
                console.log('Response Error');
                $rootScope.isOperation = false;
                store.remove('x-session-token');
                store.remove('x-session-user');

                var error = {
                    method: rejection.config.method,
                    url: rejection.config.url,
                    message: rejection.data || rejection.config.data,
                    status: rejection.status
                };

                logger.error(JSON.stringify(error));

                switch (rejection.status)
                {
                    case 401:
                        $location.url('/pages/auth/login');
                        break;
                    case 404:
                        $location.url('/pages/errors/error-404')
                        break;
                    case 500:
                        $location.url('/pages/errors/error-500')
                        break;
                }

                return rejection || $q.when(rejection);
            }

        }
    }


})();
