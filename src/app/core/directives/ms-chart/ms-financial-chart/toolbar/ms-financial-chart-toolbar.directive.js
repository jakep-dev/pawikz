(function () {
    'use strict';
    angular
        .module('app.core')
        .controller('msFinancialChartToolBarController', msFinancialChartToolBarController)
        .directive('msFinancialChartToolBar', msFinancialChartToolBarDirective);

    /** @ngInject */
    function msFinancialChartToolBarController($scope, $mdMenu, $timeout,
                                           dialog, 
                                           commonBusiness, financialChartBusiness, financialChartService, stockService) {
        var vm = this;

        function changedRatioSelection(selectedRatio, label) {
            if (selectedRatio) {
                vm.filterState.chartType = selectedRatio;
                vm.filterState.chartTypeLabel = label;
                vm.onTitleUpdate(label);
                vm.onFilterStateUpdate();
            }
        }

        vm.ratioTypes = financialChartService.getFinancialChartRatioTypes();
        vm.changedRatioSelection = changedRatioSelection;

        vm.competitorList = new Array();
        vm.competitorMap = new Array();
        vm.selectedCompetitors = [];
        if (financialChartService.getCurrentCompanyId() === commonBusiness.companyId) {
            vm.peerIndustries = financialChartBusiness.peerIndustries;
        } else {
            vm.peerIndustries = [];
        }
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
            var peerIndustryShortName;
            var competitorItem;
            var n1;
            var n2;

            if (Array.isArray(vm.peerIndustries)) {
                vm.peerIndustries.forEach(function (item) {
                    competitorItem = new Object();
                    competitorItem.value = item.value;
                    competitorItem.label = _.unescape(item.label);
                    competitorItem.shortName = _.unescape(item.shortName);
                    competitorItem.selectedCompetitorCheck = false;
                    if (item.value) {
                        vm.competitorMap[item.value] = competitorItem;
                    }
                    vm.competitorList.push(competitorItem);
                });
            }
            n1 = vm.competitorList.length;
            for (i = (n-1); i >= 1; i--) {
                peerIndustryId = vm.filterState.compareIds[i];
                competitorItem = vm.competitorMap[peerIndustryId];
                vm.selectedCompetitors.push(peerIndustryId);
                if (competitorItem) {
                    competitorItem.selectedCompetitorCheck = true;
                } else {
                    peerIndustryLabel = vm.filterState.compareNames[i];
                    peerIndustryShortName = vm.filterState.shortNames[i];
                    competitorItem = new Object();
                    competitorItem.value = peerIndustryId;
                    competitorItem.label = peerIndustryLabel;
                    competitorItem.shortName = peerIndustryShortName;
                    competitorItem.selectedCompetitorCheck = true;
                    vm.competitorList.splice(0, 0, competitorItem);
                    vm.competitorMap[peerIndustryId] = competitorItem;
                }
            }
            n2 = vm.competitorList.length;
            if (n2 > n1) {
                competitorItem = new Object();
                competitorItem.value = null;
                competitorItem.label = 'Custom Added Peers';
                competitorItem.shortName = 'Custom Added Peers';
                competitorItem.selectedCompetitorCheck = false;
                vm.competitorList.splice(0, 0, competitorItem);
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
                var n = vm.filterState.compareIds.length;
                var competitorItem;
                vm.filterState.compareIds.splice(1, n - 1);
                vm.filterState.compareNames.splice(1, n - 1);
                vm.filterState.shortNames.splice(1, n - 1);
                vm.selectedCompetitors.forEach(function (item) {
                    vm.filterState.compareIds.push(item);
                    competitorItem = vm.competitorMap[item];
                    vm.filterState.compareNames.push(competitorItem.label);
                    vm.filterState.shortNames.push(competitorItem.shortName);
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
                    if (vm.competitorList[0].label != 'Custom Added Peers') {
                        competitorItem = new Object();
                        competitorItem.value = null;
                        competitorItem.label = 'Custom Added Peers';
                        competitorItem.shortName = 'Custom Added Peers';
                        competitorItem.selectedCompetitorCheck = false;
                        vm.competitorList.splice(0, 0, competitorItem);
                    }
                    competitorItem = new Object();
                    competitorItem.value = value;
                    competitorItem.label = item.display;
                    competitorItem.shortName = item.shortName;
                    competitorItem.selectedCompetitorCheck = true;
                    vm.competitorList.splice(1, 0, competitorItem);
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
        vm.maxDate = new Date();
        vm.maxDate.setHours(0);
        vm.maxDate.setMinutes(0);
        vm.maxDate.setSeconds(0);
        vm.maxDate.setMilliseconds(0);
        vm.maxStartDate = vm.maxDate;
        vm.maxEndDate = vm.maxDate;

        function loadPeers(keyword) {
            return stockService
                .findTickers(keyword)
                .then(function (data) {
                    if (data.tickerResp) {
                        vm.peers = [];
                        angular.forEach(data.tickerResp, function (ticker) {
                            if (ticker.companyId && (ticker.companyId != commonBusiness.companyId)) {
                                var tickerParts = ticker.ticker;
                                var tickerArr;
                                var shortName = ticker.companyName;
                                if (tickerParts) {
                                    tickerArr = tickerParts.split('#');
                                    if (tickerArr && Array.isArray(tickerArr) && (tickerArr.length > 0)) {
                                        shortName = tickerArr[0];
                                    }
                                }
                                vm.peers.push({
                                    value: ticker.companyId,
                                    display: ticker.companyName,
                                    shortName: shortName
                                });
                            }
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
            vm.filterState.shortNames.splice(1, n - 1);
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

        //Assign internal date components individually to avoid straight assignment dest = src
        //so that changes to dest in the future won't change src
        function assignDateValue(src, dest) {
            if (angular.isDate(dest)) {
                dest.setFullYear(src.getFullYear());
                dest.setMonth(src.getMonth());
                dest.setDate(src.getDate());
            }
        }

        //When there is an error with the start or end date, reset both start and end date from vm.filterState
        //To work around the bug with the md-datepicker control when setting a value outside allowable date range
        //      1) set the max date to the previous value to force the currently invalid date to be out of range
        //      2) set date (vm.startDate/vm.endDate) within the new temporary range
        //      3) allow the ng-model binding to update.
        //      4) when $timeout function is called the model is updated with the temporary values (vm.startDate/vm.endDate)
        //      5) set date (vm.startDate/vm.endDate) to the previous value from vm.filterState
        //      6) set the max date for the md-datepicker
        function resetCustomDate() {
            vm.maxStartDate = new Date(vm.filterState.startDate);
            vm.startDate.setDate(vm.maxStartDate.getDate() - 1);
            vm.maxEndDate = new Date(vm.filterState.endDate);
            vm.endDate.setDate(vm.maxEndDate.getDate() - 1);
            $timeout(function () {
                vm.startDate = new Date(vm.filterState.startDate);
                assignDateValue(vm.startDate, vm.prevStartDate);
                vm.endDate = new Date(vm.filterState.endDate);
                assignDateValue(vm.endDate, vm.prevEndDate);
                vm.maxStartDate = vm.maxDate;
                vm.maxEndDate = vm.maxDate;
                setMinCalendarDate();
                vm.onFilterStateUpdate();
            }, 10);
        }

        //Since the md-datepicker is inside the menu, we have to delay the hiding of the menu to allow the workaround to run before closing the menu
        function delayedMenuHide() {
            $timeout(function () {
                $mdMenu.hide();
            }, 500);
        }

        function setStartEndDate(periodVal) {
            var d = new Date();
            vm.endDate = new Date();
            vm.endDate.setHours(0);
            vm.endDate.setMinutes(0);
            vm.endDate.setSeconds(0);
            vm.endDate.setMilliseconds(0);
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
            vm.startDate.setHours(0);
            vm.startDate.setMinutes(0);
            vm.startDate.setSeconds(0);
            vm.startDate.setMilliseconds(0);

            vm.filterState.startDate = financialChartBusiness.toDateString(vm.startDate);
            vm.filterState.endDate = financialChartBusiness.toDateString(vm.endDate);

            setMinCalendarDate();
            vm.prevStartDate = new Date(vm.startDate);
            vm.prevEndDate = new Date(vm.endDate);
        }

        if (vm.filterState.isCustomDate) {
            vm.startDate = new Date(vm.filterState.startDate);
            vm.startDate.setHours(0);
            vm.startDate.setMinutes(0);
            vm.startDate.setSeconds(0);
            vm.startDate.setMilliseconds(0);

            vm.endDate = new Date(vm.filterState.endDate);
            vm.endDate.setHours(0);
            vm.endDate.setMinutes(0);
            vm.endDate.setSeconds(0);
            vm.endDate.setMilliseconds(0);

            setMinCalendarDate();
            vm.prevStartDate = new Date(vm.startDate);
            vm.prevEndDate = new Date(vm.endDate);
        } else {
            var num = parseInt(vm.filterState.chartPeriod);
            if(isNaN(num)) {
                setStartEndDate('3');
            } else if ((num === 1) || (num === 2) || (num === 3) || (num === 5) || (num === 10)) {
                setStartEndDate(String(num));
            } else {
                setStartEndDate('3');
            }
        }

        function changedPeriod(periodVal) {
            vm.filterState.startDate = financialChartBusiness.toDateString(vm.startDate);
            vm.filterState.endDate = financialChartBusiness.toDateString(vm.endDate);

            vm.filterState.chartPeriod = periodVal;
            vm.filterState.isCustomDate = false;

            setStartEndDate(periodVal);
            vm.onFilterStateUpdate();
        }
        vm.changedPeriod = changedPeriod;

        function customDateChange() {
            if (!vm.startDate) {
                vm.startDate = new Date(vm.prevStartDate);
            } else {
                //vm.prevStartDate = vm.startDate;
                assignDateValue(vm.startDate, vm.prevStartDate);
            }
            if (!vm.endDate) {
                vm.endDate = new Date(vm.prevEndDate);
            } else {
                //vm.prevEndDate = vm.endDate;
                assignDateValue(vm.endDate, vm.prevEndDate);
            }
            if (vm.startDate > vm.endDate) {
                resetCustomDate();
                delayedMenuHide();
                dialog.alert('Error', "Entered date range is invalid. To date cannot be prior to From date.", null, null, {
                    ok: {
                        name: 'ok'
                    }
                });
            }
            else {
                if (vm.startDate && vm.endDate) {
                    if (isLessThanAbsoluteMinDate(vm.startDate)) {
                        resetCustomDate();
                        delayedMenuHide();
                        dialog.alert('Warning!', "Data exists from 01/01/1996 onward. Please adjust 'From' date.", null, null, {
                            ok: {
                                name: 'ok'
                            }
                        });
                    } else if (vm.endDate > vm.maxDate) {
                        resetCustomDate();
                        delayedMenuHide();
                        dialog.alert('Warning!', "'To' date cannot be a future date. Please adjust to a current or past date.", null, null, {
                            ok: {
                                name: 'ok'
                            }
                        });
                    } else {
                        var minDate = new Date(vm.endDate);
                        minDate.setFullYear(vm.endDate.getFullYear() - 10);
                        if (vm.startDate < minDate) {
                            resetCustomDate();
                            delayedMenuHide();
                            dialog.alert('Warning!', "Custom date range cannot exceed 10 years. Please adjust the date range.", null, null, {
                                ok: {
                                    name: 'ok'
                                }
                            });
                        } else {
                            vm.filterState.startDate = financialChartBusiness.toDateString(vm.startDate);
                            vm.filterState.endDate = financialChartBusiness.toDateString(vm.endDate);
                            vm.filterState.isCustomDate = true;
                            vm.filterState.chartPeriod = ' ';
                            setMinCalendarDate();
                            vm.onFilterStateUpdate();
                        }
                    }
                }
            }
        }
        vm.customDateChange = customDateChange;

        function onBlur(event, name) {
            var inputCtrl;
            var modelValue;
            var newValue;
            var dateFormat = 'M/D/YYYY';

            if (event && event.target && $(event.target).find('input').length > 0) {
                inputCtrl = $(event.target).find('input')[0];
                newValue = moment(inputCtrl.value, dateFormat, true);
                if (name == 'endDate') {
                    modelValue = moment(vm.endDate);
                    if (!newValue.isValid()) {
                        //inputCtrl.value = modelValue.format(dateFormat);
                        resetCustomDate();
                    } else if (inputCtrl.value != modelValue.format(dateFormat)) {
                        vm.endDate = newValue.toDate();
                        customDateChange();
                    }
                } else if (name == 'startDate') {
                    modelValue = moment(vm.startDate);
                    if (!newValue.isValid()) {
                        //inputCtrl.value = modelValue.format(dateFormat);
                        resetCustomDate();
                    } else if (inputCtrl.value != modelValue.format(dateFormat)) {
                        vm.startDate = newValue.toDate();
                        customDateChange();
                    }
                }
            }
        }
        vm.onBlur = onBlur;

        function isLessThanAbsoluteMinDate(dateValue) {
            return financialChartBusiness.minimumChartDate > dateValue;
        }

        function setMinCalendarDate() {
            vm.minStartDate = new Date(vm.endDate);
            vm.minStartDate.setFullYear(vm.endDate.getFullYear() - 10);
            if (isLessThanAbsoluteMinDate(vm.minStartDate)) {
                var minDate = financialChartBusiness.minimumChartDate;
                vm.minStartDate.setFullYear(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
            }
            vm.minEndDate = new Date(vm.startDate);
        }
    }

    /** @ngInject */
    function msFinancialChartToolBarDirective() {
        return {
            restrict: 'E',
            scope: {
                chartId: "=",
                filterState: "=",
                onFilterStateUpdate: "=",
                onTitleUpdate: "="
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