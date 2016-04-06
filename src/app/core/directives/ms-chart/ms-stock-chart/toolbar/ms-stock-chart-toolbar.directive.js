(function ()
{
    'use strict';
    angular
        .module('app.core')
        .controller('msStockChartToolBarController', msStockChartToolBarController)
        .directive('msStockChartToolBar', msStockChartToolBarDirective);

    /** @ngInject */
    function msStockChartToolBarController($scope,$log, stockService, $mdMenu, dialog, commonBusiness)
    {
        var vm = this;
        vm.splits = false;
        vm.earnings = false;
        vm.dividends = false;
        vm.selectedPeriod = vm.filterState.interval;
        vm.customDateChange = customDateChange;
        /* Indices Logic Start */
        vm.indices = [];

        /* Peers Logic Start*/

        vm.peers = [];
        vm.queryPeerSearch   = queryPeerSearch;
        vm.selectedItemChange = selectedItemChange;
        vm.selectedPeerChange = selectedPeerChange;
        vm.selectedCompetitorChange = selectedCompetitorChange;
        vm.changedSplitsEvents = changedSplitsEvents;
        vm.changedEarningsEvents = changedEarningsEvents;
        vm.changedDividendsEvents = changedDividendsEvents;
        vm.changedPeriod = changedPeriod;
        vm.loadPeers = loadPeers;
        vm.loadIndices = loadIndices;
        vm.loadCompetitors = loadCompetitors;



        setStartEndDate(vm.selectedPeriod);



        //Loads Indices.
        function loadIndices() {
            stockService
                .getIndices('', '1W')
                .then(function(data) {
                    if(data.indicesResp)
                    {
                        vm.indices =[];
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

        setStartEndDate(vm.selectedPeriod);

        function loadCompetitors() {
            stockService
                .getCompetitors(commonBusiness.companyId)
                .then(function(data) {
                    if(data.competitors)
                    {
                        vm.competitors =[];
                        angular.forEach(data.competitors, function(comp)
                        {
                            vm.competitors.push({
                                value: comp.ticker,
                                display: comp.companyName
                            }) ;
                        });
                    }
                });

        }

        setStartEndDate(vm.selectedPeriod);

        function loadPeers(keyword)
        {
            return stockService
                .findTickers(keyword)
                .then(function(data) {
                    if(data.tickerResp)
                    {
                        vm.peers = [];
                        angular.forEach(data.tickerResp, function(ticker)
                        {
                            vm.peers.push({
                                value: ticker.ticker,
                                display: ticker.companyName
                            });
                        });
                        return vm.peers;
                    }
                });
        }
   /*     function loadIndices() {
            stockService
                .getIndices('', '1W')
                .then(function(data) {
                    if(data.indicesResp)
                    {
                        vm.indices =[];
                        angular.forEach(data.indicesResp, function(ind)
                        {
                            vm.indices.push({
                                value: ind.value,
                                display: ind.description
                            }) ;
                        });
                    }
                });

        }*/
        function customDateChange (){
            vm.filterState.startDate =vm.startDate;
            vm.filterState.endDate =vm.endDate;
            vm.changedPeriod('CUSTOM');
            vm.onFilterStateUpdate();
        }


        function changedSplitsEvents() {
            vm.filterState.splits = vm.splits;
            vm.onFilterStateUpdate();
        }

        function changedEarningsEvents() {
            vm.filterState.earnings = vm.earnings;
            vm.onFilterStateUpdate();
        }

        function changedDividendsEvents() {
            vm.filterState.dividends = vm.dividends;
            vm.onFilterStateUpdate();
        }

        function changedPeriod(periodVal) {
            vm.filterState.startDate =vm.startDate;
            vm.filterState.endDate =vm.endDate;
            vm.filterState.interval =periodVal;

            setStartEndDate(periodVal);
            vm.onFilterStateUpdate();
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
                vm.filterState.startDate =vm.startDate;
                vm.filterState.endDate =vm.endDate;
            }
        }

        function queryPeerSearch (query) {
            if(query) {
                return vm.loadPeers(query);
            }
            else
            {
                vm.peers = [];
                return vm.peers;
            }
            // return vm.peers;
        }



        function selectedItemChange(item) {
            $log.info('Item changed to ' + item);
            if(item){
                //considering all the possible legends(indices and peers)
                var count = 1+ vm.filterState.selectedIndices.length + vm.filterState.selectedPeers.length+ vm.filterState.selectedCompetitors.length;
                if(count <5) {
                    item = JSON.parse(item);
                    console.log('legend1',vm.filterState.selectedIndices,vm.filterState.selectedPeers,item);
                    console.log('item', item.value,vm.filterState.selectedIndices.indexOf(item.value))
                    if(item && item.value && vm.filterState.selectedIndices.indexOf(item.value) === -1) {
                        var selected = vm.filterState.selectedIndices;
                        selected.push(item.value);
                        vm.filterState.selectedIndices = selected;
                        vm.onFilterStateUpdate();
                    }

                }
                else {
                    dialog.alert( 'Error',"Max5 Stock allow to compare!",null,{ok:{name:'ok',callBack:function(){
                        console.log('cliked ok');
                    }}});
                }
                vm.selectedIndice = null;
            }
            vm.selectedItem = null;
            vm.searchIndText = "";
            $mdMenu.hide();
        }

        function selectedPeerChange(item) {
            if(item){
                console.log('legend',vm.filterState.selectedIndices,vm.filterState.selectedPeers,item);
                var count = 1+ vm.filterState.selectedIndices.length + vm.filterState.selectedPeers.length+ vm.filterState.selectedCompetitors.length;
                if(count <5){
                    if(item && item.display && vm.filterState.selectedPeers.indexOf(item.display) === -1 ) {
                        var selected = vm.filterState.selectedPeers;
                        selected.push(item.value);
                        vm.filterState.selectedPeers = selected;
                        $mdMenu.hide();
                        vm.onFilterStateUpdate();
                    }

                }
                else {
                    //show pop up
                    dialog.alert( 'Error',"Max5 Stock allow to compare!",null, {ok:{name:'ok',callBack:function(){
                        console.log('cliked ok');
                    }}});
                }
            }
            vm.selectedPeerItem = null;
            vm.searchPeerText = "";
            $mdMenu.hide();

        }

        function selectedCompetitorChange(item) {
            $log.info('Item changed to ' + item);
            if(item){
                //considering all the possible legends(indices and peers)
                var count = 1+ vm.filterState.selectedIndices.length + vm.filterState.selectedPeers.length + vm.filterState.selectedCompetitors.length;
                if(count <5) {
                    item = JSON.parse(item);
                    console.log('legend1',vm.filterState.selectedIndices,vm.filterState.selectedPeers,vm.filterState.selectedCompetitors,item);
                    console.log('item', item.value,vm.filterState.selectedCompetitors.indexOf(item.value))
                    if(item && item.value && vm.filterState.selectedCompetitors.indexOf(item.value) === -1) {
                        var selected = vm.filterState.selectedCompetitors;
                        selected.push(item.value);
                        vm.filterState.selectedCompetitors = selected;
                        vm.onFilterStateUpdate();
                    }

                }
                else {
                    dialog.alert( 'Error',"Max5 Stock allow to compare!",null,{ok:{name:'ok',callBack:function(){
                        console.log('cliked ok');
                    }}});
                }
                vm.selectedCompetitor = null;
            }
            vm.selectedItem = null;
            vm.searchIndText = "";
            $mdMenu.hide();
        }

        function createFilterFor(query) {
            var lowercaseQuery = angular.lowercase(query);
            return function filterFn(peer) {
                return (peer.display.indexOf(lowercaseQuery) === 0);
            };
        }

        $scope.$on('resetEvents',function(event) {
            vm.splits=false;
            vm.earnings=false;
            vm.dividends=false;
        });

        /* Peers Logic End*/
    }

    /** @ngInject */
    function msStockChartToolBarDirective()
    {
        return {
            restrict: 'E',
            scope   : {
                chartId : "=",
                filterState : "=",
                onFilterStateUpdate : "="
            },
            controller: 'msStockChartToolBarController',
            controllerAs: 'vm',
            templateUrl: 'app/core/directives/ms-chart/ms-stock-chart/toolbar/ms-stock-chart-toolbar.html',
            link: function(scope, el, attr)
            {
            },
            bindToController :true
        };
    }

})();