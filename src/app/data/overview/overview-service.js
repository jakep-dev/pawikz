/**
 * Created by sherindharmarajan on 12/19/15.
 */
(function() {
    'use strict';

    angular
        .module('app.data')
        .factory('overviewService', overviewService);

    overviewService.$inject = ['$http', '$location', '$q', 'clientConfig'];

    /* @ngInject */
    function overviewService($http, $location, $q, clientConfig, logger) {
        var readyPromise;

        var service = {
            get: get,
            save: save
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
                .catch(function(error) {
                    logger.error(JSON.stringify(error));
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
                    logger.error(JSON.stringify(error));
                });
        }
    }
})();
