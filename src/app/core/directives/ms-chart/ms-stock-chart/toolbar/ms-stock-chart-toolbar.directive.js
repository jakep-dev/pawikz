(function () {
    'use strict';
    angular.module('app.core')
           .controller('msStockChartToolBarController', msStockChartToolBarController)
           .directive('msStockChartToolBar', msStockChartToolBarDirective);

    /** @ngInject */
    function msStockChartToolBarController($rootScope, $scope, $log, $mdMenu, $mdSelect, $timeout,
                                           dialog, toast, commonBusiness, stockChartBusiness, stockService) {
        var vm = this;
        vm.splits = vm.filterState.splits;
        vm.earnings = vm.filterState.earnings;
        vm.dividends = vm.filterState.dividends;
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
            var chartCount = vm.chartId.split('-');
            chartCount = parseInt(chartCount[1]);
            var savedIndicesList = [];

            if (chartCount >= 0) {
                if (vm.savedChartData && _.size(vm.savedChartData) > 0) {
                    savedIndicesList = vm.savedChartData[chartCount].filterState.selectedIndices;
                }

                vm.indices = [];
                indicesList = [];
                angular.forEach(stockService.getIndices(), function (ind) {
                    var indicesItem = new Object();
                    indicesItem.value = ind.value;
                    indicesItem.display = ind.description;
                    indicesItem.selectedIndicecheck = false;
                    if (savedIndicesList && savedIndicesList.indexOf(indicesItem.value) > -1) {
                        indicesItem.selectedIndicecheck = true;
                        indicesList.push(indicesItem);
                    }
                    vm.indices.push(indicesItem);
                });
            }
        }

        setStartEndDate(vm.selectedPeriod);

        function loadCompetitors() {
            var competitors;
            if (stockService.getCurrentCompanyId() === commonBusiness.companyId) {
                competitors = stockChartBusiness.competitors;
            } else {
                competitors = [];
            }
            if (competitors.length == 0) {
                stockService.getCompetitors(commonBusiness.companyId)
                .then(function (data) {
                    stockChartBusiness.competitors = data;
                    loadCompetitorsPostProcess(data);
                });
            } else {
                loadCompetitorsPostProcess(competitors);
            }
        }

        function loadCompetitorsPostProcess(competitors) {
            var chartCount = vm.chartId.split('-');
            chartCount = parseInt(chartCount[1]);
            var savedCompetitorsList = [];
            competitorList = [];
            if (chartCount >= 0) {
                if (vm.savedChartData && _.size(vm.savedChartData) > 0) {
                    savedCompetitorsList = vm.savedChartData[chartCount].filterState.selectedCompetitors;
                }

                angular.forEach(competitors, function (comp) {
                    var competitorItem = new Object();
                    competitorItem.value = comp.ticker;
                    competitorItem.display = comp.companyName;
                    competitorItem.selectedCompetitorcheck = false;
                    if (savedCompetitorsList &&
                        savedCompetitorsList.indexOf(competitorItem.value) > -1) {
                        competitorItem.selectedCompetitorcheck = true;
                        competitorList.push(competitorItem);
                    }
                    vm.competitors.push(competitorItem);
                });
            }
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
            $timeout(function() {
                if (vm.startDate > vm.endDate) {
                    vm.endDate = vm.filterState.endDate;
                    dialog.alert('Error', "Entered date range is invalid.To date cannot be prior to From date.", null, {
                        ok: {
                            name: 'ok', callBack: function () {
                            }
                        }
                    });
                } else {
                    if (vm.startDate && vm.endDate) {
                        vm.filterState.startDate = vm.startDate;
                        vm.filterState.endDate = vm.endDate;
                        vm.changedPeriod('CUSTOM');
                        vm.onFilterStateUpdate();
                    }
                }
            }, 1000);
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
                } else if (periodVal === '1M') {
                    d.setMonth(d.getMonth() - 1);
                } else if (periodVal === '3M') {
                    d.setMonth(d.getMonth() - 3);
                } else if (periodVal === '18M') {
                    d.setMonth(d.getMonth() - 18);
                } else if (periodVal === '1Y') {
                    d.setFullYear(d.getFullYear() - 1);
                } else if (periodVal === '2Y') {
                    d.setFullYear(d.getFullYear() - 2);
                } else if (periodVal === '3Y') {
                    d.setFullYear(d.getFullYear() - 3);
                } else if (periodVal === '5Y') {
                    d.setFullYear(d.getFullYear() - 5);
                } else if (periodVal === '10Y') {
                    d.setFullYear(d.getFullYear() - 10);
                }
                vm.startDate = d;
                vm.filterState.startDate = vm.startDate;
                vm.filterState.endDate = vm.endDate;
            } else {
                vm.startDate = vm.filterState.startDate;
                vm.endDate = vm.filterState.endDate;
            }
        }

        function queryPeerSearch(query) {
            if (query) {
                return vm.loadPeers(query);
            } else {
                vm.peers = [];
                return vm.peers;
            }
            // return vm.peers;
        }

        var indicesList = [];
        function addIndices() {
            vm.filterState.selectedIndices = [];
            indicesList.forEach(function (item, key) {
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
                if (item.selectedIndicecheck && indicesList.indexOf(item) == -1) {
                    indicesList.push(item);
                    if (!validateSelectedCount()) {
                        for (var itemCount = 0; itemCount < indicesList.length; itemCount++) {
                            if (item.value == indicesList[itemCount].value) {
                                indicesList.splice(itemCount, 1);
                                break;
                            }
                        }
                        for (var i = 0; i < vm.indices.length; i++) {
                            if (vm.indices[i].value == item.value) {
                                vm.indices[i].selectedIndicecheck = false;
                                break;
                            }
                        }
                    }
                } else {
                    for (var itemCount = 0; itemCount < indicesList.length; itemCount++) {
                        if (item.value == indicesList[itemCount].value) {
                            indicesList.splice(itemCount, 1);
                        }
                    }
                }
            } else {
                if (item.selectedCompetitorcheck && competitorList.indexOf(item) == -1) {
                    competitorList.push(item);
                    if (!validateSelectedCount()) {
                        for (var itemCount = 0; itemCount < competitorList.length; itemCount++) {
                            if (item.value == competitorList[itemCount].value) {
                                competitorList.splice(itemCount, 1);
                                break;
                            }
                        }
                        for (var i = 0; i < vm.competitors.length; i++) {
                            if (vm.competitors[i].value == item.value) {
                                vm.competitors[i].selectedCompetitorcheck = false;
                                break;
                            }
                        }
                    }
                } else {
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
            indicesList.push(item);
            vm.selectedItem = null;
            vm.searchIndText = "";
            //$mdMenu.hide();
        }

        function reloadIndices() {
            indicesList = [];
            vm.indices.forEach(function(index) {
                index.selectedIndicecheck = false;
            });

            vm.filterState.selectedIndices.forEach(function(selectedIndex) {
                for (var i = 0; i < vm.indices.length; i++) {
                    if (vm.indices[i].value == selectedIndex) {
                        vm.indices[i].selectedIndicecheck = true;
                        indicesList.push(vm.indices[i]);
                        break;
                    }
                }
            }); 
        }

        var peerList = [];
        function addPeer() {
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

        function reloadPeers() {
            peerList = [];
            vm.filterState.selectedPeers.forEach(function (item, key) {
                if (item && item.value) {
                    peerList.push(item);
                }
            })
        }

        function selectedPeerChange(item) {
            if (item && item.value && peerList.indexOf(item) == -1) {
                peerList.push(item);
                if (!validateSelectedCount()) {
                    for (var peerNdx = 0; peerNdx < peerList.length; peerNdx++) {
                        if (item.value == peerList[peerNdx].value) {
                            peerList.splice(peerNdx, 1);
                            break;
                        }
                    }
                    vm.selectedPeerItem = null;
                    vm.searchPeerText = "";
                }
            }
        }

        function add() {
            addCompetitor();
            addIndices();
            addPeer();
            vm.onFilterStateUpdate();
        }

        function clear() {
            vm.filterState.selectedIndices = [];
            vm.filterState.selectedPeers = [];
            vm.filterState.selectedCompetitors = [];
            indicesList = [];
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

        function reloadCompetitors() {
            competitorList = [];
            vm.competitors.forEach(function(competitor) {
                competitor.selectedCompetitorcheck = false;
            });

            vm.filterState.selectedCompetitors.forEach(function(selCompetitor) {
                for (var i = 0; i < vm.competitors.length; i++) {
                    if (vm.competitors[i].value == selCompetitor) {
                        vm.competitors[i].selectedCompetitorcheck = true;
                        competitorList.push(vm.competitors[i]);
                        break;
                    }
                }
            }); 
        }

        function presetComparisonMenu() {
            vm.selectedPeerItem = null;
            vm.searchPeerText = "";

            if (_.size(vm.indices) === 0 && _.size(vm.competitors === 0)) {
                toast.simpleToast("Getting Competitors and Indices!");
            }

            if (_.size(vm.indices) === 0) {
                vm.loadIndices();
            }

            if (_.size(vm.competitors) === 0) {
                vm.loadCompetitors();
            }
        };

        function createFilterFor(query) {
            var lowercaseQuery = angular.lowercase(query);
            return function filterFn(peer) {
                return (peer.display.indexOf(lowercaseQuery) === 0);
            };
        }

        function validateSelectedCount() {
            var isValid = (1 + indicesList.length + peerList.length + competitorList.length) <= 5;
            if (!isValid) {
                dialog.alert('Error', "Max of 5 Stocks allowed to compare!", null, {
                    ok: {
                        name: 'ok', callBack: function () {
                        }
                    }
                });
            }
            return isValid;
        }

        $scope.$on('resetEvents', function (event) {
            vm.splits = false;
            vm.earnings = false;
            vm.dividends = false;
        });

        $scope.$on('reloadIndices', function (event) {
            reloadIndices();
            vm.onFilterStateUpdate();
        });

        $scope.$on('reloadPeers', function (event) {
            reloadPeers();
            vm.onFilterStateUpdate();
        });

        $scope.$on('reloadCompetitors', function (event) {
            reloadCompetitors();
            vm.onFilterStateUpdate();
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