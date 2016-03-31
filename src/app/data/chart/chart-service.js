/**
 * Created by sherindharmarajan on 12/16/15.
 */
(function () {
    'use strict';

    angular
        .module('app.data')
        .factory('stockService', stockService);

    /* @ngInject */
    function stockService($http, logger)
    {
        var service = {
            stockData: stockData,
            getSavedChartData: getSavedChartData,
            findTickers: findTickers,
            getIndices: getIndices,
            saveChartSettings : saveChartSettings,
            saveChartAllSettings : saveChartAllSettings
        };

        return service;

        function saveChartAllSettings(companyId, stepId, projectId, chartSettings) {
            return $http({
                method: "POST",
                url:"/api/saveChartAllSettings",
                data: {
                    companyId : companyId,
                    stepId : stepId,
                    projectId : projectId,
                    chartSettings : chartSettings
                }
            }).then(function(data, status, headers, config)
            {
                return data.data;
            })
                .catch(function(error) {
                    logger.error(JSON.stringify(error));
                });
        }

        function saveChartSettings(tickers, timeFrame,splits, dividends, earnings, start_date, end_date, companyId, chartTitle, mnemonic, itemId, stepId, projectId, chart_id) {
            return $http({
                method: "POST",
                url:"/api/saveChartSettings",
                data: {
                    tickers : tickers,
                    period:timeFrame,
                    splits:splits,
                    dividends:dividends,
                    earnings: earnings,
                    start_date: start_date,
                    end_date : end_date,
                    companyId : companyId,
                    chartTitle : chartTitle,
                    mnemonic : mnemonic,
                    itemId : itemId,
                    stepId : stepId,
                    projectId : projectId
                }
            }).then(function(data, status, headers, config)
            {
                return data.data;
            })
                .catch(function(error) {
                    logger.error(JSON.stringify(error));
                });
        }

        function stockData(tickers, timeFrame,splits,earnings, dividends, start_date, end_date, companyId) {

            return $http({
                method: "POST",
                url:"/api/getChartData",
                data: {
                    tickers : tickers,
                    period:timeFrame,
                    splits:splits,
                    dividends:dividends,
                    earnings: earnings,
                    start_date: start_date,
                    end_date : end_date,
                    companyId : companyId
                }
            }).then(function(data, status, headers, config)
                {
                    return data.data;
                })
                .catch(function(error) {
                    logger.error(JSON.stringify(error));
                });
        }

        function getSavedChartData(projectId, stepId, mnemonic, itemId) {
            return $http({
                method: "POST",
                url:"/api/getSavedChartData",
                data: {
                    projectId : projectId,
                    stepId:stepId,
                    mnemonic:mnemonic,
                    itemId:itemId
                }
            }).then(function(data, status, headers, config)
            {
                return data.data;
            })
            .catch(function(error) {
                logger.error(JSON.stringify(error));
            });
        }

        function findTickers(keyword) {
            return $http({
                method: "POST",
                url:"/api/findTickers",
                data: {
                    keyword : keyword
                }
            }).then(function(data, status, headers, config)
            {
                return data.data;
            })
                .catch(function(error) {
                    logger.error(JSON.stringify(error));
                });
        }

        function getIndices(keyword) {
            return $http({
                method: "POST",
                url: "/api/getIndices",
                data: {}
            }).then(function(data, status, headers, config)
            {
                return data.data;
            })
                .catch(function(error) {
                    logger.error(JSON.stringify(error));
                });
        }
    }

})();
