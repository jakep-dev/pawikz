/**
 * Created by sherindharmarajan on 12/19/15.
 */

(function() {
    'use strict';

    angular
        .module('app.dashboard.service', [])
        .factory('dashboardService', dashboardService);

    /* @ngInject */
    function dashboardService($http, clientConfig, logger) {
        var readyPromise;

        var service = {
            get: get,
            getUsers: getUsers,
            getCompanies: getCompanies,
            processRemoveWorkUp: processRemoveWorkUp
        };

        return service;

        //Get Dashboard Details
        function get(userId, searchUserId, searchCompanyId, rowNum, perPage, sortOrder,
                     sortFilter, searchFilter, projectId) {

            var input =  {
                userId: userId,
                projectId: projectId,
                searchUserId: searchUserId,
                searchCompanyId: searchCompanyId,
                rowNum: rowNum,
                perPage: perPage,
                sortOrder: sortOrder,
                sortFilter: sortFilter,
				searchFilter: searchFilter
            };

            return $http.post(clientConfig.endpoints.dashboardEndPoint.get, input)
                .then(function(data, status, headers, config) {
                    return data.data;
                },function(error) {
                    logger.error(JSON.stringify(error));
                });
        }

        //Get Dashboard Users
        function getUsers(userId) {
            var input = {
                userId: userId
            };

            return $http.post(clientConfig.endpoints.dashboardEndPoint.getUsers, input)
                .then(
                    function (data, status, headers, config) {
                        return data.data;
                    },
                    function (error) {
                        logger.error(JSON.stringify(error));
                    }
                );
        }

        //Get Dashboard Companies
        function getCompanies(userId) {
            var input = {
                userId: userId
            };

            return $http.post(clientConfig.endpoints.dashboardEndPoint.getCompanies, input)
                .then(
                    function (data, status, headers, config) {
                        return data.data;
                    }
                )
                .catch(
                    function (error) {
                        logger.error(JSON.stringify(error));
                    }
                );
        }

        function processRemoveWorkUp(deleteProjectId, filterParam)
        {
            var input =  {
                projectId: deleteProjectId,
                filterParam: filterParam
            };

            return $http.post(clientConfig.endpoints.dashboardEndPoint.processRemoveWorkUp, input)
                .then(function(data, status, headers, config) {
                    return data.data;
                },function(error) {
                    logger.error(JSON.stringify(error));
                });
        }
    }
})();
