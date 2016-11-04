/**
 * Created by sherindharmarajan on 12/16/15.
 */
(function() {
    'use strict';

    angular.module('app.chart.service', [])
           .factory('stockService', stockService);

    /* @ngInject */
    function stockService($http, $q, logger) {
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
            DeleteSpecificChart: deleteSpecificChart,
            createTemplatePDFRequest:createTemplatePDFRequest,
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

        function createTemplatePDFRequest(project_id, user_id, stepId, file_name, company_name, user_name, chart_name, chart_data, ssnid) {
            return $http({
                method: "POST",
                url: "/api/createTemplatePDFRequest",
                data: {
                    project_id: project_id,
                    user_id: user_id,
                    step_ids: stepId,
                    file_name: file_name,
                    company_name: company_name,
                    user_name: user_name,
                    chart_name: chart_name,
                    chart_data: chart_data,
                    ssnid: ssnid
                }
            }).then(function(data, status, headers, config) {
                return data.data;
            }).catch(function(error) {
                logger.error(JSON.stringify(error));
            });
        }

        return service;

        function saveChartAllSettings(companyId, stepId, projectId, ssnid, chartSettings) {
            var tmpdata =  {
                //Changing keynames as per jake plaras email on 26/5/2016
                company_id: companyId,
                step_id: stepId,
                project_id: projectId,
                ssnid: ssnid,
                data: chartSettings
            };
            return $http({
                method: "POST",
                url: "/api/saveChartAllSettings",
                //url: "/chart/saveChartAllSettings_v2",
                data: {
                    //Changing keynames as per jake plaras email on 26/5/2016
                    company_id: companyId,
                    step_id: stepId,
                    project_id: projectId,
                    ssnid: ssnid,
                    chartSettings: chartSettings
                }
            }).then(function(data, status, headers, config) {
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

        function stockData(tickers, timeFrame, splits, earnings, dividends, start_date, end_date, companyId, ssnid) {
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
                    companyId: companyId,
                    ssnid: ssnid
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
                angular.injector(['ngCookies']).invoke(['$cookies', function ($cookies) {
                    $cookies.putObject('tempChartData', data.data);
                }]);
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

        function getIndices(keyword) {
            return $http({
                method: "POST",
                url: "/api/getIndices",
                data: {}
            }).then(function(data, status, headers, config) {
                return data.data;
            }).catch(function(error) {
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
            }).then(function(data, status, headers, config) {
                return data.data;
            }).catch(function(error) {
                logger.error(JSON.stringify(error));
            });
        }

        function addInitialStateData(array) {
            // initalStateData.newCharts = [];
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
            }).then(function(data, status, headers, config) {
                //saveChartAllSettings();
                angular.injector(['ngCookies']).invoke(['$cookies', function($cookies) {
                    debugger;
                    $cookies.putObject('tempChartData', data.data);
                }]);
                return data.data;
            }).catch(function(error) {
                logger.error(JSON.stringify(error));
            });
        }

        function saveSigDevItems(projectId, stepId, mnemonic, itemId, sigDevItems) {
            return $http({
                method: "POST",
                url: "/api/saveSigDevItems",
                data: {
                    project_id: projectId,
                    step_id: stepId,
                    mnemonic: mnemonic,
                    item_id: itemId,
                    items: sigDevItems
                }
            }).then(function(data, status, headers, config) {
                return data.data;
            }).catch(function(error) {
                logger.error(JSON.stringify(error));
            });
        }

        function getSavedChartDefer(projectId, stepId, mnemonic, itemId, ssnid)
        {
             var all = $q.all([getSavedChartDataDefer(projectId, stepId, mnemonic, itemId, ssnid).promise,
                                getSavedChartTableDefer(projectId, stepId, mnemonic, itemId, ssnid).promise,
                                getSigDevSource().promise]);

            return all;
        }

        function getSavedChartDataDefer(projectId, stepId, mnemonic, itemId, ssnid)
        {
            var deffered = $q.defer();
            
            $http({
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
                angular.injector(['ngCookies']).invoke(['$cookies', function ($cookies) {
                    $cookies.putObject('tempChartData', data.data);
                }]);
                deffered.resolve(data.data);
            }).catch(function(error) {
                deffered.reject();
                logger.error(JSON.stringify(error));
            });

            return deffered;
        }

        function getSavedChartTableDefer(projectId, stepId, mnemonic, itemId, ssnid)
        {
            var deffered = $q.defer();
            
            $http({
                method: "POST",
                url: "/api/getSavedChartTable",
                data: {
                    project_id: projectId,
                    step_id: stepId,
                    mnemonic: mnemonic,
                    item_id: itemId,
                    ssnid: ssnid
                }
            }).then(function(data, status, headers, config) {
                deffered.resolve(data.data);
            }).catch(function(error) {
                deffered.reject();
                logger.error(JSON.stringify(error));
            });

            return deffered;
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

            var deffered = $q.defer();
                
            $http({
                method: "POST",
                url : "/api/getSigDevSource",
                data: {}
            }).then(function (data, status, headers, config) {
                deffered.resolve(data.data);
            }).catch(function(error) {
                deffered.reject();
                logger.error(JSON.stringify(error));
            });

            return deffered;
        }
    }
})();