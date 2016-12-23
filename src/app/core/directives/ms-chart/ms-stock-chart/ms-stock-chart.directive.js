(function () {
    'use strict';

    angular.module('app.core')
           .controller('msStockChartController', msStockChartController)
           .directive('msStockChart', msStockChartDirective);


    function msStockChartController($scope, stockService, commonBusiness, templateBusinessFormat) {
        var vm = this;
        vm.selectedIndex ="";
        vm.searchVal = '';
        vm.searchedStocks = [];
        vm.companyId = commonBusiness.companyId;

        //for stock table variables
        vm.selectedSources = null;
        vm.selectedRange = null;
        vm.selectedDate = null;

        vm.onFilterStateUpdate = function() {
            loadChartData();
            vm.onChartSave();
        };

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

        function groupChartData(data) {
            var value;
            var datasets = new Array();
            var seriesSet = new Array();
            var i;
            var n;
            var primaryChartDataItem;
            var stockNames = new Array();
            var stockNameArr = new Array();
            var currentObj;
            var dateValue;
            var dateList = new Array();
            var dateArr = new Array();
            var currentList;
            var valueObject;
            var peerDataItem;
            var mainTicker;
            var volumeArr = new Array();
            var volumeSetArr = new Array();
            var dividendsList = new Array();
            var earningsList = new Array();
            var splitsList = new Array();

            var datasetArr = [];
            var outArr = [];
            var firstChartTitle;

            if (data) {
                if (data.stockChartPrimaryData && Array.isArray(data.stockChartPrimaryData)) {
                    n = data.stockChartPrimaryData.length;
                    if (n > 0) {
                        for (i = 0; i < n; i++) {
                            primaryChartDataItem = data.stockChartPrimaryData[i];
                            if (primaryChartDataItem) {
                                if (primaryChartDataItem.ticker) {
                                    if (!stockNames[primaryChartDataItem.ticker]) {
                                        currentObj = new Object();
                                        currentObj._count = 1;
                                        currentObj.data = new Array();
                                        stockNames[primaryChartDataItem.ticker] = currentObj;
                                        mainTicker = primaryChartDataItem.ticker;
                                        stockNameArr.push(primaryChartDataItem.ticker);
                                    } else {
                                        currentObj = stockNames[primaryChartDataItem.ticker];
                                        currentObj._count = currentObj._count + 1;
                                    }
                                }
                                if (primaryChartDataItem.dataDate) {
                                    dateValue = primaryChartDataItem.dataDate.substring(0, 10);
                                    valueObject = new Object();
                                    valueObject.priceClose = parseFloat(primaryChartDataItem.priceClose);
                                    valueObject.percentChange = parseFloat(primaryChartDataItem.percentChange);
                                    valueObject.securityCode = primaryChartDataItem.securityCode;
                                    valueObject.priceOpen = primaryChartDataItem.priceOpen;
                                    valueObject.priceHigh = primaryChartDataItem.priceHigh;
                                    valueObject.priceLow = primaryChartDataItem.priceLow;
                                    valueObject.volume = parseFloat(primaryChartDataItem.volume);
                                    valueObject.currency = primaryChartDataItem.currency;

                                    if (!dateList[dateValue]) {
                                        dateArr.push(dateValue);
                                        currentList = new Array();
                                        currentList[primaryChartDataItem.ticker] = valueObject;
                                        dateList[dateValue] = currentList;
                                    } else {
                                        currentList = dateList[dateValue];
                                        if (primaryChartDataItem.ticker) {
                                            if (!currentList[primaryChartDataItem.ticker]) {
                                                currentList[primaryChartDataItem.ticker] = valueObject;
                                            } else {
                                                console.log('Duplicate chart value for the same ticker and dataDate.[' + dateValue + ',' + primaryChartDataItem.ticker + ']');
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                if (data.stockChartPeerData && Array.isArray(data.stockChartPeerData)) {
                    n = data.stockChartPeerData.length;
                    if (n > 0) {
                        for (i = 0; i < n; i++) {
                            peerDataItem = data.stockChartPeerData[i];
                            if (peerDataItem) {
                                if (peerDataItem.ticker) {
                                    if (!stockNames[peerDataItem.ticker]) {
                                        currentObj = new Object();
                                        currentObj._count = 1;
                                        currentObj.data = new Array();
                                        stockNames[peerDataItem.ticker] = currentObj;
                                        stockNameArr.push(peerDataItem.ticker);
                                    } else {
                                        currentObj = stockNames[peerDataItem.ticker];
                                        currentObj._count = currentObj._count + 1;
                                    }
                                }
                                if (peerDataItem.dataDate) {
                                    dateValue = peerDataItem.dataDate.substring(0, 10);
                                    valueObject = new Object();
                                    valueObject.priceClose = parseFloat(peerDataItem.priceClose);
                                    valueObject.percentChange = parseFloat(peerDataItem.percentChange);

                                    if (!dateList[dateValue]) {
                                        dateArr.push(dateValue);
                                        currentList = new Array();
                                        currentList[peerDataItem.ticker] = valueObject;
                                        dateList[dateValue] = currentList;
                                    } else {
                                        currentList = dateList[dateValue];
                                        if (peerDataItem.ticker) {
                                            if (!currentList[peerDataItem.ticker]) {
                                                currentList[peerDataItem.ticker] = valueObject;
                                            } else {
                                                console.log('Duplicate chart value for the same ticker and dataDate.[' + dateValue + ',' + peerDataItem.ticker + ']');
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                if (data.dividends && Array.isArray(data.dividends)) {
                    n = data.dividends.length;
                    for (i = 0; i < n; i++) {
                        if (data.dividends[i] && data.dividends[i].dataDate) {
                            dateValue = data.dividends[i].dataDate.substring(0, 10);
                            dividendsList[dateValue] = {
                                value: data.dividends[i].value,
                                valueInUsd: data.dividends[i].valueInUsd
                            };
                            if (!dateList[dateValue]) {
                                console.log('Can\'t find data point for dividend that happen on ' + dateValue + ' with value = ' + dividendsList[dateValue].value);
                            }
                        }
                    }
                }
                if (data.earnings && Array.isArray(data.earnings)) {
                    n = data.earnings.length;
                    for (i = 0; i < n; i++) {
                        if (data.earnings[i] && data.earnings[i].dataDate) {
                            dateValue = data.earnings[i].dataDate.substring(0, 10);
                            earningsList[dateValue] = {
                                value: data.earnings[i].value,
                                valueInUsd: data.earnings[i].valueInUsd
                            };
                            if (!dateList[dateValue]) {
                                console.log('Can\'t find data point for earnings that happen on ' + dateValue + ' with value = ' + earningsList[dateValue].value);
                            }
                        }
                    }
                }
                if (data.splits && Array.isArray(data.splits)) {
                    n = data.splits.length;
                    for (i = 0; i < n; i++) {
                        if (data.splits[i] && data.splits[i].dataDate) {
                            dateValue = data.splits[i].dataDate.substring(0, 10);
                            splitsList[dateValue] = {
                                value: data.splits[i].value,
                                valueInUsd: data.splits[i].valueInUsd
                            };
                            if (!dateList[dateValue]) {
                                console.log('Can\'t find data point for split that happen on ' + dateValue + ' with value = ' + splitsList[dateValue].value);
                            }
                        }
                    }
                }
            }

            if (data && data.stockChartPrimaryData && Array.isArray(data.stockChartPrimaryData) && (data.stockChartPrimaryData.length > 0)) {
                dateArr.sort();
                dateArr.forEach(function (dataDate) {
                    currentList = dateList[dataDate];
                    stockNameArr.forEach(function (ticker) {
                        currentObj = stockNames[ticker];
                        valueObject = currentList[ticker];
                        if (valueObject) {
                            if (stockNameArr.length > 1) {
                                value = valueObject.percentChange
                            } else {
                                value = valueObject.priceClose
                            }
                            if (ticker === mainTicker) {
                                volumeArr.push(valueObject.volume);
                                if (dividendsList[dataDate]) {
                                    currentObj.data.push({
                                        y: value,
                                        marker: {
                                            enabled: true,
                                            symbol: 'url(../assets/icons/images/Stock_Dividend.jpg)'
                                        }
                                    });
                                } else if (earningsList[dataDate]) {
                                    currentObj.data.push({
                                        y: value,
                                        marker: {
                                            enabled: true,
                                            symbol: 'url(../assets/icons/images/Stock_Earnings.jpg)'
                                        }
                                    });
                                } else if (splitsList[dataDate]) {
                                    currentObj.data.push({
                                        y: value,
                                        marker: {
                                            enabled: true,
                                            symbol: 'url(../assets/icons/images/Stock_Split.jpg)'
                                        }
                                    });
                                } else {
                                    currentObj.data.push(value);
                                }
                            } else {
                                currentObj.data.push(value);
                            }
                        } else {
                            console.log('Missing ' + ticker + ' value for datadate ' + dataDate);
                            currentObj.data.push(null);
                            if (ticker === mainTicker) {
                                volumeArr.push(null);
                            }
                        }
                    });
                });

                stockNameArr.forEach(function (ticker) {
                    currentObj = stockNames[ticker];
                    datasets.push({
                        name: ticker,
                        data: currentObj.data,
                        type: "spline",
                        valueDecimals: 1
                    });
                    seriesSet.push({
                        data: currentObj.data,
                        connectNulls: true,
                        name: ticker
                    });
                });

                if (stockNameArr.length > 1) {
                    firstChartTitle = 'Percent Change';
                } else {
                    firstChartTitle = 'Price';
                }

                datasetArr[datasetArr.length] = {
                    name: "",
                    type: "spline",
                    series: seriesSet,
                    data: datasets,
                    xaxisTitle: "",
                    yaxisTitle: firstChartTitle,
                    showlegend: true,
                    showxaxisLabel: false,
                    showtooltip: true,
                    spacingTop: 30,
                    valueDecimals: 1
                };

                volumeSetArr[volumeSetArr.length] = {
                    data: volumeArr
                };

                datasetArr[datasetArr.length] = {
                    name: '',
                    type: 'column',
                    series: volumeSetArr,
                    data: volumeArr,
                    xaxisTitle: '',
                    yaxisTitle: 'Volume (Millions)',
                    showlegend: false,
                    showxaxisLabel: true,
                    showtooltip: false,
                    spacingTop: 7,
                    valueDecimals: 0
                };
            } else {
                datasetArr[datasetArr.length] = {
                    "name": "",
                    "type": "spline",
                    "series": [],
                    "data": [],
                    "xaxisTitle": "",
                    "yaxisTitle": "",
                    "showlegend": false,
                    "showxaxisLabel": false,
                    "showtooltip": false,
                    "spacingTop": 30,
                    "xAxis": {
                        labels: {
                            step: 3
                        }
                    },
                    "valueDecimals": 1
                };
            }

            outArr[outArr.length] = {
                xData: dateArr,
                datasets: datasetArr
            };

            return JSON.stringify(outArr).slice(1, -1) + '|' + JSON.stringify(data);
        }

        function convServiceResptoChartFormat(data) {
            var xdataArr = [];
            var datasetArr = [];
            var outArr = [];

            var results = data;
            if (results && results.stockChartPrimaryData && results.stockChartPrimaryData.length > 0) {
                var firstDatasetArr = [];
                var secondDatasetArr = [];
                var seriesByVolumes = {};
                var seriesByTickers = {};
                var secondchartSerArr = [];
                var firstChartTitle = 'Price';
                var peerData = null;
                var lengthDiff = false;

                var primarTickerName = results.stockChartPrimaryData[0].ticker;

                if (results.stockChartPeerData && results.stockChartPeerData.length > 0) {
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

                    xdataArr[xdataArr.length] = Date.parse(stock.dataDate.substring(0, 10));
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
                            connectNulls: true,
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
                    "type": "spline",
                    "series": seriesSet,
                    "data": dataSet,
                    "xaxisTitle": "",
                    "yaxisTitle": firstChartTitle,
                    "showlegend": true,
                    "showxaxisLabel": false,
                    "showtooltip": true,
                    "spacingTop": 30,
                    "xAxis": {
                        labels: {
                            step:3
                        }
                    },
                    "valueDecimals": 1
                };

                secondchartSerArr[secondchartSerArr.length] = {
                    "data": secondDatasetArr
                    // ,"pointStart": Date.UTC(xdataArr[0].split('-')[0], xdataArr[0].split('-')[1]-1, xdataArr[0].split('-')[2])
                    // ,"pointStart": Date(xdataArr[0])
                    // ,"pointInterval": 24 * 3600 * 1000
                };

                datasetArr[datasetArr.length] = {
                    "name": "",
                    "type": "column",
                    "series": secondchartSerArr,
                    "data": secondDatasetArr,
                    "xaxisTitle": "",
                    "yaxisTitle": "Volume (Millions)",
                    "showlegend": false,
                    "showxaxisLabel": true,
                    "showtooltip": false,
                    "spacingTop": 7,
                    "valueDecimals": 0
                };
            } else {
                datasetArr[datasetArr.length] = {
                    "name": "",
                    "type": "spline",
                    "series": [],
                    "data": [],
                    "xaxisTitle": "",
                    "yaxisTitle": "",
                    "showlegend": false,
                    "showxaxisLabel": false,
                    "showtooltip": false,
                    "spacingTop": 30,
                    "xAxis": {
                        labels: {
                            step:3
                        }
                    },
                    "valueDecimals": 1
                };
            }

            outArr[outArr.length] = {
                "xData": xdataArr,
                "datasets": datasetArr
            };

            return JSON.stringify(outArr).slice(1, -1) + '|' + JSON.stringify(data);
        }

        vm.fetchChartData = function(stockString, selectedPeriod, splits, earnings, dividends, start_date, end_date, companyId) {
            stockService.stockData(stockString, selectedPeriod, splits, earnings, dividends, start_date, end_date, companyId)
            .then(function(data) {
                if (data && data.stockChartPrimaryData && data.stockChartPrimaryData.length > 0) {
                    //@todo call logic for remove legend item on empty series data
                    $scope.$emit('ticker', { 'ticker': data.stockChartPrimaryData[0].ticker });
                }
                vm.stockDataSet = groupChartData(data);
                //vm.stockDataSet = convServiceResptoChartFormat(data);
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

            vm.onFilterStateUpdate();
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
                hideFilters: '=',
                onChartSave: '=',
                tableInfo: '='  
            },
            templateUrl: 'app/core/directives/ms-chart/ms-stock-chart/ms-stock-chart.html',
            controller: 'msStockChartController',
            controllerAs: 'vm',
            bindToController: true
        };
    }
})();