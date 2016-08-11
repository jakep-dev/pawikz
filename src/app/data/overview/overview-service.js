/**
 * Created by sherindharmarajan on 12/19/15.
 */
(function() {
    'use strict';

    angular
        .module('app.overview.service', [])
        .factory('overviewService', overviewService);

    /* @ngInject */
    function overviewService($http, $q, clientConfig, logger) {
        var readyPromise;

        var service = {
            get: get,
            getOverviewDefer: getOverviewDefer,
            save: save
        };

        return service;


        //Get Overview Details
        function get(projectId, userId)
        {
            var input = {
                userId: userId,
                projectId: projectId
            };

            return $http({
                url : clientConfig.endpoints.overViewEndPoint.get,
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


        //Get Overview Details
        function getOverviewDefer(projectId) {

            var deffered = $q.defer();
            var url = clientConfig.endpoints.overViewEndPoint.get.concat(projectId);

            $http.get(url)
                .then(function (data, status, headers, config) {
                    deffered.resolve(data.data);
                })
                .catch(function (error) {
                    deffered.reject();
                    logger.error(JSON.stringify(error));
                });

            return deffered;
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
