(function() {
    'use strict';

    angular
        .module('app.data')
        .factory('templateService', templateService);

    templateService.$inject = ['$http', '$location', '$q', 'clientConfig'];

    /* @ngInject */
    function templateService($http, $location, $q, clientConfig) {
        var readyPromise;

        var service = {
            getSchema: getSchema,
            getData: getData
        };

        return service;


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
                    console.log('error while saving ' + error);
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
                    console.log('error while saving ' + error);
                });
        }
    }
})();
