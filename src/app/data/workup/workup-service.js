(function() {
    'use strict';

    angular
        .module('app.data')
        .factory('workupService', workupService);

    /* @ngInject */
    function workupService($http, clientConfig) {
        var readyPromise;

        var service = {
            createWorkUp: createWorkUp
        };

        return service;

        function createWorkUp(userId, templateId, companyId)
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
    }
})();
