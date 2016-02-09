/**
 * Created by sherindharmarajan on 12/19/15.
 */

(function() {
    'use strict';

    angular
        .module('app.data')
        .factory('dashboardService', dashboardService);

    dashboardService.$inject = ['$http', '$location', '$q', 'clientConfig'];

    /* @ngInject */
    function dashboardService($http, $location, $q, clientConfig, logger) {
        var readyPromise;

        var service = {
            get: get,
            getUsers: getUsers,
            getCompanies: getCompanies
        };

        return service;

        //Get Dashboard Details
        function get(userId, searchUserId, searchCompanyId, rowNum, perPage, sortOrder, sortFilter) {

            var input =  {
                userId: userId,
                searchUserId: searchUserId,
                searchCompanyId: searchCompanyId,
                rowNum: rowNum,
                perPage: perPage,
                sortOrder: sortOrder,
                sortFilter: sortFilter
            };

            return $http.post(clientConfig.endpoints.dashboardEndPoint.get, input)
                .then(function(data, status, headers, config) {
                    return data.data;
                },function(error) {
                    logger.error(JSON.stringify(error));
                });
        }

        //Get Dashboard Users
        function getUsers(userId)
        {
            var url = clientConfig.endpoints.dashboardEndPoint.getUsers.concat(userId)

            return $http.get(url)
                .then(function(data, status, headers, config)
                {
                    return data.data;
                })
                .catch(function(error) {
                    logger.error(JSON.stringify(error));
                });
        }

        //Get Dashboard Companies
        function getCompanies(userId)
        {
            var url = clientConfig.endpoints.dashboardEndPoint.getCompanies.concat(userId);

            return $http.get(url)
                .then(function(data, status, headers, config)
                {
                    return data.data;
                })
                .catch(function(error) {
                    logger.error(JSON.stringify(error));
                });
        }
    }
})();
