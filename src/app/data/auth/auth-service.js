/**
 * Created by sherindharmarajan on 1/4/16.
 */
(function() {
    'use strict';

    angular
        .module('app.data')
        .factory('authService', authService);

    authService.$inject = ['$http', '$location', '$q', 'clientConfig'];

    /* @ngInject */
    function authService($http, $location, $q, clientConfig) {
        var readyPromise;

        var service = {
            authenticate: authenticate
        };

        return service;


        //Authenticate user
        function authenticate(userName, password)
        {
            var input =  {
                userName: userName,
                password: password
            };

            return $http({
                url : clientConfig.endpoints.authEndPoint.auth,
                method : "POST",
                data : input,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
            })
                .then(function(data, status, headers, config) {
                    return data.data;
                })
                .catch(function(error) {
                    console.log('error while saving ' + error);
                });
        }

    }
})();
