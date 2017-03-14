/**
 * Created by sherindharmarajan on 12/19/15.
 */
(function() {
    'use strict';

    angular
        .module('app.project-history.service', [])
        .factory('projectHistoryService', projectHistoryService);

    /* @ngInject */
    function projectHistoryService($http, $q, clientConfig, logger) {
        var readyPromise;

        var service = {
            get: get,
            getProjectHistoryDefer: getProjectHistoryDefer
        };

        return service;

        //Get Project History details on Defer by projectId, userId, rowStart, rowEnd
        function getProjectHistoryDefer(projectId, userId, rowStart, rowEnd){
            var deffered = $q.defer();

            console.log('getProjectHistoryDefer');

            var input = {
                userId: userId,
                projectId: projectId,
                rowStart: rowStart,
                rowEnd: rowEnd
            };

            $http({
                url : clientConfig.endpoints.projectHistoryEndPoint.get,
                method : "POST",
                data : input,
                contentType: "application/json; charset=utf-8",
                dataType: "json"
            })
                .then(function(data, status, headers, config) {
                    deffered.resolve(data.data);
                })
                .catch(function(error) {
                    deffered.reject();
                    logger.error(JSON.stringify(error));
                });

            return deffered;
        }

        //Get Project History details based on projectId, userId, rowStart, rowEnd
        function get(projectId, userId, rowStart, rowEnd){

            var input = {
                userId: userId,
                projectId: projectId,
                rowStart: rowStart,
                rowEnd: rowEnd
            };

            console.log('getProjectHistory');

            return $http({
                url : clientConfig.endpoints.projectHistoryEndPoint.get,
                method : "POST",
                data : input,
                contentType: "application/json; charset=utf-8",
                dataType: "json"
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
