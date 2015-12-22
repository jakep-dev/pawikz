/**
 * Created by sherindharmarajan on 12/19/15.
 */

(function() {
    'use strict';

    angular
        .module('app.core')
        .factory('dashboardService', dashboardService);

    dashboardService.$inject = ['$http', '$location', '$q', 'clientConfig'];

    /* @ngInject */
    function dashboardService($http, $location, $q, clientConfig) {
        var readyPromise;

        var service = {
            get: get,
            getUsers: getUsers,
            getCompanies: getCompanies
        };

        return service;

        //Get Dashboard Details
        function get(userId, searchUserId, searchCompanyId, rowNum, perPage, sortOrder, sortFilter) {

            var url = clientConfig.endpoints.dashboardEndPoint.get.concat(userId, '/',
                            searchUserId, '/', searchCompanyId, '/', rowNum, '/',
                            perPage, '/', sortOrder, '/', sortFilter);

            console.log(url);

            return $http.get(url).then(function(data, status, headers, config)
                {
                    return data.data;
                })
                .catch(function(message) {
                    $location.url('/');
                });
        }

        //Get Dashboard Users
        function getUsers()
        {
            return $http.get(clientConfig.endpoints.dashboardEndPoint.getUsers)
                .then(function(data, status, headers, config)
                {
                    return data.data;
                })
                .catch(function(message) {
                    $location.url('/');
                });
        }

        //Get Dashboard Companies
        function getCompanies()
        {
            return $http.get(clientConfig.endpoints.dashboardEndPoint.getCompanies)
                .then(function(data, status, headers, config)
                {
                    return data.data;
                })
                .catch(function(message) {
                    $location.url('/');
                });
        }
    }
})();
