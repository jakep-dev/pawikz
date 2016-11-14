(function () {
    'use strict';

    angular.module('app.core')
           .controller('msStockChartController', msStockChartController)
           .directive('msStockChart', msStockChartDirective);


    function msStockChartController($scope,stockService, commonBusiness, templateBusinessFormat, store) {
        var vm = this;
        vm.selectedIndex ="";
        vm.searchVal = '';
        vm.searchedStocks = [];
        vm.selectedStockCount = 1;
        vm.companyId = commonBusiness.companyId;

        //for stock table variables
        vm.selectedSources = null;
        vm.selectedRange = null;
        vm.selectedDate = null;

        vm.onFilterStateUpdate = function() {
            loadChartData();
        };

        $scope.$on('filterSateUpdate', function(event) {
            $scope.$broadcast('resetEvents');
            loadChartData();
        });

        $scope.$watch('vm.selectedSources + vm.selectedRange + vm.selectedDate', function (newValue, oldValue) {
            if(newValue !== oldValue){
               vm.tableInfo = defineTableInfo();
            }
        });

        function loadChartData() {
            var splitsValue = vm.filterState.splits == true ? 'Y': 'N';
            var earningsValue = vm.filterState.earnings == true ? 'Y': 'N';
            var dividendsValue = vm.filterState.dividends == true ? 'Y': 'N';
            var periodValue = vm.filterState.interval;
            var mainStock = vm.filterState.mainStock;
            var selectedPeerList = vm.filterState.selectedPeers;
            var selectedIndicesList =  vm.filterState.selectedIndices;
            var selectedCompetitors = vm.filterState.selectedCompetitors;
            var stockString = '';

            if (mainStock)  {
                stockString = mainStock + ',';
            }

            if (selectedPeerList != null) {
                selectedPeerList.forEach(function(stock) {
                    stockString = stockString + stock + ',';
                });
            }

            if (selectedCompetitors != null) {
                selectedCompetitors.forEach(function(stock) {
                    stockString = stockString + stock + ',';
                });
            }

            if (selectedIndicesList != null) {
                selectedIndicesList.forEach(function(indics) {
                    stockString = stockString + '^' + indics + ',';
                });
            }

            if (stockString !== '') {
                stockString = stockString.slice(0, -1);
            }

            var start_date;
            var end_date;
            if (periodValue === 'CUSTOM') {
                start_date = templateBusinessFormat.formatDate(vm.filterState.startDate, 'YYYY-MM-DD');
                end_date = templateBusinessFormat.formatDate(vm.filterState.endDate, 'YYYY-MM-DD');
            }
            vm.fetchChartData(stockString, periodValue, splitsValue, earningsValue, dividendsValue, start_date, end_date, vm.companyId);
        }

        function convServiceResptoChartFormat(data) {
            var results = data;
            if (results && results.stockChartPrimaryData) {
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
                var firstChartTitle = 'Price';
                var peerData = null;
                var lengthDiff = false;

                if (results && results.stockChartPrimaryData && results.stockChartPrimaryData.length > 0) {
                    primarTickerName = results.stockChartPrimaryData[0].ticker;
                }

                if (results.stockChartPeerData && results.stockChartPeerData.length) {
                    peerData = results.stockChartPeerData;
                    if (results.stockChartPeerData.length > 0) {
                        lengthDiff = true;
                    }
                }

                if (peerData) {
                    firstChartTitle = 'Percent Change';
                }

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
                    } else if (applyEarning) {
                        seriesByTickers[stock.ticker].push({
                            'y': parseFloat((peerData && lengthDiff) ? stock.percentChange : stock.priceClose),
                            'marker': {
                                'enabled': true,
                                'symbol': 'url(../assets/icons/images/Stock_Earnings.jpg)'
                            }
                        });
                    } else if (applySplit) {
                        seriesByTickers[stock.ticker].push({
                            'y': parseFloat((peerData && lengthDiff) ? stock.percentChange : stock.priceClose),
                            'marker': {
                                'enabled': true,
                                'symbol': 'url(../assets/icons/images/Stock_Split.jpg)'
                            }
                        });
                    } else {
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

                datasetArr[datasetArr.length] = {
                    "name": "",
                    "yaxisTitle": firstChartTitle,
                    "xaxisTitle": "",
                    "series": seriesSet,
                    "data": dataSet,
                    "type": "spline",
                    "valueDecimals": 1,
                    "showlegend": true,
                    "showxaxisLabel": false,
                    "showtooltip": true,
                    "spacingTop": 30,
                    "xAxis": {
                        labels: {
                            step:3
                        }
                    }
                };

                secondchartSerArr[secondchartSerArr.length] = {
                    "data": secondDatasetArr
                    // ,"pointStart": Date.UTC(xdataArr[0].split('-')[0], xdataArr[0].split('-')[1]-1, xdataArr[0].split('-')[2])
                    // ,"pointStart": Date(xdataArr[0])
                    // ,"pointInterval": 24 * 3600 * 1000
                };

                datasetArr[datasetArr.length] = {
                    "name": "",
                    "yaxisTitle": "Volume (Millions)",
                    "xaxisTitle": "",
                    "series": secondchartSerArr,
                    "data": secondDatasetArr,
                    "type": "column",
                    "valueDecimals": 0,
                    "showlegend": false,
                    "showxaxisLabel": true,
                    "showtooltip": false,
                    "spacingTop": 7
                };

                outArr[outArr.length] = {
                    "xData": xdataArr,
                    "datasets": datasetArr
                };

                return JSON.stringify(outArr).slice(1, -1) + '|' + JSON.stringify(data);
            }
        }

        vm.fetchChartData = function(stockString, selectedPeriod, splits, earnings, dividends, start_date, end_date, companyId) {
            stockService
            .stockData(stockString, selectedPeriod, splits, earnings, dividends, start_date, end_date, companyId, store.inMemoryCache['user-info'].token)
            .then(function(data) {
                //@todo call logic for remove legend item on empty series data
                $scope.$emit('ticker', { 'ticker': data.stockChartPrimaryData[0].ticker });
                vm.stockDataSet = convServiceResptoChartFormat(data);
                if (data.stockChartPeerData && data.stockChartPeerData.length) {
                    vm.selectedStockCount = data.stockChartPeerData.length / data.stockChartPrimaryData.length;
                }
            });
        };

        loadChartData();   

        vm.onPeerRemove = function(peer) {
            var index;
            vm.filterState.selectedIndices.some(function(ind, i) {
                if (ind.indexOf(peer) === 0) {
                    index = i;
                    return true;
                }
            });

            if (index >= 0) {
                var selectedIndices = vm.filterState.selectedIndices;
                selectedIndices.splice(index, 1);
                vm.filterState.selectedIndices = selectedIndices;
            }

            var indexCom;
            vm.filterState.selectedCompetitors.some(function(competitor, i) {
                if (competitor.indexOf(peer) === 0) {
                    indexCom = i;
                    return true;
                }
            });
            if (indexCom >= 0) {
                var selected = vm.filterState.selectedCompetitors;
                selected.splice(indexCom, 1);
                vm.filterState.selectedCompetitors = selected;
            }

            var peerIndex;
            vm.filterState.selectedPeers.some(function(eachpeer, i) {
                if (eachpeer.indexOf(peer) === 0) {
                    peerIndex = i;
                    return true;
                }
            });

            if (peerIndex >= 0) {
                vm.filterState.selectedPeers.splice(peerIndex, 1);
            }

            loadChartData();
        };

        function defineTableInfo()
        {
            var table = [];
            angular.forEach(vm.selectedSources, function(source)
            {
                var info = {};
                info.source = source;
                info.range = vm.selectedRange;
                info.date = vm.selectedDate;
                info.isDefaultChart = true;
                getTableInfo(info);

                table.push(info);
            });

            return table;
        }

        function getTableInfo(info)
        {
            switch (info.source.value)
            {
                case 'SIGDEV' :
                    getSigDevAllList(info);
                    break;
                case 'MASCAD' :
                    getMSCAdLossesAllList(info);
                    break;
                default:
                    break;
            }
        }

        function getSigDevAllList(info)
        {
            info.isLoading = true;
            var dateRange = getDateRange(vm.selectedDate, vm.selectedRange);
            stockService.getSignificantDevelopmentList(commonBusiness.companyId, dateRange.startDate, dateRange.endDate)
                .then(function(response) {
                    if(response && response.sigdevList)
                    {
                        info.rows = response.sigdevList;
                        info.isLoading = false;
                    }

                }
            );
        }

        function getMSCAdLossesAllList(info)
        {
            info.isLoading = true;
            var dateRange = getDateRange(vm.selectedDate, vm.selectedRange);
            stockService.getMascadLargeLosseList(commonBusiness.companyId, dateRange.startDate, dateRange.endDate)
                .then(function(response) {
                    if(response && response.mscad)
                    {
                        info.rows = response.mscad;
                        info.isLoading = false;
                    }

                }
            );
        }

        function getDateRange(selectedDate, selectedRange)
        {
            var num = 3;
            var range = 'months';

            switch(selectedRange)
            {
                case '+/- 1 week' :
                    num = 1;
                    range = 'weeks';
                    break;
                case '+/- 1 month' :
                    num = 1;
                    range = 'months';
                    break;
                case '+/- 3 months' :
                    num = 3;
                    range = 'months';
                    break;
                case '+/- 6 months' : 
                    num = 6;
                    range = 'months';
                    break;
                case '+/- 1 year' :
                    num = 1;
                    range = 'years';
                    break;
                default:
                    break;
            }

            var date = moment(selectedDate);
            if(date.isValid())
            {
                return {
                    startDate : date.add(num * -1, range).format('MM/DD/YYYY'),
                    endDate: date.add(num * 2, range).format('MM/DD/YYYY')
                };
            }
        }
    }

    /** @ngInject */
    function msStockChartDirective() {
        return {
            restrict: 'E',
            require: 'msStockChartToolBar',
            scope: {
                filterState: '=',
                mnemonicId: '=',
                itemId: '=',
                chartId: '=',
                hideFilters : '=',
                tableInfo: '='  
            },
            templateUrl: 'app/core/directives/ms-chart/ms-stock-chart/ms-stock-chart.html',
            controller: 'msStockChartController',
            controllerAs: 'vm',
            bindToController: true
        };
    }
})();