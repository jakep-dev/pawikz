(function() {
    'use strict';

    angular
        .module('app.template.service', [])
        .factory('templateService', templateService);

    /* @ngInject */
    function templateService($http, $q, clientConfig, logger) {
        var readyPromise;

        var service = {
            getSchema: getSchema,
            getData: getData,
            getDynamicTableData: getDynamicTableData,
            saveDynamicTableData: saveDynamicTableData,
            addDynamicTableData: addDynamicTableData,
            deleteDynamicTableData: deleteDynamicTableData,
            getSchemaDefer: getSchemaDefer,
            getDataDefer: getDataDefer,
            save: save,
			getScrapedHTML: getScrapedHTML
        };

        return service;

        function getDynamicTableData(projectId, stepId,
                                     mnemonic, itemId, columns)
        {
            var input = {
                project_id : projectId,
                step_id: stepId,
                mnemonic: mnemonic,
                item_id: itemId,
                columns: columns
            };

            return $http({
                url : clientConfig.endpoints.templateEndPoint.dynamic,
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

        function save(data)
        {
            return $http({
                url : clientConfig.endpoints.templateEndPoint.save,
                method : "POST",
                data : data,
                contentType: "application/json; charset=utf-8",
                dataType: "json"
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
            };

            return $http({
                url : clientConfig.endpoints.templateEndPoint.schema,
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

        //Get Template Data
        function getData(projectId, stepId)
        {
            var input = {
                project_id : projectId,
                step_id: stepId
            };

            return $http({
                url : clientConfig.endpoints.templateEndPoint.mnemonics,
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

        //Get Schema Defer
        function getSchemaDefer(projectId, stepId)
        {
            var deffered = $q.defer();

            var input = {
                project_id : projectId,
                step_id: stepId
            };

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
            };

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

        function saveDynamicTableData(projectId, stepId,
                                     mnemonic, itemId, table)
        {
            var input = {
                project_id : projectId,
                step_id: stepId,
                mnemonic: mnemonic,
                item_id: itemId,
                table: table
            };

            return $http({
                url : clientConfig.endpoints.templateEndPoint.saveDynamic,
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

        function addDynamicTableData(projectId, stepId,
                                     mnemonic, itemId, table)
        {
            var input = {
                project_id : projectId,
                step_id: stepId,
                mnemonic: mnemonic,
                item_id: itemId,
                table: table
            }

            return $http({
                url : clientConfig.endpoints.templateEndPoint.addDynamic,
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

        function deleteDynamicTableData(projectId, stepId,
                                     mnemonic, itemId, table)
        {
            var input = {
                project_id : projectId,
                step_id: stepId,
                mnemonic: mnemonic,
                item_id: itemId,
                table: table
            }

            return $http({
                url : clientConfig.endpoints.templateEndPoint.deleteDynamic,
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
		
		function getScrapedHTML(projectId, stepId,
                                     mnemonic, itemId)
        {
            var input = {
                project_id : projectId,
                step_id: stepId,
                mnemonic: mnemonic,
                item_id: itemId
            }

            return $http({
                url : clientConfig.endpoints.templateEndPoint.getScrapedHTML,
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
    }
})();
