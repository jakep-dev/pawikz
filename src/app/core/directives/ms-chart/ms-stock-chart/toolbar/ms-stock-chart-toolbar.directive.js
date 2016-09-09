(function () {
    'use strict';
    angular
        .module('app.core')
        .controller('msStockChartToolBarController', msStockChartToolBarController)
        .directive('msStockChartToolBar', msStockChartToolBarDirective);

    /** @ngInject */
    function msStockChartToolBarController($rootScope, $scope, $log, stockService, $mdMenu,
                                           dialog, toast, commonBusiness, $mdSelect, $timeout) {
        var vm = this;
        vm.splits = false;
        vm.earnings = false;
        vm.dividends = false;
        vm.selectedPeriod = vm.filterState.interval;
        vm.customDateChange = customDateChange;
        /* Indices Logic Start */
        vm.indices = [];
        vm.peers = [];
        vm.competitors = [];
        vm.savedChartData = $rootScope.savedChartData;

        /* Peers Logic Start*/


        vm.queryPeerSearch = queryPeerSearch;
        vm.selectedItemChange = selectedItemChange;
        vm.indicesOrCompetitorDropDownChange = indicesOrCompetitorDropDownChange;
        vm.addIndices = addIndices;
        vm.selectedPeerChange = selectedPeerChange;
        vm.selectedCompetitorChange = selectedCompetitorChange;
        vm.addCompetitor = addCompetitor;
        vm.changedSplitsEvents = changedSplitsEvents;
        vm.changedEarningsEvents = changedEarningsEvents;
        vm.changedDividendsEvents = changedDividendsEvents;
        vm.changedPeriod = changedPeriod;
        vm.loadPeers = loadPeers;
        vm.loadIndices = loadIndices;
        vm.loadCompetitors = loadCompetitors;
        vm.add = add;
        vm.clear = clear;
        vm.presetComparisonMenu = presetComparisonMenu;

        vm.maxDate = new Date();
        setStartEndDate(vm.selectedPeriod);


        //Loads Indices.
        function loadIndices() {
            stockService
                .getIndices('', '1W')
                .then(function (data) {
                    if (data.indicesResp) {

                        //@@TODO
                        var chartCount = vm.chartId.split('-');
                        chartCount = parseInt(chartCount[1]);
                        var savedIndicesList = [];

                        if(chartCount>=0){

                            if(vm.savedChartData && _.size(vm.savedChartData) > 0) {
                                savedIndicesList = vm.savedChartData[chartCount].filterState.selectedIndices;
                            }

                            vm.indices = [];
                            itemList =[];
                            angular.forEach(data.indicesResp, function (ind) {
                                var indicesItem = new Object();
                                indicesItem.value = ind.value;
                                indicesItem.display = ind.description;
                                indicesItem.selectedIndicecheck = false;
                                if (savedIndicesList && savedIndicesList.indexOf(indicesItem.value)>-1) {
                                    indicesItem.selectedIndicecheck = true;
                                    itemList.push(indicesItem);
                                }
                                vm.indices.push(indicesItem);
                            });
                        }

                    }
                });

        }

        setStartEndDate(vm.selectedPeriod);

        function loadCompetitors() {
            stockService
                .getCompetitors(commonBusiness.companyId)
                .then(function (data) {
                    if (data.competitors) {
                        var chartCount = vm.chartId.split('-');
                        chartCount = parseInt(chartCount[1]);
                        var savedCompetitorsList = [];
                        competitorList = [];
                        if(chartCount>=0) {
                            if(vm.savedChartData && _.size(vm.savedChartData) > 0)
                            {
                                savedCompetitorsList = vm.savedChartData[chartCount].filterState.selectedCompetitors;
                            }

                            angular.forEach(data.competitors, function (comp) {
                                var competitorItem = new Object();
                                competitorItem.value = comp.ticker;
                                competitorItem.display = comp.companyName;
                                competitorItem.selectedCompetitorcheck = false;
                                if (savedCompetitorsList &&
                                    savedCompetitorsList.indexOf(competitorItem.value)>-1) {
                                    competitorItem.selectedCompetitorcheck = true;
                                    competitorList.push(competitorItem);
                                }
                                vm.competitors.push(competitorItem);
                            });
                        }

                    }
                });

        }

        setStartEndDate(vm.selectedPeriod);

        function loadPeers(keyword) {
            return stockService
                .findTickers(keyword)
                .then(function (data) {
                    if (data.tickerResp) {
                        vm.peers = [];
                        angular.forEach(data.tickerResp, function (ticker) {
                            vm.peers.push({
                                value: ticker.ticker,
                                display: ticker.companyName
                            });
                        });
                        return vm.peers;
                    }
                });
        }

        function customDateChange() {
            $timeout(function(){
                if(vm.startDate > vm.endDate) {
                    vm.endDate = vm.filterState.endDate;
                    dialog.alert('Error', "Entered date range is invalid.To date cannot be prior to From date.", null, {
                        ok: {
                            name: 'ok', callBack: function () {
                            }
                        }
                    });
                }
                else
                {
                    if(vm.startDate && vm.endDate){
                        vm.filterState.startDate = vm.startDate;
                        vm.filterState.endDate = vm.endDate;
                        vm.changedPeriod('CUSTOM');
                        vm.onFilterStateUpdate();
                    }
                }
            },1000)
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
            vm.filterState.startDate = vm.startDate;
            vm.filterState.endDate = vm.endDate;
            vm.filterState.interval = periodVal;
            setStartEndDate(periodVal);
            vm.onFilterStateUpdate();
        }

        function setStartEndDate(periodVal) {
            if (periodVal !== 'CUSTOM') {
                var d = new Date();
                vm.endDate = new Date();
                if (periodVal === '1W') {
                    d.setDate(d.getDate() - 7);
                }
                else if (periodVal === '1M') {
                    d.setMonth(d.getMonth() - 1);
                }
                else if (periodVal === '3M') {
                    d.setMonth(d.getMonth() - 3);
                }
                else if (periodVal === '18M') {
                    d.setMonth(d.getMonth() - 18);
                }
                else if (periodVal === '1Y') {
                    d.setFullYear(d.getFullYear() - 1);
                }
                else if (periodVal === '2Y') {
                    d.setFullYear(d.getFullYear() - 2);
                }
                else if (periodVal === '3Y') {
                    d.setFullYear(d.getFullYear() - 3);
                }
                else if (periodVal === '5Y') {
                    d.setFullYear(d.getFullYear() - 5);
                }
                else if (periodVal === '10Y') {
                    d.setFullYear(d.getFullYear() - 10);
                }
                vm.startDate = d;
                vm.filterState.startDate = vm.startDate;
                vm.filterState.endDate = vm.endDate;
            }
        }

        function queryPeerSearch(query) {
            if (query) {
                return vm.loadPeers(query);
            }
            else {
                vm.peers = [];
                return vm.peers;
            }
            // return vm.peers;
        }


        var itemList = [];

        function addIndices() {
            vm.filterState.selectedIndices =[];
            itemList.forEach(function (item, key) {
                    if (item && item.value) {
                        vm.filterState.selectedIndices.push(item.value);
                    }
            })

            $mdSelect.hide();
            $mdMenu.hide();

            vm.selectedIndice = null;
        }


        function indicesOrCompetitorDropDownChange(itemType, item) {
                if (itemType == 'INDICE') {
                    if (item.selectedIndicecheck && itemList.indexOf(item) == -1) {
                        itemList.push(item);
                    }
                    else {
                        for (var itemCount = 0; itemCount < itemList.length; itemCount++) {
                            if (item.value == itemList[itemCount].value) {
                                itemList.splice(itemCount, 1);
                            }
                        }
                    }
                }
                else {
                    if (item.selectedCompetitorcheck && competitorList.indexOf(item) == -1) {
                        competitorList.push(item);
                    }
                    else {
                        for (var itemCount = 0; itemCount < competitorList.length; itemCount++) {
                            if (item.value == competitorList[itemCount].value) {
                                competitorList.splice(itemCount, 1);
                            }
                        }
                    }
                }

            vm.selectedItem = null;
            vm.searchIndText = "";
        }

        function selectedItemChange(item) {
            $log.info('Item changed to ' + item);
            //Checkbox checked

            itemList.push(item);

            vm.selectedItem = null;
            vm.searchIndText = "";
            //$mdMenu.hide();
        }

        function addPeer(){
                vm.filterState.selectedPeers = [];
            peerList.forEach(function (item, key) {
                if (item && item.value) {
                    vm.filterState.selectedPeers.push(item.value);
                }
            })
            vm.selectedPeerItem = null;
            vm.searchPeerText = "";
            $mdMenu.hide();
        }

        var peerList =[];
        function selectedPeerChange(item){
            if(item && item.value && peerList.indexOf(item) == -1){
                peerList.push(item);
            }
        }

        function add(){
            var count = 1 + itemList.length + peerList.length + competitorList.length;
            if(count >5){
                //show pop up
                dialog.alert('Error', "Max5 Stock allow to compare!", null, {
                    ok: {
                        name: 'ok', callBack: function () {
                        }
                    }
                });
            }
            else{
                addCompetitor();
                addIndices();
                addPeer();

                vm.onFilterStateUpdate();
            }
        }

        function clear(){
            vm.filterState.selectedIndices = [];
            vm.filterState.selectedPeers = [];
            vm.filterState.selectedCompetitors = [];
            itemList = [];
            competitorList = [];
            peerList=[];
            vm.selectedPeerItem = null;
            vm.searchPeerText = "";
            vm.onFilterStateUpdate();
        }

        var competitorList = [];
        function addCompetitor() {
            vm.filterState.selectedCompetitors = [];
            competitorList.forEach(function (item, key) {
                    if (item && item.value) {
                        vm.filterState.selectedCompetitors.push(item.value);
                    }
                $mdSelect.hide();
                $mdMenu.hide();
                vm.selectedCompetitor = null;
            })
        }

        function selectedCompetitorChange(item) {
            competitorList.push(item);
            vm.selectedItem = null;
            vm.searchIndText = "";
            // $mdMenu.hide();
        }

        function presetComparisonMenu(){
            vm.selectedPeerItem = null;
            vm.searchPeerText = "";

            if(_.size(vm.indices) === 0 &&
                _.size(vm.competitors === 0))
            {
                toast.simpleToast("Getting Competitors and Indices!");
            }

            if(_.size(vm.indices) === 0)
            {
                vm.loadIndices();

            }

            if(_.size(vm.competitors) === 0)
            {
                vm.loadCompetitors();
            }
        };

        function createFilterFor(query) {
            var lowercaseQuery = angular.lowercase(query);
            return function filterFn(peer) {
                return (peer.display.indexOf(lowercaseQuery) === 0);
            };
        }

        $scope.$on('resetEvents', function (event) {
            vm.splits = false;
            vm.earnings = false;
            vm.dividends = false;
        });

        /* Peers Logic End*/
    }

    /** @ngInject */
    function msStockChartToolBarDirective() {
        return {
            restrict: 'E',
            scope: {
                chartId: "=",
                filterState: "=",
                onFilterStateUpdate: "="
            },
            controller: 'msStockChartToolBarController',
            controllerAs: 'vm',
            templateUrl: 'app/core/directives/ms-chart/ms-stock-chart/toolbar/ms-stock-chart-toolbar.html',
            link: function (scope, el, attr) {
            },
            bindToController: true
        };
    }

})();