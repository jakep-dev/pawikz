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
        /*
         * Added Variables to implement reset functionality 5/11/2016
         * */
        var initalStateData = {};
        var manualSaveData = {};


        var service = {
            stockData: stockData,
            getSavedChartData: getSavedChartData,
            findTickers: findTickers,
            getIndices: getIndices,
            getCompetitors: getCompetitors,
            saveChartSettings: saveChartSettings,
            saveChartAllSettings: saveChartAllSettings,
            AddInitalStateData: addInitialStateData, //Added for reset functionality
            GetInitialStateData: getInitialStateData,
            AddManualSaveData: addmanualSaveData,
            GetManualSaveData: getmanualSaveData,    //End of reset functionality options
            DeleteSpecificChart: deleteSpecificChart
        };

        return service;
        //chartSettings: chartSettings
        function saveChartAllSettings(companyId, stepId, projectId, chartSettings) {
            return $http({
                method: "POST",
                url: "/api/saveChartAllSettings",
                data: {
                    companyId: companyId,
                    stepId: stepId,
                    projectId: projectId,
                    data: chartSettings
                }
            }).then(function (data, status, headers, config) {
                return data.data;
            })
                .catch(function (error) {
                    logger.error(JSON.stringify(error));
                });
        }

        function saveChartSettings(tickers, timeFrame, splits, dividends, earnings, start_date, end_date, companyId, chartTitle, mnemonic, itemId, stepId, projectId, chart_id) {
            return $http({
                method: "POST",
                url: "/api/saveChartSettings",
                data: {
                    tickers: tickers,
                    period: timeFrame,
                    splits: splits,
                    dividends: dividends,
                    earnings: earnings,
                    start_date: start_date,
                    end_date: end_date,
                    companyId: companyId,
                    chartTitle: chartTitle,
                    mnemonic: mnemonic,
                    itemId: itemId,
                    stepId: stepId,
                    projectId: projectId,
                    chart_id: chart_id
                }
            }).then(function (data, status, headers, config) {
                return data.data;
            })
                .catch(function (error) {
                    logger.error(JSON.stringify(error));
                });
        }

        function stockData(tickers, timeFrame, splits, earnings, dividends, start_date, end_date, companyId) {

            return $http({
                method: "POST",
                url: "/api/getChartData",
                data: {
                    tickers: tickers,
                    period: timeFrame,
                    splits: splits,
                    dividends: dividends,
                    earnings: earnings,
                    start_date: start_date,
                    end_date: end_date,
                    companyId: companyId
                }
            }).then(function (data, status, headers, config) {
                return data.data;
            })
                .catch(function (error) {
                    logger.error(JSON.stringify(error));
                });
        }

        function getSavedChartData(projectId, stepId, mnemonic, itemId, $cookies) {
            return $http({
                method: "POST",
                url: "/api/getSavedChartData",
                data: {
                    projectId: projectId,
                    stepId: stepId,
                    mnemonic: mnemonic,
                    itemId: itemId
                }
            }).then(function (data, status, headers, config) {

                angular.injector(['ngCookies']).invoke(['$cookies', function ($cookies) {
                    $cookies.putObject('tempChartData', data.data);
                }]);
                return data.data;
            })
                .catch(function (error) {
                    logger.error(JSON.stringify(error));
                });
        }

        function findTickers(keyword) {
            return $http({
                method: "POST",
                url: "/api/findTickers",
                data: {
                    keyword: keyword
                }
            }).then(function (data, status, headers, config) {
                return data.data;
            })
                .catch(function (error) {
                    logger.error(JSON.stringify(error));
                });
        }

        function getIndices(keyword) {
            return $http({
                method: "POST",
                url: "/api/getIndices",
                data: {}
            }).then(function (data, status, headers, config) {
                return data.data;
            })
                .catch(function (error) {
                    logger.error(JSON.stringify(error));
                });
        }

        function getCompetitors(companyId) {
            return $http({
                method: "POST",
                url: "/api/getCompetitors",
                data: {
                    companyId: companyId
                }
            }).then(function (data, status, headers, config) {
                return data.data;
            })
                .catch(function (error) {
                    logger.error(JSON.stringify(error));
                });
        }

        function addInitialStateData(array) {
//            initalStateData.newCharts = [];
            initalStateData.newCharts = array.slice();
        }

        function getInitialStateData() {
            return initalStateData;
        }

        function addmanualSaveData(array) {
            manualSaveData.newCharts = [];
            manualSaveData.newCharts.push(array);
        }

        function getmanualSaveData() {
            return manualSaveData;
        }

        function deleteSpecificChart(projectId, stepId, mnemonic, itemId, project_image_code, chartId, ssnId) {
            return $http({
                method: "POST",
                url: "/charts/deleteSpecificChart",
                data: {
                    projectId: projectId,
                    stepId: stepId,
                    mnemonic: mnemonic,
                    itemId: itemId,
                    project_image_code: project_image_code,
                    chart_id: chartId,
                    ssnid: ssnId
                }
            }).then(function (data, status, headers, config) {
                angular.injector(['ngCookies']).invoke(['$cookies', function ($cookies) {
                    $cookies.putObject('tempChartData', data.data);
                }]);
                return data.data;
            })
                .catch(function (error) {
                    logger.error(JSON.stringify(error));
                });
        }
    }

})();
