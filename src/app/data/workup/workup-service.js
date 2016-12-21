(function() {
    'use strict';

    angular
        .module('app.workup.service', [])
        .factory('workupService', workupService);

    /* @ngInject */
    function workupService($http, clientConfig, logger) {
        var readyPromise;

        var service = {
            create: create,
            renew: renew,
            getStatus: getStatus,
            lock: lock,
            unlock: unlock,
            delete: deleteWorkup
        };

        return service;

        function lock(projectId, userId) {
            var input = {
                userId: userId,
                projectId: projectId
            };

            return $http({
                url : clientConfig.endpoints.workUpEndPoint.lock,
                method : "POST",
                data : input,
                contentType: "application/json; charset=utf-8",
                dataType: "json"
            }).then(function(data, status, headers, config) {
                    return data;
                })
                .catch(function(error) {

                });
        }

        function unlock(projectId, userId) {
            var input = {
                userId: userId,
                projectId: projectId
            };

            return $http({
                url : clientConfig.endpoints.workUpEndPoint.unlock,
                method : "POST",
                data : input,
                contentType: "application/json; charset=utf-8",
                dataType: "json"
            }).then(function(data, status, headers, config) {
                    return data;
                })
                .catch(function(error) {

                });
        }

        ///Create the new workup
        function create(userId, templateId, companyId)
        {
            var input = {
                userId: userId,
                templateId: templateId,
                companyId: companyId
            };

            return $http({
                        url : clientConfig.endpoints.workUpEndPoint.create,
                        method : "POST",
                        data : input,
                        contentType: "application/json; charset=utf-8",
                        dataType: "json"
                        }).then(function(data, status, headers, config) {
                    return data.data;
                })
                .catch(function(error) {
                    logger.error(JSON.stringify(error));
                });
        }

        ///Renew the workup
        function renew(userId, projectId, source)
        {
            var input = {
                userId: userId,
                projectId: projectId,
                source: source
            };

            return $http({
                url : clientConfig.endpoints.workUpEndPoint.renew,
                method : "POST",
                data : input,
                contentType: "application/json; charset=utf-8",
                dataType: "json"
            }).then(function(data, status, headers, config) {
                    return data;
                })
                .catch(function(error) {

                });
        }

        ///Get the status of the create-workup.
        function getStatus(projectId)
        {
            var input = {
                projectId: projectId
            };

            return $http({
                url : clientConfig.endpoints.workUpEndPoint.status,
                method : "POST",
                data : input,
                contentType: "application/json; charset=utf-8",
                dataType: "json"
            }).then(function(data, status, headers, config) {
                    return data;
                })
                .catch(function(error) {

                });
        }

        function deleteWorkup(projectId, userId)
        {
            var input = {
                projectId: projectId,
                userId: userId
            };

            return $http({
                url : clientConfig.endpoints.workUpEndPoint.delete,
                method : "POST",
                data : input,
                contentType: "application/json; charset=utf-8",
                dataType: "json"
            }).then(function(data, status, headers, config) {
                return data;
            })
            .catch(function(error) {

            });
        }
    }
})();
