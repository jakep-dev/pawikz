(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('msStockChartController', msStockChartController)
        .directive('msStockChart', msStockChartDirective);


    function msStockChartController(stockService, $rootScope, stockChartBusiness)
    {
        var vm = this;
        vm.selectedIndex ="";
        vm.searchVal = '';
        vm.searchedStocks = [];
        vm.selectedStockCount = 1;
        //variables
        //hard coded break grounds

        $rootScope.$on('chartDataChanged', function() {
            loadChartData();
        });

        function loadChartData() {
            var splitsValue = stockChartBusiness.splits == true ? 'Y': 'N';
            var earningsValue = stockChartBusiness.earnings == true ? 'Y': 'N';
            var dividendsValue = stockChartBusiness.dividends == true ? 'Y': 'N';
            var periodValue = stockChartBusiness.interval;
            var mainStock = stockChartBusiness.mainStock;
            var selectedPeerList = stockChartBusiness.selectedPeers;
            var selectedIndicesList =  stockChartBusiness.selectedIndices;
            var stockString = '';
            if (mainStock)  {
                stockString = mainStock + ',';
            }

            selectedPeerList.forEach( function(stock) {
                stockString =stockString + stock + ',';
            });

            selectedIndicesList.forEach( function(indics) {
                stockString = stockString + '^'+indics + ',';
            });


            if(stockString !=='') {
                stockString = stockString.slice(0, -1);
            }
            var start_date, end_date;
            var from = stockChartBusiness.startDate;
            var to = stockChartBusiness.endDate;
            if (periodValue ==='CUSTOM') {
                start_date = from.getFullYear() + '-' + (from.getMonth()+1) + '-' + from.getDate();
                end_date = to.getFullYear() + '-' + (to.getMonth()+1) + '-' + to.getDate();
            }
            vm.fetchChartData(stockString,periodValue, splitsValue, earningsValue, dividendsValue, start_date, end_date);
        }

        function convServiceResptoChartFormat(data) {
            var results = data;
            if (results && results.stockChartPrimaryData)
            {
                var outArr = [];

                var xdataArr = [];
                var datasetArr = [];
                var firstDatasetArr = [];
                var secondDatasetArr = [];
                var firstchartSerArr = [];
                var seriesByVolumes = {};
                var seriesByTickers = {};
                var secondchartSerArr = [];
                var primarTickerName = '';
                if (results && results.stockChartPrimaryData && results.stockChartPrimaryData.length > 0)
                    primarTickerName = results.stockChartPrimaryData[0].ticker;
                var peerData = null;
                var lengthDiff = false;

                if (results.stockChartPeerData && results.stockChartPeerData.length) {
                    peerData = results.stockChartPeerData;
                    if (results.stockChartPeerData.length > results.stockChartPrimaryData.length) {
                        lengthDiff = true;
                    }
                }
                //console.log('peerData after assigned: ' + peerData);


                for (var i = 0; i < results.stockChartPrimaryData.length; i++) {

                    var stock = results.stockChartPrimaryData[i];
                    var applyDividend = false;
                    var applyEarning = false;
                    var applySplit = false;

                    xdataArr[xdataArr.length] = stock.dataDate.substring(0, 10);

                    firstDatasetArr[firstDatasetArr.length] = parseFloat((peerData && lengthDiff) ? stock.percentChange : stock.priceClose);
                    secondDatasetArr[secondDatasetArr.length] = parseFloat(stock.volume);

                    if (!seriesByTickers[stock.ticker]) {
                        seriesByTickers[stock.ticker] = [];
                    }

                    if (results.dividends) {
                        for (var dividendCntr = 0; dividendCntr < results.dividends.length; dividendCntr++) {
                            if (stock.dataDate == results.dividends[dividendCntr].dataDate) {
                                applyDividend = true;
                            }
                        }
                    }

                    if (results.earnings) {
                        for (var earningCntr = 0; earningCntr < results.earnings.length; earningCntr++) {
                            if (stock.dataDate == results.earnings[earningCntr].dataDate) {
                                applyEarning = true;
                            }
                        }
                    }

                    if (results.splits) {
                        for (var splitsCntr = 0; splitsCntr < results.splits.length; splitsCntr++) {
                            if (stock.dataDate == results.splits[splitsCntr].dataDate) {
                                applySplit = true;
                            }
                        }
                    }
                    if (applyDividend) {
                        seriesByTickers[stock.ticker].push({
                            'y': parseFloat((peerData && lengthDiff) ? stock.percentChange : stock.priceClose),
                            'marker': {
                                'enabled': true,
                                'symbol': 'url(../assets/icons/images/Stock_Dividend.jpg)'
                            }
                        });
                    }
                    else if (applyEarning) {
                        seriesByTickers[stock.ticker].push({
                            'y': parseFloat((peerData && lengthDiff) ? stock.percentChange : stock.priceClose),
                            'marker': {
                                'enabled': true,
                                'symbol': 'url(../assets/icons/images/Stock_Earnings.jpg)'
                            }
                        });
                    }
                    else if (applySplit) {
                        seriesByTickers[stock.ticker].push({
                            'y': parseFloat((peerData && lengthDiff) ? stock.percentChange : stock.priceClose),
                            'marker': {
                                'enabled': true,
                                'symbol': 'url(../assets/icons/images/Stock_Split.jpg)'
                            }
                        });
                    }
                    else {
                        seriesByTickers[stock.ticker].push(parseFloat((peerData && lengthDiff) ? stock.percentChange : stock.priceClose));
                    }

                    if (!seriesByVolumes[stock.ticker]) {
                        seriesByVolumes[stock.ticker] = [];
                    }
                    seriesByVolumes[stock.ticker].push(parseFloat(stock.volume));
                }

                if (peerData) {

                    for (var i = 0; i < results.stockChartPeerData.length; i++) {

                        var stock = results.stockChartPeerData[i];
                        if (stock.ticker !== primarTickerName) {
                            xdataArr[xdataArr.length] = stock.dataDate;
                            firstDatasetArr[firstDatasetArr.length] = parseFloat(stock.percentChange);
                            // secondDatasetArr[secondDatasetArr.length] = parseFloat(stock.volume);

                            if (!seriesByTickers[stock.ticker]) {
                                seriesByTickers[stock.ticker] = [];
                            }
                            seriesByTickers[stock.ticker].push(parseFloat(stock.percentChange));

                            if (!seriesByVolumes[stock.ticker]) {
                                seriesByVolumes[stock.ticker] = [];
                            }
                            seriesByVolumes[stock.ticker].push(parseFloat(stock.volume));
                        }
                    }
                }


                // var stockName = results.stockChartPeerData[0].ticker;
                var seriesSet = [];
                var dataSet = [];
                for (var key in seriesByTickers) {
                    if (seriesByTickers.hasOwnProperty(key)) {
                        seriesSet.push({
                            data: seriesByTickers[key],
                            name: key
                        });
                        dataSet.push(data);
                    }
                }
                var volumeSet = [];
                for (var key in seriesByVolumes) {
                    if (seriesByVolumes.hasOwnProperty(key)) {
                        volumeSet.push({
                            data: seriesByVolumes[key]
                        });
                        dataSet.push(data);
                    }
                }
                //console.log('seriesSet----->',seriesSet);
                // firstchartSerArr[firstchartSerArr.length] = {"name":stockName, "data": firstDatasetArr};
                datasetArr[datasetArr.length] = {
                    "name": "",
                    "yaxisTitle": "Percent Change",
                    "xaxisTitle": "",
                    "series": seriesSet,
                    "data": dataSet,
                    "type": "spline",
                    "valueDecimals": 1,
                    "showlegend": true,
                    "showxaxisLabel": false,
                    "showtooltip": true,
                    "spacingTop": 30
                };
                secondchartSerArr[secondchartSerArr.length] = {"data": secondDatasetArr};
                datasetArr[datasetArr.length] = {
                    "name": "",
                    "yaxisTitle": "Volume (Millions)",
                    "xaxisTitle": "",
                    "series": secondchartSerArr,
                    "data": secondDatasetArr,
                    "type": "column",
                    "valueDecimals": 0,
                    "showlegend": false,
                    "showxaxisLabel": false,
                    "showtooltip": false,
                    "spacingTop": 7
                };

                outArr[outArr.length] = {
                    "xData": xdataArr,
                    "datasets": datasetArr
                };
                //console.log(JSON.stringify(data));
                //console.log(JSON.stringify(outArr).slice(1,-1));
                return JSON.stringify(outArr).slice(1, -1) + '|' + JSON.stringify(data);
                //return outArr;
            }
        }
        vm.fetchChartData = function (stockString, selectedPeriod, splits, earnings, dividends, start_date, end_date) {
            stockService
                .stockData(stockString, selectedPeriod, splits, earnings, dividends, start_date, end_date)
                .then(function(data) {
                    vm.stockDataSet=convServiceResptoChartFormat(data);
                    if(data.stockChartPeerData && data.stockChartPeerData.length){
                        vm.selectedStockCount = data.stockChartPeerData.length/data.stockChartPrimaryData.length;
                    }
                });
        };

        loadChartData();

        vm.onPeerRemove = function (peer) {
            var index = stockChartBusiness.selectedIndices.indexOf(peer);
            if (index !== -1 ) {
                var selectedIndices = stockChartBusiness.selectedIndices;
                selectedIndices.splice(index,1);
                stockChartBusiness.selectedIndices = selectedIndices;
            }
            var peerIndex = stockChartBusiness.selectedPeers.indexOf(peer);
            if (peerIndex !== -1 ) {
                stockChartBusiness.selectedPeers.splice(peerIndex,1);
            }
        };
    }

    /** @ngInject */
    function msStockChartDirective()
    {
        return {
            restrict: 'E',
            require: 'msStockChartToolBar',
            scope   : {

            },
            templateUrl: 'app/core/directives/ms-chart/ms-stock-chart/ms-stock-chart.html',
            controller : 'msStockChartController',
            controllerAs : 'vm',
            bindToController :true
        };
    }

})();