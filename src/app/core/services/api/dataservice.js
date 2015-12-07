(function() {
    'use strict';

    angular
        .module('app.core')
        .factory('dataservice', dataservice);

    dataservice.$inject = ['$http', '$location', '$q'];
    /* @ngInject */
    function dataservice($http, $location, $q) {
        var readyPromise;

        var service = {
            getDashboard: getDashboard,
            getDashboardUsers: getDashboardUsers,
            getDashboardCompanies: getDashboardCompanies,
            getOverview: getOverview,
            ready: ready
        };

        return service;

        function getDashboardUsers()
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

        function getDashboard(userId, searchUserId, searchCompanyId, rowNum, perPage, sortOrder, sortFilter) {

            var url = '/api/dashboard/'.concat(userId, '/', searchUserId, '/', searchCompanyId, '/', rowNum, '/',
                                               perPage, '/', sortOrder, '/', sortFilter);

            console.log(url);

            return $http.get(url)
                .then(function(data, status, headers, config)
                {
                    return data.data;
                })
                .catch(function(message) {
                    $location.url('/');
                });
        }

        function getDashboardCompanies()
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

        function getOverview(projectId)
        {
            var url = '/api/overview/'.concat(projectId);

            return $http.get(url)
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
