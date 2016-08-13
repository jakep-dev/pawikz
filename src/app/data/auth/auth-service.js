/**
 * Created by sherindharmarajan on 1/4/16.
 */
(function() {
    'use strict';

    angular
        .module('app.auth.service', [])
        .factory('authService', authService);


    /* @ngInject */
    function authService($http, $location, $q, clientConfig, logger) {
        var readyPromise;

        var service = {
            authenticate: authenticate,
            logout: logout,
            getUserInfo: getUserInfo
        };

        return service;

        // Logout user
        function logout()
        {
            return $http({
                url : clientConfig.endpoints.authEndPoint.logout,
                method : "POST",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
            })
                .then(function(data, status, headers, config) {
                    return data.data;
                })
                .catch(function(error) {
                    logger.error(JSON.stringify(error));
                });
        }

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
                   logger.error(JSON.stringify(error));
                });
        }

        //Get user details
        function getUserInfo()
        {
            return $http({
                url : clientConfig.endpoints.authEndPoint.getUser,
                method : "POST",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
            })
            .then(function(data, status, headers, config) {
                return data.data;
            })
            .catch(function(error) {
                logger.error(JSON.stringify(error));
            });
        }

    }
})();
