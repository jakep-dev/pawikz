(function() {
    'use strict';

    angular
        .module('app.reports.service', [])
        .factory('reportsService', reportsService);

    /* @ngInject */
    function reportsService($http, $q, clientConfig, logger) {
        var readyPromise;

        var service = {
            get: get,
            getPDFLink: getPDFLink,
            getPreviewReport: getPreviewReport
        };

        return service;


        function get(companyId, userId, length, pageNo) {
            var input = {
                companyId: companyId,
                userId: userId,
                length: length,
                pageNo: pageNo
            }

            return $http({
                    url: clientConfig.endpoints.reportsEndPoint.get,
                    method: "POST",
                    data: input,
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

        function getPDFLink() {
            var input = {
            }

            return $http({
                    url: clientConfig.endpoints.reportsEndPoint.getPDFLink,
                    method: "POST",
                    data: input,
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

        function getPreviewReport(url, userId) {
            var input = {
                url: url,
                userId: userId
            }

            return $http({
                    url: clientConfig.endpoints.reportsEndPoint.getPreviewReport,
                    method: "POST",
                    data: input,
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