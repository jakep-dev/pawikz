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
        var service = {
            get: get,
            getProjectHistoryDefer: getProjectHistoryDefer,
            getProjectHistoryFilters: getProjectHistoryFilters
        };
        return service;

        //Get project history filter details
        //Steps, FieldNames, ModifiedBy, ModifiedDate
        function getProjectHistoryFilters(projectId, filterType, step){
            var input = {
                projectId: projectId,
                filterType: filterType,
                step: step
            };

            return $http({
                url : clientConfig.endpoints.projectHistoryEndPoint.getFilters,
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

        //Get Project History details on Defer by projectId, userId, rowStart, rowEnd
        function getProjectHistoryDefer(projectId, userId, rowStart, rowEnd, stepId, fieldName,
                                        modifiedBy, modifiedDate, action){
            var deffered = $q.defer();

            var input = {
                userId: userId,
                projectId: projectId,
                rowStart: rowStart,
                rowEnd: rowEnd,
                stepId: stepId,
                fieldName: fieldName,
                modifiedBy: modifiedBy,
                modifiedDate: modifiedDate,
                action: action
            };

            console.log('Project History Defer Inputs');
            console.log(input);

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
