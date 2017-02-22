(function () {
    'use strict';
    angular.module('app.core')
           .controller('msStockChartToolBarController', msStockChartToolBarController)
           .directive('msStockChartToolBar', msStockChartToolBarDirective);

    /** @ngInject */
    function msStockChartToolBarController($scope, 
                                           dialog,
                                           commonBusiness, stockChartBusiness, stockService) {
        var vm = this;
        vm.splits = vm.filterState.splits;
        vm.earnings = vm.filterState.earnings;
        vm.dividends = vm.filterState.dividends;
        vm.selectedPeriod = vm.filterState.interval;

        vm.peerIndustryList = new Array();
        vm.peerIndustryMap = new Array();
        vm.selectedPeerIndustries = [];

        function loadIndices() {
            var indices = stockChartBusiness.indices;
            if (indices.length == 0) {
                stockService.getIndices()
                .then(function (data) {
                    stockChartBusiness.indices = data;
                    postProcessIndices(data);
                });
            } else {
                postProcessIndices(indices);
            }
        }

        function postProcessIndices(indices) {
            var i;
            var n;
            var peerIndustryItem;
            var value;
            var values;
            var peerName;

            if (Array.isArray(vm.filterState.selectedPeers)) {
                n = vm.filterState.selectedPeers.length;
                if (n > 0) {
                    //Add 'Custom Added Peers' sub-heading if there are custom peers
                    peerIndustryItem = new Object();
                    peerIndustryItem.value = null;
                    peerIndustryItem.display = 'Custom Added Peers';
                    peerIndustryItem.selectedPeerIndustryCheck = false;
                    vm.peerIndustryList.push(peerIndustryItem);
                    for (i = 0; i < n; i++) {
                        value = vm.filterState.selectedPeers[i];
                        peerName = vm.filterState.selectedPeerNames[i];
                        if (value) {
                            values = value.split('#');
                            if ((values.length != 2) || !values[0] || (values[0] === 'null') || !values[1] || (values[1] === 'null')) {
                                console.log('Unexpected null Peer value.');
                            } else if (!peerName) {
                                console.log('Unexpected null Peer Name value.');
                            } else {
                                peerIndustryItem = new Object();
                                peerIndustryItem.value = value;
                                peerIndustryItem.display = _.unescape(peerName);
                                peerIndustryItem.type = 'Peer';
                                peerIndustryItem.selectedPeerIndustryCheck = true;
                                vm.selectedPeerIndustries.push(peerIndustryItem.value);
                                vm.peerIndustryList.push(peerIndustryItem);
                                vm.peerIndustryMap[peerIndustryItem.value]= peerIndustryItem;
                            }
                        }
                    }
                }
            }

            if (Array.isArray(indices)) {
                n = indices.length;
                if (n > 0) {
                    //Add 'Industries' sub-heading
                    peerIndustryItem = new Object();
                    peerIndustryItem.value = null;
                    peerIndustryItem.display = 'Industries';
                    peerIndustryItem.selectedPeerIndustryCheck = false;
                    vm.peerIndustryList.push(peerIndustryItem);
                    for (i = 0; i < n; i++) {
                        peerIndustryItem = new Object();
                        peerIndustryItem.value = indices[i].value;
                        peerIndustryItem.display = _.unescape(indices[i].description);
                        peerIndustryItem.type = 'Industry';
                        peerIndustryItem.selectedPeerIndustryCheck = false;
                        vm.peerIndustryList.push(peerIndustryItem);
                        vm.peerIndustryMap[peerIndustryItem.value] = peerIndustryItem;
                    }
                }
            }

            n = vm.filterState.selectedIndices.length;
            for (i = 0; i < n; i++) {
                value = vm.filterState.selectedIndices[i];
                peerIndustryItem = vm.peerIndustryMap[value];
                if (peerIndustryItem) {
                    peerIndustryItem.selectedPeerIndustryCheck = true;
                    vm.selectedPeerIndustries.push(peerIndustryItem.value);
                } else {
                    console.log('Selected index value ' + value + ' is not found in the indices list.');
                }
            }
        }

        function updatePeerIds(checkedItem) {
            vm.selectedPeerIndustries = [];

            vm.peerIndustryList.forEach(function (item) {
                if (item.selectedPeerIndustryCheck) {
                    vm.selectedPeerIndustries.push(item.value);
                }
            });
        }
        vm.updatePeerIds = updatePeerIds;
        loadIndices();

        vm.peers = [];
        vm.maxDate = new Date();
        setStartEndDate(vm.selectedPeriod);
        setStartEndDate(vm.selectedPeriod);

        vm.competitorList = new Array();
        vm.competitorMap = new Array();
        vm.selectedCompetitors = [];

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

            var n;
            var i;
            var competitorItem;
            var value;

            if (Array.isArray(competitors)) {
                n = competitors.length;
                if (n > 0) {
                    for (i = 0; i < n; i++) {
                        competitorItem = new Object();
                        competitorItem.value = competitors[i].ticker;
                        competitorItem.display = _.unescape(competitors[i].companyName);
                        competitorItem.type = 'Competitor';
                        competitorItem.selectedCompetitorCheck = false;
                        vm.competitorList.push(competitorItem);
                        vm.competitorMap[competitorItem.value] = competitorItem;
                    }
                }
            }
            n = vm.filterState.selectedCompetitors.length;
            for (i = 0; i < n; i++) {
                value = vm.filterState.selectedCompetitors[i];
                competitorItem = vm.competitorMap[value];
                if (competitorItem) {
                    competitorItem.selectedCompetitorCheck = true;
                    vm.selectedCompetitors.push(competitorItem.value);
                } else {
                    console.log('Selected index value ' + value + ' is not found in the competitors list.');
                }
            }
        }

        function updateCompetitorIds(checkedItem) {
            vm.selectedCompetitors = [];

            vm.competitorList.forEach(function (item) {
                if (item.selectedCompetitorCheck) {
                    vm.selectedCompetitors.push(item.value);
                }
            });
        }
        vm.updateCompetitorIds = updateCompetitorIds;
        loadCompetitors();

        vm.selectedPeerItem = null;
        vm.searchPeerText = "";

        setStartEndDate(vm.selectedPeriod);

        function loadPeers(keyword) {
            return stockService
                .findTickers(keyword)
                .then(function (data) {
                    if (data.tickerResp) {
                        vm.peers = [];
                        angular.forEach(data.tickerResp, function (ticker) {
                            if (ticker.companyId && (ticker.companyId != commonBusiness.companyId)) {
                            vm.peers.push({
                                value: ticker.ticker,
                                display: ticker.companyName
                            });
                        }
                    });
                    return vm.peers;
                }
            });
        }

        function customDateChange() {
            if (vm.startDate > vm.endDate) {
                vm.startDate = vm.filterState.startDate;
                vm.endDate = vm.filterState.endDate;
                dialog.alert('Error', "Entered date range is invalid.To date cannot be prior to From date.", null, null, {
                    ok: {
                        name: 'ok', callBack: function () {
                        }
                    }
                });
            } else {
                if (vm.startDate && vm.endDate) {
                    var duration;
                    duration = moment.duration(moment(vm.endDate).diff(moment(vm.startDate)));
                    if (duration.asYears() >= 10.0) {
                        vm.startDate = vm.filterState.startDate;
                        vm.endDate = vm.filterState.endDate;
                        dialog.alert('Warning!', "Custom date range cannot exceed 10 years. Please adjust the date range.", null, null, {
                            ok: {
                                name: 'ok', callBack: function () {
                                }
                            }
                        });
                    } else {
                        vm.filterState.startDate = vm.startDate;
                        vm.filterState.endDate = vm.endDate;
                        vm.changedPeriod('CUSTOM');
                        vm.onFilterStateUpdate();
                    }
                }
            }
        }
        vm.customDateChange = customDateChange;

        function changedSplitsEvents() {
            vm.filterState.splits = vm.splits;
            vm.onFilterStateUpdate();
        }
        vm.changedSplitsEvents = changedSplitsEvents;

        function changedEarningsEvents() {
            vm.filterState.earnings = vm.earnings;
            vm.onFilterStateUpdate();
        }
        vm.changedEarningsEvents = changedEarningsEvents;

        function changedDividendsEvents() {
            vm.filterState.dividends = vm.dividends;
            vm.onFilterStateUpdate();
        }
        vm.changedDividendsEvents = changedDividendsEvents;

        function changedPeriod(periodVal) {
            vm.filterState.startDate = vm.startDate;
            vm.filterState.endDate = vm.endDate;
            vm.filterState.interval = periodVal;
            setStartEndDate(periodVal);
            vm.onFilterStateUpdate();
        }
        vm.changedPeriod = changedPeriod;

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
                return loadPeers(query);
            } else {
                vm.peers = [];
                return vm.peers;
            }
        }
        vm.queryPeerSearch = queryPeerSearch;

        function selectedPeerChange(item) {
            var peerIndustryItem;
            if (item) {
                var value = String(item.value);
                if (!vm.peerIndustryMap[value]) {
                    //Add 'Custom Added Peers' sub-heading if there are no previous custom peers added before adding this current peer
                    if (vm.peerIndustryList[0].display != 'Custom Added Peers') {
                        peerIndustryItem = new Object();
                        peerIndustryItem.value = null;
                        peerIndustryItem.display = 'Custom Added Peers';
                        peerIndustryItem.selectedPeerIndustryCheck = false;
                        vm.peerIndustryList.splice(0, 0, peerIndustryItem);
                    }
                    peerIndustryItem = new Object();
                    peerIndustryItem.value = value;
                    peerIndustryItem.display = item.display;
                    peerIndustryItem.type = 'Peer';
                    peerIndustryItem.selectedPeerIndustryCheck = true;
                    vm.peerIndustryList.splice(1, 0, peerIndustryItem);
                    vm.peerIndustryMap[value] = peerIndustryItem;
                    updatePeerIds(peerIndustryItem);
                } else {
                    peerIndustryItem = vm.peerIndustryMap[value];
                    if (!peerIndustryItem.selectedPeerIndustryCheck) {
                        peerIndustryItem.selectedPeerIndustryCheck = true;
                        updatePeerIds(peerIndustryItem);
                    }
                }
            }
        }
        vm.selectedPeerChange = selectedPeerChange;

        function commitChanges() {
            var count = vm.selectedPeerIndustries.length + vm.selectedCompetitors.length;
            if (count > 4) {
                //show pop up
                dialog.alert('Error', "Maximum of 4 competitors allowed for chart comparison!", null, {
                    ok: {
                            name: 'ok', callBack: function () {
                        }
                    }
                });
            }
            else {
                var n;
                var i;
                var item;
                var value;

                vm.filterState.selectedIndices = [];
                vm.filterState.selectedPeers = [];
                n = vm.selectedPeerIndustries.length;
                for (i = 0; i < n; i++) {
                    value = vm.selectedPeerIndustries[i];
                    item = vm.peerIndustryMap[value];
                    if (item.type === 'Industry') {
                        vm.filterState.selectedIndices.push(value);
                    } else if (item.type === 'Peer') {
                        vm.filterState.selectedPeers.push(value);
                    }
                }

                vm.filterState.selectedCompetitors = [];
                n = vm.selectedCompetitors.length;
                for (i = 0; i < n; i++) {
                    value = vm.selectedCompetitors[i];
                    item = vm.competitorMap[value];
                    if (item.type === 'Competitor') {
                        vm.filterState.selectedCompetitors.push(item.value);
                    }
                }

                vm.onFilterStateUpdate();
            }
        }
        vm.commitChanges = commitChanges;

        function clear() {
            vm.filterState.selectedIndices = [];
            vm.filterState.selectedPeers = [];
            vm.filterState.selectedCompetitors = [];

            vm.selectedPeerIndustries = [];
            vm.peerIndustryList.forEach(function (item) {
                item.selectedPeerIndustryCheck = false;
            });

            vm.selectedCompetitors = [];
            vm.competitorList.forEach(function (item) {
                item.selectedCompetitorCheck = false;
            });

            vm.selectedPeerItem = null;
            vm.searchPeerText = "";
            vm.onFilterStateUpdate();
        }
        vm.clear = clear;
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