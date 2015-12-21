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
                    console.log('Inside Response Interceptor');

                    return promise.then(
                        function success(response) {
                            return response;
                        },
                        function error(response) {
                            console.log('error');

                            if(response.status === 401){
                                $location.path('/signin');
                                return $q.reject(response);
                            }
                            else{
                                return $q.reject(response);
                            }
                        });
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

    //interceptor.$inject = ['$q', '$location'];
    //
    ///* @ngInject */
    //function interceptor($q, $location) {
    //    return
    //    {
    //        response: function(response)
    //        {
    //            return promise.then(
    //                function success(response)
    //                {
    //                    return response;
    //                }
    //            )
    //        },
    //        function error(response)
    //        {
    //            if(reponse.status === 400)
    //            {
    //                $location.path('/signin');
    //            }
    //            return $q.reject(response);
    //        }
    //    }
    //}
})();
