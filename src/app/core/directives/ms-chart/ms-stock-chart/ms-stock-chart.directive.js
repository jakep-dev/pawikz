(function ()
{
    'use strict';

    angular
        .module('app.core')
        .directive('msStockChart', msStockChartDirective);

    /** @ngInject */
    function msStockChartDirective()
    {
        return {
            restrict: 'E',
            require: 'msStockChartToolBar',
            scope   : {

            },
            templateUrl: 'app/core/directives/ms-chart/ms-stock-chart/ms-stock-chart.html',
            controller : ['$mdSidenav','stockService','$rootScope','dialog',  function ($mdSidenav, stockService, $rootScope, dialog) {
                var vm = this;
                vm.selectedPeriod =  '3Y';
                vm.selectedIndex ="";
                vm.searchVal = '';
                vm.searchedStocks = [];
                vm.selectedStockCount = 1;
                //variables
                //hard coded break grounds
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
                    //vm.chartFilterState.selectedPeriod = selectedPeriod;
                    //vm.selectedIndicesList = vm.chartFilterState.selectedIndicesList;
                    //vm.selectedPeerList = vm.chartFilterState.selectedPeerList;
                    //vm.searchedStocks = vm.chartFilterState.searchedStocks;
                    stockService
                        .stockData(stockString, selectedPeriod, splits, earnings, dividends, start_date, end_date)
                        .then(function(data) {
                            vm.stockDataSet=convServiceResptoChartFormat(data);
                            if(data.stockChartPeerData && data.stockChartPeerData.length){
                                vm.selectedStockCount = data.stockChartPeerData.length/data.stockChartPrimaryData.length;
                            }
                        });
                };

                vm.fetchChartData("TSLA",vm.selectedPeriod, 'N', 'N','N', null, null);

                /*vm.fetchChartDataFromServer = function () {
                    //find selcected stocks comma seprated
                    var length = 1 + vm.chartFilterState.selectedIndicesList.length+vm.chartFilterState.selectedPeerList.length;
                    if(length < 5) {
                        if (vm.selectedIndex) {
                            var index = vm.chartFilterState.selectedIndicesList.indexOf(vm.selectedIndex);
                            if(index === -1 ) {
                                vm.chartFilterState.selectedIndicesList.push(vm.selectedIndex);
                            }
                        }
                        vm.chartFilterState.searchedStocks.forEach( function(stock) {
                            if (stock.selected)  {
                                var index = vm.chartFilterState.selectedPeerList.indexOf(stock.ticker);
                                if(index === -1 ) {
                                    vm.chartFilterState.selectedPeerList.push(stock.ticker);
                                }
                            }

                        });
                        vm.chartFilterState.searchedStocks = [];
                        vm.searchVal = '';
                        vm.selectedIndex = '';
                        var stockString = '';
                        if (vm.chartFilterState.mainStock)  {
                            stockString = vm.chartFilterState.mainStock + ',';
                        }

                        vm.chartFilterState.selectedPeerList.forEach( function(stock) {
                            stockString =stockString + stock + ',';
                        });

                        vm.chartFilterState.selectedIndicesList.forEach( function(indics) {
                            stockString = stockString + '^'+indics + ',';
                        });


                        if(stockString !=='') {
                            stockString = stockString.slice(0, -1);
                        }
                        var splits = (vm.chartFilterState.isSplits)?'Y':'N';
                        var earnings = (vm.chartFilterState.isEarnings)?'Y':'N';
                        var dividends = (vm.chartFilterState.isDividents)?'Y':'N';

                        var start_date, end_date;
                        console.log('vm.chartFilterState.to', vm.chartFilterState.to);
                        if (vm.chartFilterState.selectedPeriod.toUpperCase() ==='CUSTOM') {
                            start_date = vm.chartFilterState.from.year + '-' + vm.chartFilterState.from.month + '-' + vm.chartFilterState.from.date;
                            end_date = vm.chartFilterState.to.year + '-' + vm.chartFilterState.to.month + '-' + vm.chartFilterState.to.date;
                        }

                        stockService
                            .stockData(stockString, vm.chartFilterState.selectedPeriod, splits, earnings, dividends, start_date, end_date)
                            .success(function(data) {
                                vm.stockDataSet=convServiceResptoChartFormat(data);
                                if(data.stockChartPeerData && data.stockChartPeerData.length){
                                    vm.selectedStockCount = data.stockChartPeerData.length/data.stockChartPrimaryData.length;
                                }


                            });
                    }
                    else
                    {
                        dialog.alert( 'Error',"Max5 Stock allow to compare!",null,'alertId',{ok:{name:'ok',callBack:function(){
                            console.log('cliked ok');
                        }}});
                        vm.selectedIndex = '';
                    }

                };

                vm.fetchChartDataFromServer(); */

                vm.onPeerRemove = function (peer) {
                    var index = vm.chartFilterState.selectedIndicesList.indexOf(peer);
                    if (index !== -1 ) {
                        vm.chartFilterState.selectedIndicesList.splice(index,1);
                    }
                    var peerIndex = vm.chartFilterState.selectedPeerList.indexOf(peer);
                    if (peerIndex !== -1 ) {
                        vm.chartFilterState.selectedPeerList.splice(peerIndex,1);
                    }
                    vm.fetchChartDataFromServer();
                };

            }],
            controllerAs : 'vm',
            bindToController :true
        };
    }

})();