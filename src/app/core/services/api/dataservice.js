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
            saveOverview: saveOverview,
            ready: ready
        };

        return service;

        //Get Dashboard Users
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

        //Get Dashboard Details
        function getDashboard(userId, searchUserId, searchCompanyId, rowNum, perPage, sortOrder, sortFilter) {

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

        //Get Overview Details
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

        //Save Overview Details
        function saveOverview(userId, projectId, steps)
        {

            var input = {
                userId: userId,
                projectId: projectId,
                steps: steps
            };


           return $http({
                    url : "/api/saveOverview",
                    method : "POST",
                    data : input,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                })
               .then(function(data, status, headers, config) {
                    console.log('Success');
                    console.log(data);
                    return data;
                })
               .catch(function(message) {
                    console.log('error while saving');
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
