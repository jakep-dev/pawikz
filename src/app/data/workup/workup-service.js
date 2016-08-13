(function() {
    'use strict';

    angular
        .module('app.workup.service', [])
        .factory('workupService', workupService);

    /* @ngInject */
    function workupService($http, clientConfig) {
        var readyPromise;

        var service = {
            create: create,
            renew: renew
        };

        return service;

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
                    return data;
                })
                .catch(function(error) {

                });
        }

        function renew(userId, projectId)
        {
            var input = {
                userId: userId,
                projectId: projectId
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
    }
})();
