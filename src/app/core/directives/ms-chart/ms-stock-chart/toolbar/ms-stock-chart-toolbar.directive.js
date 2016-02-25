(function ()
{
    'use strict';
    angular
        .module('app.core')
        .controller('msStockChartToolBarController', msStockChartToolBarController)
        .directive('msStockChartToolBar', msStockChartToolBarDirective);

    /** @ngInject */
    function msStockChartToolBarController($scope, $log, stockService, stockChartBusiness)
    {
        var vm = this;
        vm.splits = false;
        vm.earnings = false;
        vm.dividends = false;
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
        vm.searchTextChange   = searchTextChange;
        vm.changedEvents = changedEvents;
        vm.changedSplitsEvents = changedSplitsEvents;
        vm.changedEarningsEvents = changedEarningsEvents;
        vm.changedDividendsEvents = changedDividendsEvents;
        vm.changedPeriod = changedPeriod;
        loadPeers();

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

        function changedEvents() {
            console.log('status of events changed here');
            stockChartBusiness.splits = vm.splits;
            stockChartBusiness.earnings = vm.earnings;
            stockChartBusiness.dividends = vm.dividends;
        }

        function changedSplitsEvents() {
            console.log('status of events changed here');
            stockChartBusiness.splits = vm.splits;
        }

        function changedEarningsEvents() {
            console.log('status of events changed here');
            stockChartBusiness.earnings = vm.earnings;
        }

        function changedDividendsEvents() {
            console.log('status of events changed here');
            stockChartBusiness.dividends = vm.dividends;
        }

        function changedPeriod(periodVal) {
            console.log('status of events changed here');
            stockChartBusiness.interval =periodVal;
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
        }

        function createFilterFor(query) {
            var lowercaseQuery = angular.lowercase(query);
            return function filterFn(peer) {
                return (peer.value.indexOf(lowercaseQuery) === 0);
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