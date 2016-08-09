/**
 * Created by sherindharmarajan on 12/20/15.
 */
(function() {
    'use strict';

    console.log('blocks.interceptor');

    angular
        .module('blocks.interceptor')
        .factory('interceptor',ConfigInterceptor);

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
            $rootScope.isOperation = false;
            return response || $q.when(response);
        }

        function request(request)
        {
            $rootScope.isOperation = true;

            var userInfo = store.get('user-info');
            request.headers['x-session-token'] = store.get('x-session-token');
            if(userInfo)
            {
                request.headers['x-session-userId'] = userInfo.userId;
            }
            return request || $q.when(request);
        }

        function requestError(rejection)
        {
            var toast =  $injector.get("toast");
            toast.simpleToast('Oops!. Request error.');
            console.log('Request Error');
            console.log(rejection);
            return rejection || $q.when(rejection);
        }

        function responseError(rejection)
        {
            console.log('Response Error');
            $rootScope.isOperation = false;
            store.remove('x-session-token');
            store.remove('x-session-user');

            var toast =  $injector.get("toast");
            toast.simpleToast('Oops!. ' + rejection.statusText);
            console.log('Rejection Response');
            console.log(rejection);

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
                case 500:
                    console.log('Inside 500 error');
                    $location.url('/pages/errors/error-500');
                    break;
            }

            return rejection || $q.when(rejection);
        }
    }


})();
