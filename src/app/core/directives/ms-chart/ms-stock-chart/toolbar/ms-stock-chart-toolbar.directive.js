(function ()
{
    'use strict';
    angular
        .module('app.core')
        .controller('msStockChartToolBarController', msStockChartToolBarController)
        .directive('msStockChartToolBar', msStockChartToolBarDirective);

    /** @ngInject */
    function msStockChartToolBarController($scope, $log, stockService, stockChartBusiness, $mdMenu, dialog)
    {
        var vm = this;
        vm.splits = false;
        vm.earnings = false;
        vm.dividends = false;
        vm.selectedPeriod = stockChartBusiness.interval;
        vm.customDateChange = customDateChange;
        /* Indices Logic Start */
        vm.indices = [];
        vm.queryIndiceSearch = queryIndiceSearch;
        loadIndices();
        function queryIndiceSearch (query) {
            var results = query ? vm.indices.filter( createFilterFor(query) ) : vm.indices;
            return results;
        }

        //Loads Indices.
        function loadIndices() {
            stockService
                .getIndices('', '1W')
                .then(function(data) {
                    if(data.indicesResp)
                    {
                        angular.forEach(data.indicesResp, function(ind)
                        {
                            vm.indices.push({
                                value: ind.value,
                                display: ind.description
                            }) ;
                        });
                    }
                });

        }

        /* Indices Logic End */

        /* Peers Logic Start*/

        vm.peers = [];
        vm.queryPeerSearch   = queryPeerSearch;
        vm.selectedItemChange = selectedItemChange;
        vm.selectedPeerChange = selectedPeerChange;
        vm.searchTextChange   = searchTextChange;
        vm.changedEvents = changedEvents;
        vm.changedSplitsEvents = changedSplitsEvents;
        vm.changedEarningsEvents = changedEarningsEvents;
        vm.changedDividendsEvents = changedDividendsEvents;
        vm.changedPeriod = changedPeriod;
        loadPeers();
        setStartEndDate(vm.selectedPeriod);

        function loadPeers()
        {
            stockService
                .findTickers('')
                .then(function(data) {
                    console.log(data);
                    if(data.tickerResp)
                    {
                        angular.forEach(data.tickerResp, function(ticker)
                        {
                           vm.peers.push({
                               value: ticker.companyId,
                               display: ticker.companyName
                           });
                        });
                    }
                });
        }

        function customDateChange (){
            stockChartBusiness.startDate =vm.startDate;
            stockChartBusiness.endDate =vm.endDate;
            vm.changedPeriod('CUSTOM');
        }

        function changedEvents() {
            console.log('status of events changed here');
            stockChartBusiness.splits = vm.splits;
            stockChartBusiness.earnings = vm.earnings;
            stockChartBusiness.dividends = vm.dividends;
        }

        function changedSplitsEvents() {
            stockChartBusiness.splits = vm.splits;
        }

        function changedEarningsEvents() {
            stockChartBusiness.earnings = vm.earnings;
        }

        function changedDividendsEvents() {
            stockChartBusiness.dividends = vm.dividends;
        }

        function changedPeriod(periodVal) {
            stockChartBusiness.startDate =vm.startDate;
            stockChartBusiness.endDate =vm.endDate;
            stockChartBusiness.interval =periodVal;

            setStartEndDate(periodVal);
        }

        function setStartEndDate(periodVal) {
            if (periodVal !== 'CUSTOM') {
                var d = new Date();
                vm.endDate = new Date();
                if(periodVal ==='1W') {
                    d.setDate(d.getDate() - 7);
                }
                else  if(periodVal ==='1M') {
                    d.setMonth(d.getMonth() - 1);
                }
                else  if(periodVal ==='3M') {
                    d.setMonth(d.getMonth() - 3);
                }
                else  if(periodVal ==='18M') {
                    d.setMonth(d.getMonth() - 18);
                }
                else  if(periodVal ==='1Y') {
                    d.setFullYear(d.getFullYear() - 1);
                }
                else  if(periodVal ==='2Y') {
                    d.setFullYear(d.getFullYear() - 2);
                }
                else  if(periodVal ==='3Y') {
                    d.setFullYear(d.getFullYear() - 3);
                }
                else  if(periodVal ==='5Y') {
                    d.setFullYear(d.getFullYear() - 5);
                }
                else  if(periodVal ==='10Y') {
                    d.setFullYear(d.getFullYear() - 10);
                }
                vm.startDate = d;
            }
        }

        function queryPeerSearch (query) {
            var results = query ? vm.peers.filter( createFilterFor(query) ) : vm.peers;
            return results;
        }

        function searchTextChange(text) {
            $log.info('Text changed to ' + text);
        }

        function selectedItemChange(item) {
            $log.info('Item changed to ' + JSON.stringify(item));
            var count = 1+ stockChartBusiness.selectedIndices.length + stockChartBusiness.selectedPeers.length;
            if(count <5) {
                if(item && item.value && stockChartBusiness.selectedIndices.indexOf(item.value) === -1) {
                    var selected = stockChartBusiness.selectedIndices;
                    selected.push(item.value);
                    stockChartBusiness.selectedIndices = selected;
                }
                vm.selectedItem = null;
                vm.searchIndText = "";
            }
            else {
                console.log('more then 5 stocks are not allowed');
                dialog.alert( 'Error',"Max5 Stock allow to compare!",null,{ok:{name:'ok',callBack:function(){
                    console.log('cliked ok');
                }}});
            }
            $mdMenu.hide();
        }

        function selectedPeerChange(item) {
            $log.info('Item changed to ' + JSON.stringify(item));
            var count = 1+ stockChartBusiness.selectedIndices.length + stockChartBusiness.selectedPeers.length;
            if(count <5){
                if(item && item.display && stockChartBusiness.selectedPeers.indexOf(item.display) === -1 ) {
                    var selected = stockChartBusiness.selectedPeers;
                    selected.push(item.display);
                    stockChartBusiness.selectedPeers = selected;
                    $mdMenu.hide();
                }
                vm.selectedPeerItem = null;
                vm.searchPeerText = "";
            }
            else {
                //show pop up
                dialog.alert( 'Error',"Max5 Stock allow to compare!",null, {ok:{name:'ok',callBack:function(){
                    console.log('cliked ok');
                }}});
            }
            $mdMenu.hide();

        }

        function createFilterFor(query) {
            var lowercaseQuery = angular.lowercase(query);
            return function filterFn(peer) {
                return (peer.display.indexOf(lowercaseQuery) === 0);
            };
        }

        /* Peers Logic End*/
    }

    /** @ngInject */
    function msStockChartToolBarDirective()
    {
        return {
            restrict: 'E',
            scope   : {

            },
            controller: 'msStockChartToolBarController',
            controllerAs: 'vm',
            templateUrl: 'app/core/directives/ms-chart/ms-stock-chart/toolbar/ms-stock-chart-toolbar.html',
            link: function(scope, el, attr)
            {
                console.log(el);
            }
        };
    }

})();