/**
 * Created by sherindharmarajan on 12/19/15.
 */
(function() {
    'use strict';

    angular
        .module('app.core')
        .factory('overviewService', overviewService);

    overviewService.$inject = ['$http', '$location', '$q', 'clientConfig'];

    /* @ngInject */
    function overviewService($http, $location, $q, clientConfig) {
        var readyPromise;

        var service = {
            get: get,
            save: save,
            ready: ready
        };

        return service;


        //Get Overview Details
        function get(projectId)
        {
            var url = clientConfig.endpoints.overViewEndPoint.get.concat(projectId);

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
        function save(userId, projectId, projectName, steps)
        {

            var input = {
                userId: userId,
                projectId: projectId,
                projectName: projectName,
                steps: steps
            };

            return $http({
                url : clientConfig.endpoints.overViewEndPoint.save,
                method : "POST",
                data : input,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
            })
                .then(function(data, status, headers, config) {
                    return data;
                })
                .catch(function(error) {
                    console.log('error while saving ' + error);
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
