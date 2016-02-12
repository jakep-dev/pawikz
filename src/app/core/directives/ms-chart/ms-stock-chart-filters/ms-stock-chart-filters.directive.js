(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('msStockChartFilterController', msStockChartFilterController)
        .directive('msStockChartFilter', msStockChartDirective);

    /** @ngInject */
    function msStockChartFilterController(stockService, dialog ) {
        var vm = this;
        //variables
        vm.eventOptionVisibility = false;
        vm.dateOptionVisibility = false;
        vm.comparisonOptionVisibility = false;
        vm.periods = ['1W', '1M','3M', '18M', '1Y', '2Y', '3Y', '5Y', '10Y'];
        vm.isPeerOpen = false;
        vm.selectedIndex ="";
        vm.searchVal = '';
        vm.searchedStocks = [];
        vm.selectedStockCount = 1;
        vm.months = [1,2,3,4,5,6,7,8,9,10,11,12];
        vm.dates = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31];
        vm.years = [2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025,2026,2027,2028,2029,2030];


        var currentDate = new Date();
        if(vm.selectedPeriod !== 'CUSTOM'){
            vm.from = {
                date : currentDate.getDate(),
                month : currentDate.getMonth()+1,
                year : currentDate.getFullYear()-3
            };
            vm.to = {
                date : currentDate.getDate(),
                month : currentDate.getMonth()+1,
                year : currentDate.getFullYear()
            };
        }

        //methods
        vm.menuClick = menuClick;
        vm.setTimeRange  = setTimeRange;
        vm.resetFilters = resetFilters;
        vm.changeSplits = changeSplits;
        vm.changeEarnings = changeEarnings;
        vm.changeDividens = changeDividens;
        vm.applyPeersSelected = applyPeersSelected;
        vm.findTickersFromServer = findTickersFromServer;
        vm.selectPeersStock = selectPeersStock;
        vm.cancelDateBox = cancelDateBox;
        vm.applyDates = applyDates;
        vm.fetchChartData = fetchChartData;
        vm.getIndicesFromServer = getIndicesFromServer;

        function resetFilters() {
            vm.selectedPeriod =  '3Y';
            vm.fetchChartData();
        }

        function menuClick(containerId){
            console.log('containerId---------->',containerId);
            var wasEOpen = vm.eventOptionVisibility;
            var wasCOpen = vm.comparisonOptionVisibility;
            var wasDOpen =  vm.dateOptionVisibility;

            //hide all
            vm.eventOptionVisibility = false;
            vm.comparisonOptionVisibility = false;
            vm.dateOptionVisibility = false;

            //show current
            if(containerId == 'events' && !wasEOpen){
                vm.eventOptionVisibility = true;
            }
            else if(containerId == 'comparison' && !wasCOpen) {
                vm.comparisonOptionVisibility = true;
            }
            else if(containerId == 'dates-customization' && !wasDOpen){
                vm.dateOptionVisibility = true;
            }
        };

        function setTimeRange(range){
            vm.selectedPeriod = range;
            vm.fetchChartData();
            //find end date
            if (vm.selectedPeriod !== 'CUSTOM') {
                var d = new Date();
                if(vm.selectedPeriod ==='1W') {
                    d.setDate(d.getDate() - 7);
                }
                else  if(vm.selectedPeriod ==='1M') {
                    d.setMonth(d.getMonth() - 1);
                }
                else  if(vm.selectedPeriod ==='3M') {
                    d.setMonth(d.getMonth() - 3);
                }
                else  if(vm.selectedPeriod ==='18M') {
                    d.setMonth(d.getMonth() - 18);
                }
                else  if(vm.selectedPeriod ==='1Y') {
                    d.setFullYear(d.getFullYear() - 1);
                }
                else  if(vm.selectedPeriod ==='2Y') {
                    d.setFullYear(d.getFullYear() - 2);
                }
                else  if(vm.selectedPeriod ==='3Y') {
                    d.setFullYear(d.getFullYear() - 3);
                }
                else  if(vm.selectedPeriod ==='5Y') {
                    d.setFullYear(d.getFullYear() - 5);
                }
                else  if(vm.selectedPeriod ==='10Y') {
                    d.setFullYear(d.getFullYear() - 10);
                }
                vm.from= {
                    date : d.getDate(),
                    month : d.getMonth()+1,
                    year : d.getFullYear()
                };
            }
        };

        function changeSplits() {
            vm.isSplits = !vm.isSplits;
            vm.fetchChartData();
        };

        function changeEarnings() {
            vm.isEarnings = !vm.isEarnings;
            vm.fetchChartData();
        };

        function changeDividens() {
            vm.isDividents = !vm.isDividents;
            vm.fetchChartData();
        };

        function applyPeersSelected() {
            vm.isPeerOpen = false;
            vm.fetchChartData();
        };

        function findTickersFromServer(keyword) {
            //find selcected stocks comma seprated

            stockService
                .findTickers(keyword)
                .success(function(data) {
                    //console.log('found data from server for tickers ',data);
                    if(data.tickerResp) {
                        vm.searchedStocks = data.tickerResp;
                    }
                    else {
                        vm.searchedStocks = [];
                    }
                });
        };

        function selectPeersStock(stock){

            if (stock.selected)  {
                vm.selectedStockCount -=1;
            }else{
                vm.selectedStockCount +=1;
            }
            stock.selected = !stock.selected;

            if(vm.selectedStockCount > 5){
                vm.selectedStockCount -=1;
                stock.selected = !stock.selected;
                dialog.alert( 'Error',"Max5 Stock allow to compare!",null,'alertId',{ok:{name:'ok',callBack:function(){
                    console.log('cliked ok');
                }}});
            }
        };

        function cancelDateBox() {
            vm.dateOptionVisibility = false;
        };

        function applyDates() {
            vm.selectedPeriod = 'CUSTOM';
            vm.dateOptionVisibility = false;
            vm.fetchChartData();
        };

        function fetchChartData() {
            //find selcected stocks comma seprated
            console.log('fetching data ----------');
            var length = 1 + vm.selectedIndicesList.length+vm.selectedPeerList.length;
            if(length <= 5) {
                if (vm.selectedIndex) {
                    var index = vm.selectedIndicesList.indexOf(vm.selectedIndex);
                    if(index === -1 ) {
                        vm.selectedIndicesList.push(vm.selectedIndex);
                    }
                }
                vm.searchedStocks.forEach( function(stock) {
                    if (stock.selected)  {
                        var index = vm.selectedPeerList.indexOf(stock.ticker);
                        if(index === -1 ) {
                            vm.selectedPeerList.push(stock.ticker);
                        }
                    }

                });
                vm.searchedStocks = [];
                vm.searchVal = '';
                vm.selectedIndex = '';
                vm.comparisonOptionVisibility = false;
                var stockString = '';
                if (vm.mainStock) {
                    stockString = vm.mainStock + ',';
                }

                vm.selectedIndicesList.forEach( function(indics) {
                    stockString = stockString + '^'+indics + ',';
                });

                vm.selectedPeerList.forEach( function(stock) {
                    stockString =stockString + stock + ',';
                });

                if(stockString !=='') {
                    stockString = stockString.slice(0, -1);
                }
                var splits = (vm.isSplits)?'Y':'N';
                var earnings = (vm.isEarnings)?'Y':'N';
                var dividends = (vm.isDividents)?'Y':'N';

                var start_date, end_date;
                if (vm.selectedPeriod.toUpperCase() ==='CUSTOM') {
                    start_date = vm.from.year + '-' + vm.from.month + '-' + vm.from.date;
                    end_date = vm.to.year + '-' + vm.to.month + '-' + vm.to.date;
                }

                vm.fetchData(stockString, vm.selectedPeriod, splits, earnings, dividends, start_date, end_date);
            }
            else
            {
                dialog.alert( 'Error',"Max5 Stock allow to compare!",null,'alertId',{ok:{name:'ok',callBack:function(){
                    console.log('cliked ok');
                }}});
                vm.selectedIndex = '';
                vm.comparisonOptionVisibility = false;
            }

        };

        function getIndicesFromServer(keyword) {
            stockService
                .getIndices(keyword,vm.selectedPeriod)
                .success(function(data) {
                    console.log('found data from server for getIndices---------------------> ',data);
                    if(data.indicesResp) {
                        vm.Indexes = data.indicesResp;
                    }
                });
        };
        vm.getIndicesFromServer();
        vm.fetchChartData();
    }

    /** @ngInject */
    function msStockChartDirective()
    {
        return {
            restrict: 'E',
            replace:true,
            templateUrl: 'app/core/directives/ms-chart/ms-stock-chart-filters/ms-stock-chart-filters.html',
            scope : {
                'fetchData' : '=',
                'selectedPeriod': '=',
                'selectedIndicesList': '=',
                'selectedPeerList': '=',
                'isSplits': '=',
                'isEarnings': '=',
                'isDividents': '=',
                'mainStock': '=',
                'to': '=',
                'from': '='
            },
            controller: 'msStockChartFilterController',
            controllerAs : 'vm',
            bindToController :true
        };
    }
})();