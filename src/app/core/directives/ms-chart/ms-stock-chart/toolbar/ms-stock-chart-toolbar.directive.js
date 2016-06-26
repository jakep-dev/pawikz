(function () {
    'use strict';
    angular
        .module('app.core')
        .controller('msStockChartToolBarController', msStockChartToolBarController)
        .directive('msStockChartToolBar', msStockChartToolBarDirective);

    /** @ngInject */
    function msStockChartToolBarController($rootScope, $scope, $log, stockService, $mdMenu, dialog, commonBusiness, $mdSelect) {
        var vm = this;
        vm.splits = false;
        vm.earnings = false;
        vm.dividends = false;
        vm.selectedPeriod = vm.filterState.interval;
        vm.customDateChange = customDateChange;
        /* Indices Logic Start */
        vm.indices = [];

        vm.savedChartData = $rootScope.savedChartData;

        /* Peers Logic Start*/

        vm.peers = [];
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
        vm.maxDate = new Date();//moment().format('DD-MM-YYYY');


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
                            savedIndicesList = vm.savedChartData[chartCount].filterState.selectedIndices;

                            vm.indices = [];
                            angular.forEach(data.indicesResp, function (ind) {
                                var indicesItem = new Object();
                                indicesItem.value = ind.value;
                                indicesItem.display = ind.description;
                                indicesItem.selectedIndicecheck = false;
                                if (savedIndicesList && savedIndicesList.indexOf(indicesItem.value)>-1) {
                                    indicesItem.selectedIndicecheck = true;
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

                        if(chartCount>=0) {
                            savedCompetitorsList = vm.savedChartData[chartCount].filterState.selectedCompetitors;

                            vm.competitors = [];
                            angular.forEach(data.competitors, function (comp) {
                                var competitorItem = new Object();
                                competitorItem.value = comp.ticker;
                                competitorItem.display = comp.companyName;
                                competitorItem.selectedCompetitorcheck = false;
                                if (savedCompetitorsList && savedCompetitorsList.indexOf(competitorItem.value)>-1) {
                                    competitorItem.selectedCompetitorcheck = true;
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
        function customDateChange() {
            if(vm.startDate > vm.endDate) {
                vm.endDate = vm.filterState.endDate;
                dialog.alert('Error', "Entered date range is invalid.To date cannot be prior to From date.", null, {
                    ok: {
                        name: 'ok', callBack: function () {
                            console.log('cliked ok');
                        }
                    }
                });
            }
            else
            {
                vm.filterState.startDate = vm.startDate;
                vm.filterState.endDate = vm.endDate;
                vm.changedPeriod('CUSTOM');
                vm.onFilterStateUpdate();
            }
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
            itemList.forEach(function (item, key) {
                console.log(item, key)
                //considering all the possible legends(indices and peers)
                var count = 1 + vm.filterState.selectedIndices.length + vm.filterState.selectedPeers.length + vm.filterState.selectedCompetitors.length;
                if (count < 5) {
                    console.log('legend1', vm.filterState.selectedIndices, vm.filterState.selectedPeers, item);
                    console.log('item', item.value, vm.filterState.selectedIndices.indexOf(item.value))
                    if (item && item.value && vm.filterState.selectedIndices.indexOf(item.value) === -1) {
                        var selected = vm.filterState.selectedIndices;
                        selected.push(item.value);
                        vm.filterState.selectedIndices = selected;
                        vm.onFilterStateUpdate();
                    }
                    $mdSelect.hide();
                    $mdMenu.hide();
                }
                else {
                    dialog.alert('Error', "Max5 Stock allow to compare!", null, {
                        ok: {
                            name: 'ok', callBack: function () {
                                console.log('cliked ok');
                            }
                        }
                    });
                }
                vm.selectedIndice = null;
            })
        }


        function indicesOrCompetitorDropDownChange(itemType, item) {

            var chartCount = itemList.length + competitorList.length;

            if (chartCount < 4) {
                if (itemType == 'INDICE') {
                    if (item.selectedIndicecheck) {
                        itemList.push(item);
                    }
                    else if (!item.selectedIndicecheck) {
                        for (var itemCount = 0; itemCount < itemList.length; itemCount++) {
                            if (item.value == itemList[itemCount].value) {
                                itemList.splice(itemCount, 1);
                            }
                        }
                    }
                }
                else {
                    if (item.selectedCompetitorcheck) {
                        competitorList.push(item);
                    }
                    else if (!item.selectedCompetitorcheck) {
                        for (var itemCount = 0; itemCount < competitorList.length; itemCount++) {
                            if (item.value == competitorList[itemCount].value) {
                                competitorList.splice(itemCount, 1);
                            }
                        }
                    }
                }
            }
            else {
                if (itemType == 'INDICE') {
                    item.selectedIndicecheck = false;
                }
                else {
                    item.selectedCompetitorcheck = false;
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

        function selectedPeerChange(item) {
            if (item) {
                console.log('legend', vm.filterState.selectedIndices, vm.filterState.selectedPeers, item);
                var count = 1 + vm.filterState.selectedIndices.length + vm.filterState.selectedPeers.length + vm.filterState.selectedCompetitors.length;
                if (count < 5) {
                    if (item && item.value && vm.filterState.selectedPeers.indexOf(item.value) === -1) {
                        var selected = vm.filterState.selectedPeers;
                        selected.push(item.value);
                        vm.filterState.selectedPeers = selected;
                        $mdMenu.hide();
                        vm.onFilterStateUpdate();
                    }

                }
                else {
                    //show pop up
                    dialog.alert('Error', "Max5 Stock allow to compare!", null, {
                        ok: {
                            name: 'ok', callBack: function () {
                                console.log('cliked ok');
                            }
                        }
                    });
                }
            }
            vm.selectedPeerItem = null;
            vm.searchPeerText = "";
            $mdMenu.hide();

        }

        var competitorList = [];

        function addCompetitor() {
            competitorList.forEach(function (item, key) {
                console.log(item, key);
                //considering all the possible legends(indices, peers and Competitors)
                var count = 1 + vm.filterState.selectedIndices.length + vm.filterState.selectedPeers.length + vm.filterState.selectedCompetitors.length;
                if (count < 5) {
                    console.log('legend1', vm.filterState.selectedIndices, vm.filterState.selectedPeers, vm.filterState.selectedCompetitors, item);
                    console.log('item', item.value, vm.filterState.selectedCompetitors.indexOf(item.value))
                    if (item && item.value && vm.filterState.selectedCompetitors.indexOf(item.value) === -1) {
                        var selected = vm.filterState.selectedCompetitors;
                        selected.push(item.value);
                        vm.filterState.selectedCompetitors = selected;
                        vm.onFilterStateUpdate();
                    }
                    $mdSelect.hide();
                    $mdMenu.hide();

                }
                else {
                    dialog.alert('Error', "Max5 Stock allow to compare!", null, {
                        ok: {
                            name: 'ok', callBack: function () {
                                console.log('cliked ok');
                            }
                        }
                    });
                }
                vm.selectedCompetitor = null;

            })
        }

        function selectedCompetitorChange(item) {
            competitorList.push(item);
            vm.selectedItem = null;
            vm.searchIndText = "";
            // $mdMenu.hide();
        }

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