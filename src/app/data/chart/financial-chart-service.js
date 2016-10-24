/**
 * Created by sherindharmarajan on 12/16/15.
 */
(function () {
    'use strict';

    angular
        .module('app.financial.chart.service', [])
        .factory('financialChartService', financialChartService);

    /* @ngInject */
    function financialChartService($http, logger, financialChartBusiness) {
        /*
         * Added Variables to implement reset functionality 5/11/2016
         * */
        var initalStateData = {};
        var manualSaveData = {};
        var ratioTypes = null;
        var currentCompanyId = null;
        var peerIndustries = null;

        var service = {
            financialData: financialData,
            getSavedFinancialChart: getSavedFinancialChart,
            AddInitalStateData: addInitialStateData,
            GetInitialStateData: getInitialStateData,
            getFinancialChartRatioTypes: getFinancialChartRatioTypes,
            saveInteractiveFinancialChart: saveInteractiveFinancialChart,
            getFinancialChartPeerAndIndustries: getFinancialChartPeerAndIndustries
        };

        function addInitialStateData(array) {
            initalStateData.newFinancialCharts = array.slice();
        }

        function getInitialStateData() {
            return initalStateData;
        }

        function getFinancialChartRatioTypes() {
            if (ratioTypes) {
                return ratioTypes;
            } else {
                return $http({
                    method: "POST",
                    url: '/api/getFinancialChartRatioTypes',
                    data: {
                    }
                }).then(function (data, status, headers, config) {
                    ratioTypes = data.data;
                    return data.data;
                }).catch(function (error) {
                    logger.error(JSON.stringify(error));
                });
            }
        }

        function getFinancialChartPeerAndIndustries(company_id) {
            if ((currentCompanyId === company_id) && (peerIndustries)) {
                return peerIndustries;
            } else {
                return $http({
                    method: "POST",
                    url: "/api/getFinancialChartPeerAndIndustries",
                    data: { company_id: company_id }
                }).then(function (data, status, headers, config) {
                    currentCompanyId = company_id;
                    peerIndustries = data.data;
                    return data.data;
                }).catch(function (error) {
                    logger.error(JSON.stringify(error));
                });
            }
        }

        function getSavedFinancialChart(input) {
            return $http({
                method: "POST",
                url: "/api/getSavedFinancialChartData",
                data: input
            }).then(function (data, status, headers, config) {
                return financialChartBusiness.convertFinancialChartSettings(data.data);
            }).catch(function (error) {
                logger.error(JSON.stringify(error));
            });
        }

        function financialData(input) {
            return $http({
                method: "POST",
                url: "/api/getFinancialChartData",
                data: input
            }).then(function (data, status, headers, config) {
                return data.data;
            }).catch(function (error) {
                logger.error(JSON.stringify(error));
            });
        }

        function saveInteractiveFinancialChart(input) {
            return $http({
                method: "POST",
                url: "/api/saveFinancialChartSettings",
                data: input
            }).then(function (data, status, headers, config) {
                return data.data;
            }).catch(function (error) {
                logger.error(JSON.stringify(error));
            });
        }

        return service;
    }

})();
