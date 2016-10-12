(function () {
    'use strict';
    angular
        .module('app.core')
        .controller('msFinancialChartToolBarController', msFinancialChartToolBarController)
        .directive('msFinancialChartToolBar', msFinancialChartToolBarDirective);

    /** @ngInject */
    function msFinancialChartToolBarController($rootScope, $scope, $log, stockService, financialChartBusiness, financialChartService, $mdMenu,
                                           dialog, toast, commonBusiness, $mdSelect, $timeout) {
        var vm = this;

        function changedRatioSelection(selectedRatio, label) {
            if (selectedRatio) {
                vm.filterState.chartType = selectedRatio;
                vm.filterState.chartTypeLabel = label;
                vm.onFilterStateUpdate();
            }
        }

        vm.ratioTypes = financialChartService.getFinancialChartRatioTypes();
        vm.changedRatioSelection = changedRatioSelection;

        vm.competitorList = new Array();
        vm.competitorMap = new Array();
        vm.selectedCompetitors = [];
        vm.peerIndustries = financialChartBusiness.peerIndustries;

        if (vm.peerIndustries.length == 0) {
            financialChartService.getFinancialChartPeerAndIndustries(commonBusiness.companyId)
                .then(function (data) {
                    vm.peerIndustries = data;
                    financialChartBusiness.peerIndustries = data;
                    loadPeerIndustry();
                }
            );
        } else {
            loadPeerIndustry();
        }

        function loadPeerIndustry() {

            var i;
            var n = vm.filterState.compareIds.length;
            var peerIndustryId;
            var peerIndustryLabel;
            var competitorItem;

            if (Array.isArray(vm.peerIndustries)) {
                vm.peerIndustries.forEach(function (item) {
                    competitorItem = new Object();
                    competitorItem.value = item.value;
                    competitorItem.label = item.label;
                    competitorItem.selectedCompetitorCheck = false;
                    vm.competitorMap[item.value] = competitorItem;
                    vm.competitorList.push(competitorItem);
                });
            }

            for (i = (n-1); i >= 1; i--) {
                peerIndustryId = vm.filterState.compareIds[i];
                competitorItem = vm.competitorMap[peerIndustryId];
                vm.selectedCompetitors.push(peerIndustryId);
                if (competitorItem) {
                    competitorItem.selectedCompetitorCheck = true;
                } else {
                    peerIndustryLabel = vm.filterState.compareNames[i];
                    competitorItem = new Object();
                    competitorItem.value = peerIndustryId;
                    competitorItem.label = peerIndustryLabel;
                    competitorItem.selectedCompetitorCheck = true;
                    vm.competitorList.splice(0,0, competitorItem);
                    vm.competitorMap[peerIndustryId] = competitorItem;
                }
            }
        }

        function updatePeerIds(checkedItem) {
            vm.selectedCompetitors = [];

            vm.competitorList.forEach(function (item) {
                if (item.selectedCompetitorCheck) {
                    vm.selectedCompetitors.push(item.value);
                }
            });
        }
        vm.updatePeerIds = updatePeerIds;

        function commitChanges() {
            var count = vm.selectedCompetitors.length;
            if (count > 5) {
                //show pop up
                dialog.alert('Error', "Maximum of 5 competitors allowed for chart comparison!", null, {
                    ok: {
                        name: 'ok', callBack: function () {
                        }
                    }
                });
            }
            else {
                var n = vm.filterState.compareIds.length;
                var competitorItem;
                vm.filterState.compareIds.splice(1, n - 1);
                vm.filterState.compareNames.splice(1, n - 1);
                vm.selectedCompetitors.forEach(function (item) {
                    vm.filterState.compareIds.push(item);
                    competitorItem = vm.competitorMap[item];
                    vm.filterState.compareNames.push(competitorItem.label);
                });
                if (vm.filterState.compareIds.length > 1) {
                    vm.filterState.chartMode = 'm';
                } else {
                    vm.filterState.chartMode = 's';
                }
                vm.onFilterStateUpdate();
            }
        }
        vm.commitChanges = commitChanges;
        vm.searchPeerText = "";

        function selectedPeerChange(item) {
            var competitorItem;
            if (item) {
                var value = String(item.value);
                if (!vm.competitorMap[value]) {
                    competitorItem = new Object();
                    competitorItem.value = value;
                    competitorItem.label = item.display;
                    competitorItem.selectedCompetitorCheck = true;
                    vm.competitorList.splice(0, 0, competitorItem);
                    vm.competitorMap[value] = competitorItem;
                    updatePeerIds(competitorItem);
                } else {
                    competitorItem = vm.competitorMap[value];
                    if (!competitorItem.selectedCompetitorCheck) {
                        competitorItem.selectedCompetitorCheck = true;
                        updatePeerIds(competitorItem);
                    }
                }
            }
        }
        vm.selectedPeerChange = selectedPeerChange;

        vm.peers = [];

        function loadPeers(keyword) {
            return stockService
                .findTickers(keyword)
                .then(function (data) {
                    if (data.tickerResp) {
                        vm.peers = [];
                        angular.forEach(data.tickerResp, function (ticker) {
                            vm.peers.push({
                                value: ticker.companyId,
                                display: ticker.companyName
                            });
                        });
                        return vm.peers;
                    }
                });
        }
        vm.loadPeers = loadPeers;

        function queryPeerSearch(query) {
            if (query) {
                return vm.loadPeers(query);
            }
            else {
                vm.peers = [];
                return vm.peers;
            }
        }
        vm.queryPeerSearch = queryPeerSearch;
        vm.selectedPeerItem = null;

        function clear() {
            var n = vm.filterState.compareIds.length;
            vm.filterState.compareIds.splice(1, n - 1);
            vm.filterState.compareNames.splice(1, n - 1);
            vm.filterState.chartMode = 's';
            vm.selectedCompetitors = [];
            vm.competitorList.forEach(function (item) {
                item.selectedCompetitorCheck = false;
            });
            vm.selectedPeerItem = null;
            vm.searchPeerText = "";
            vm.onFilterStateUpdate();
        }
        vm.clear = clear;

        function setStartEndDate(periodVal) {
            var d = new Date();
            vm.endDate = new Date();
            if (periodVal === '1') {
                d.setFullYear(d.getFullYear() - 1);
            }
            else if (periodVal === '2') {
                d.setFullYear(d.getFullYear() - 2);
            }
            else if (periodVal === '3') {
                d.setFullYear(d.getFullYear() - 3);
            }
            else if (periodVal === '5') {
                d.setFullYear(d.getFullYear() - 5);
            }
            else if (periodVal === '10') {
                d.setFullYear(d.getFullYear() - 10);
            }
            vm.startDate = d;
        }

        if (vm.filterState.chartPeriod) {
            var num = parseInt(vm.filterState.chartPeriod);
            if (isNaN(num)) {
                setStartEndDate('3');
            } else if ((num === 1) || (num === 2) || (num === 3) || (num === 5) || (num === 10)) {
                setStartEndDate(String(num));
            } else {
                setStartEndDate('3');
            }
        }

        if (vm.filterState.isCustomDate) {
            vm.startDate = new Date(vm.filterState.startDate);
            vm.endDate = new Date(vm.filterState.endDate);
        }

        function changedPeriod(periodVal) {
            vm.filterState.chartPeriod = periodVal;
            vm.filterState.isCustomDate = false;
            setStartEndDate(periodVal);
            vm.filterState.startDate = financialChartBusiness.toDateString(vm.startDate);
            vm.filterState.endDate = financialChartBusiness.toDateString(vm.endDate);
            vm.onFilterStateUpdate();
        }
        vm.changedPeriod = changedPeriod;

        function customDateChange() {
//            $timeout(function () {
                if (vm.startDate > vm.endDate) {
                    vm.endDate = new Date(vm.filterState.endDate);
                    dialog.alert('Error', "Entered date range is invalid.To date cannot be prior to From date.", null, {
                        ok: {
                            name: 'ok', callBack: function () {
                            }
                        }
                    });
                }
                else {
                    if (vm.startDate && vm.endDate) {
                        vm.filterState.startDate = financialChartBusiness.toDateString(vm.startDate);
                        vm.filterState.endDate = financialChartBusiness.toDateString(vm.endDate);
                        vm.filterState.isCustomDate = true;
                        vm.filterState.chartPeriod = ' ';
                        //vm.changedPeriod('CUSTOM');
                        vm.onFilterStateUpdate();
                    }
                }
//            }, 1000)
        }
        vm.customDateChange = customDateChange;

        $scope.$on('resetEvents', function (event) {
            //vm.splits = false;
            //vm.earnings = false;
            //vm.dividends = false;
        });

        /* Peers Logic End*/
    }

    /** @ngInject */
    function msFinancialChartToolBarDirective() {
        return {
            restrict: 'E',
            scope: {
                chartId: "=",
                filterState: "=",
                onFilterStateUpdate: "="
            },
            controller: 'msFinancialChartToolBarController',
            controllerAs: 'vm',
            templateUrl: 'app/core/directives/ms-chart/ms-financial-chart/toolbar/ms-financial-chart-toolbar.html',
            link: function (scope, el, attr) {
            },
            bindToController: true
        };
    }

})();