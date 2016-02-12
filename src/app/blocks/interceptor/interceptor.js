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
    function ConfigInterceptor($q, $location, $injector, $interval, $rootScope, store, logger){
        var promise = [];

        var service = {
          response: response,
          request: request,
          requestError:requestError,
          responseError: responseError
        };

        return service;



        function response(response)
        {
            cancelPromise();
            $rootScope.isOperation = false;
            return response || $q.when(response);
        }

        function request(request)
        {
            if(request.url.indexOf('.json') === -1 && request.url.indexOf('.html') === -1 &&
                request.url.indexOf('.svg') === -1 && request.url.indexOf('/schema') === -1)
            {
                promise = $interval(function()
                {
                    var toast =  $injector.get("toast");
                    toast.simpleToast('Hang on. Still processing!');
                }, 5000);
            }

            $rootScope.isOperation = true;
            request.headers['x-session-token'] = store.get('x-session-token');
            return request || $q.when(request);
        }

        function requestError(rejection)
        {
            var toast =  $injector.get("toast");
            toast.simpleToast('Oops!. Request error.');
            cancelPromise();
            return rejection || $q.when(rejection);
        }

        function responseError(rejection)
        {
            cancelPromise();
            console.log('Response Error');
            $rootScope.isOperation = false;
            store.remove('x-session-token');
            store.remove('x-session-user');

            var toast =  $injector.get("toast");
            toast.simpleToast('Oops!. Response error.');

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

        function cancelPromise()
        {
            $interval.cancel(promise);
            promise = [];
        }

    }


})();
