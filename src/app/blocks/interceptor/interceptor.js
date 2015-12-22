/**
 * Created by sherindharmarajan on 12/20/15.
 */
(function() {
    'use strict';

    console.log('blocks.interceptor');

    angular
        .module('blocks.interceptor')
        .factory('interceptor', ['$q','$location',function($q,$location){
            return {
                response: function(response){
                    console.log(response.status);
                    return response || $q.when(response);
                },
                request: function(request)
                {
                    console.log('Inside Request Interceptor');
                    return request || $q.when(request);
                },
                requestError: function(rejection)
                {
                    console.log('Inside Request Error Interceptor');

                    return $q.reject(rejection);
                },
                responseError: function(rejection)
                {
                    console.log('Inside Response Error Interceptor');

                    return $q.reject(rejection);
                }

            }
        }]);
})();
