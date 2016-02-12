/**
 * Created by sherindharmarajan on 12/16/15.
 */
(function () {
    'use strict';

    angular
        .module('app.data')
        .factory('stockAPIResponseTransformer', stockAPIResponseTransformer)
        .factory('stockService', stockService);

    stockService.$inject = ['$http', 'stockAPIResponseTransformer'];

    function stockAPIResponseTransformer()
    {
        return function (data) {
            data = JSON.parse(data);
            return data;
        };
    }

    /* @ngInject */
    function stockService($http, stockAPIResponseTransformer)
    {
        var service = {
            stockData: stockData,
            getSavedChartData: getSavedChartData,
            findTickers: findTickers,
            getIndices: getIndices
        };

        return service;


        function stockData(tickers, timeFrame,splits, dividends, earnings, start_date, end_date) {
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
                    end_date : end_date
                },
                transformResponse: stockAPIResponseTransformer
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
                },
                transformResponse: stockAPIResponseTransformer
            });
        }

        function findTickers(keyword) {
            return $http({
                method: "POST",
                url:"/api/findTickers",
                data: {
                    keyword : keyword
                },
                transformResponse: stockAPIResponseTransformer
            });
        }

        function getIndices(keyword) {
            return $http({
                method: "POST",
                url: "/api/getIndices",
                data: {},
                transformResponse: stockAPIResponseTransformer
            });
        }
    }

})();
