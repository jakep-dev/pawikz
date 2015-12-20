/**
 * Created by sherindharmarajan on 12/19/15.
 */

(function() {
    'use strict';

    angular
        .module('app.core')
        .factory('dashboardService', dashboardService);

    dashboardService.$inject = ['$http', '$location', '$q'];

    /* @ngInject */
    function dashboardService($http, $location, $q) {
        var readyPromise;

        var service = {
            get: get,
            getUsers: getUsers,
            getCompanies: getCompanies,
            ready: ready
        };

        return service;

        //Get Dashboard Users
        function getUsers()
        {
            return $http.get('/api/users')
                .then(function(data, status, headers, config)
                {
                    return data.data;
                })
                .catch(function(message) {
                    $location.url('/');
                });
        }

        //Get Dashboard Details
        function get(userId, searchUserId, searchCompanyId, rowNum, perPage, sortOrder, sortFilter) {

            var url = '/api/dashboard/'.concat(userId, '/', searchUserId, '/', searchCompanyId, '/', rowNum, '/',
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


        //Get Dashboard Companies
        function getCompanies()
        {
            return $http.get('/api/companies')
                .then(function(data, status, headers, config)
                {
                    return data.data;
                })
                .catch(function(message) {
                    $location.url('/');
                });
        }

        function getReady() {
            if (!readyPromise) {
                // Apps often pre-fetch session data ("prime the app")
                // before showing the first view.
                // This app doesn't need priming but we add a
                // no-op implementation to show how it would work.

                readyPromise = $q.when(service);
            }
            return readyPromise;
        }

        function ready(promisesArray) {
            return getReady()
                .then(function() {
                    return promisesArray ? $q.all(promisesArray) : readyPromise;
                })
                .catch();
        }
    }
})();
