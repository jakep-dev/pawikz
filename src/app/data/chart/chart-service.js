/**
 * Created by sherindharmarajan on 12/16/15.
 */
(function() {
    'use strict';

    angular.module('app.chart.service', [])
           .factory('stockService', stockService);

    /* @ngInject */
    function stockService($http, $q, logger, commonBusiness, stockChartBusiness) {
        /*
         * Added Variables to implement reset functionality 5/11/2016
         * */
        var initalStateData = {};
        var sigDevSources = null;
        var indices = null;
        var currentCompanyId = null;
        var competitors = null;

        var service = {
            stockData: stockData,
            getSavedChartData: getSavedChartData,
            findTickers: findTickers,
            getIndices: getIndices,
            getCompetitors: getCompetitors,
            getCurrentCompanyId: getCurrentCompanyId,
            saveChartSettings: saveChartSettings,
            saveChartAllSettings: saveChartAllSettings,
            setInitialStateData: setInitialStateData,
            getInitialStateData: getInitialStateData,
            DeleteSpecificChart: deleteSpecificChart,
            getSavedChartDefer: getSavedChartDefer,
            getSavedChartDataDefer: getSavedChartDataDefer,
            getSavedChartTableDefer: getSavedChartTableDefer,
            getSignificantDevelopmentList: getSignificantDevelopmentList,
            getSignificantDevelopmentDetail: getSignificantDevelopmentDetail,
            getMascadLargeLosseList: getMascadLargeLosseList,
            getMascadLargeLosseDetail: getMascadLargeLosseDetail,
            getSigDevSource: getSigDevSource,
            saveSigDevItems: saveSigDevItems
        };

        return service;

        function saveChartAllSettings(mnemonicItem) {

            var input = stockChartBusiness.getSaveChartInputObject(mnemonicItem);

            return $http({
                method: "POST",
                url: "/api/saveChartAllSettings",
                //url: "/chart/saveChartAllSettings_v2",
                data: input
            }).then(function (data, status, headers, config) {
                commonBusiness.emitWithArgument('updateInteractiveStockChartIds', data);
                return data.data;
            }).catch(function(error) {
                logger.error(JSON.stringify(error));
            });
        }

        function saveChartSettings(tickers, timeFrame, splits, dividends, earnings, start_date, end_date, chart_id, chartTitle) {
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
                    chart_id: chart_id,
                    chart_title: chartTitle,
                }
            }).then(function(data, status, headers, config) {
                return data.data;
            }).catch(function(error) {
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
            }).then(function(data, status, headers, config) {
                return data.data;
            }).catch(function(error) {
                logger.error(JSON.stringify(error));
            });
        }

        function getSavedChartData(projectId, stepId, mnemonic, itemId, ssnid, $cookies) {
            return $http({
                method: "POST",
                url: "/api/getSavedChartData",
                data: {
                    project_id: projectId,
                    step_id: stepId,
                    mnemonic: mnemonic,
                    item_id: itemId,
                    ssnid: ssnid
                }
            }).then(function(data, status, headers, config) {
                return data.data;
            }).catch(function(error) {
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
            }).then(function(data, status, headers, config) {
                return data.data;
            }).catch(function(error) {
                logger.error(JSON.stringify(error));
            });
        }

        function getIndices() {
            if (indices) {
                return indices;
            } else {
                return $http({
                    method: "POST",
                    url: "/api/getIndices",
                    data: {}
                }).then(function (data, status, headers, config) {
                    indices = data.data.indicesResp;
                    return data.data.indicesResp;
                }).catch(function(error) {
                    logger.error(JSON.stringify(error));
                });
            }
        }

        function getCurrentCompanyId() {
            return currentCompanyId;
        }

        function getCompetitors(companyId) {
            if ((currentCompanyId === companyId) && (competitors)) {
                return competitors;
            } else { 
                return $http({
                    method: "POST",
                    url: "/api/getCompetitors",
                    data: {
                        companyId: companyId
                    }
                }).then(function(data, status, headers, config) {
                    currentCompanyId = companyId;
                    competitors = data.data.competitors;
                    return data.data.competitors;
                }).catch(function(error) {
                    logger.error(JSON.stringify(error));
                });
            }
        }

        function setInitialStateData(array) {
            initalStateData.newStockCharts = array;
        }

        function getInitialStateData() {
            return initalStateData.newStockCharts;
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
            }).then(function(data, status, headers, config) {
                return data.data;
            }).catch(function(error) {
                logger.error(JSON.stringify(error));
            });
        }

        function saveSigDevItems(mnemonicItem) {

            var input = stockChartBusiness.getSaveSigDevInputObject(mnemonicItem);

            return $http({
                method: "POST",
                url: "/api/saveSigDevItems",
                data: input
            }).then(function(data, status, headers, config) {
                return data.data;
            }).catch(function(error) {
                logger.error(JSON.stringify(error));
            });
        }

        function getSavedChartDefer(projectId, stepId, mnemonic, itemId)
        {
             var all = $q.all([getSavedChartDataDefer(projectId, stepId, mnemonic, itemId).promise,
                                getSavedChartTableDefer(projectId, stepId, mnemonic, itemId).promise]);

            return all;
        }

        function getSavedChartDataDefer(projectId, stepId, mnemonic, itemId)
        {
            var deferred = $q.defer();
            
            $http({
                method: "POST",
                url: "/api/getSavedChartData",
                data: {
                    project_id: projectId,
                    step_id: stepId,
                    mnemonic: mnemonic,
                    item_id: itemId
                }
            }).then(function(data, status, headers, config) {
                deferred.resolve(data.data);
            }).catch(function(error) {
                deferred.reject();
                logger.error(JSON.stringify(error));
            });

            return deferred;
        }

        function getSavedChartTableDefer(projectId, stepId, mnemonic, itemId)
        {
            var deferred = $q.defer();
            
            $http({
                method: "POST",
                url: "/api/getSavedChartTable",
                data: {
                    project_id: projectId,
                    step_id: stepId,
                    mnemonic: mnemonic,
                    item_id: itemId
                }
            }).then(function(data, status, headers, config) {
                deferred.resolve(data.data);
            }).catch(function(error) {
                deferred.reject();
                logger.error(JSON.stringify(error));
            });

            return deferred;
        }

        function getSignificantDevelopmentList(companyId, startDate, endDate) {
            return $http({
                method: "POST",
                url : "/api/getSignificantDevelopmentList",
                data: {
                    companyId: companyId,
                    startDate: startDate,
                    endDate: endDate
                }
            }).then(function (data, status, headers, config) {
                return data.data;
            })
            .catch(function (error) {
                logger.error(JSON.stringify(error));
            });
        }

        function getSignificantDevelopmentDetail(sigdevId) {
            return $http({
                method: "POST",
                url : "/api/getSignificantDevelopmentDetail",
                data: {
                    sigdevId: sigdevId
                }
            }).then(function (data, status, headers, config) {
                return data.data;
            })
            .catch(function (error) {
                logger.error(JSON.stringify(error));
            });
        }

        function getMascadLargeLosseList(companyId, startDate, endDate) {
            return $http({
                method: "POST",
                url : "/api/getMascadLargeLosseList",
                data: {
                    companyId: companyId,
                    startDate: startDate,
                    endDate: endDate
                }
            }).then(function (data, status, headers, config) {
                return data.data;
            })
            .catch(function (error) {
                logger.error(JSON.stringify(error));
            });
        }

        function getMascadLargeLosseDetail(mascadId) {
            return $http({
                method: "POST",
                url : "/api/getMascadLargeLosseDetail",
                data: {
                    mascadId: mascadId
                }
            }).then(function (data, status, headers, config) {
                return data.data;
            })
            .catch(function (error) {
                logger.error(JSON.stringify(error));
            });
        }

        function getSigDevSource() {
            if (sigDevSources) {
                return sigDevSources;
            } else {
                return $http({
                    method: "POST",
                    url: "/api/getSigDevSource",
                    data: {}
                }).then(function (data, status, headers, config) {
                    sigDevSources = data.data.source;
                    return data.data.source;
                }).catch(function (error) {
                    logger.error(JSON.stringify(error));
                });
            }
        }

    }
})();