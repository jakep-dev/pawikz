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
            ready: ready
        };

        return service;

        function getDashboard() {
            return $http.get('/api/dashboard')
                .then(getDashboardComplete)
                .catch(function(message) {
                    $location.url('/');
                });

            function getDashboardComplete(data, status, headers, config) {
                return data.data;
            }
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
