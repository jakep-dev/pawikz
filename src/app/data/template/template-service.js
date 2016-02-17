(function() {
    'use strict';

    angular
        .module('app.data')
        .factory('templateService', templateService);

    /* @ngInject */
    function templateService($http, $q, clientConfig, logger) {
        var readyPromise;

        var service = {
            getSchema: getSchema,
            getData: getData,
            getSchemaAndData: getSchemaAndData,
            save: save
        };

        return service;


        function save(data)
        {
            return $http({
                url : clientConfig.endpoints.templateEndPoint.save,
                method : "POST",
                data : data,
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

        //Get Template Schema details
        function getSchema(projectId, stepId)
        {
            var input = {
                project_id : projectId,
                step_id: stepId
            }

            return $http({
                url : clientConfig.endpoints.templateEndPoint.schema,
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

        //Get Template Data
        function getData(projectId, stepId)
        {
            var input = {
                project_id : projectId,
                step_id: stepId
            }

            return $http({
                url : clientConfig.endpoints.templateEndPoint.mnemonics,
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

        //Get Schema Defer
        function getSchemaDefer(projectId, stepId)
        {
            var deffered = $q.defer();

            var input = {
                project_id : projectId,
                step_id: stepId
            }

            $http({
                url : clientConfig.endpoints.templateEndPoint.schema,
                method : "POST",
                data : input,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
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

        //Get Data Defer
        function getDataDefer(projectId, stepId)
        {
            var deffered = $q.defer();

            var input = {
                project_id : projectId,
                step_id: stepId
            }

            $http({
                url : clientConfig.endpoints.templateEndPoint.mnemonics,
                method : "POST",
                data : input,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
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

        //Get template schema & data details together
        function getSchemaAndData(projectId, stepId)
        {
            var all = $q.all([getSchemaDefer(projectId, stepId).promise, getDataDefer(projectId, stepId).promise]);

            return all;
        }
    }
})();
