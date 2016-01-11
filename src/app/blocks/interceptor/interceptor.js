/**
 * Created by sherindharmarajan on 12/20/15.
 */
(function() {
    'use strict';

    console.log('blocks.interceptor');

    angular
        .module('blocks.interceptor')
        .factory('interceptor', ['$q', '$location', '$rootScope', 'store',function($q, $location, $rootScope, store){
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
                    store.remove('x-session-token');
                    if(rejection.status == 401)
                    {
                        $location.url('/pages/auth/login');
                    }
                    return $q.reject(rejection);
                },
                responseError: function(rejection)
                {
                    $rootScope.isOperation = false;
                    console.log('Inside Response Error');
                    console.log(rejection);

                    store.remove('x-session-token');

                    if(rejection.status == 401)
                    {
                        $location.url('/pages/auth/login');
                    }
                    else if(rejection.status == 500)
                    {
                        $location.url('/pages/errors/error-500')
                    }
                    else if(rejection.status == 404)
                    {
                        $location.url('/pages/errors/error-404')
                    }
                    else {

                    }

                    return $q.reject(rejection);
                }

            }
        }]);


})();
