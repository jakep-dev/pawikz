/**
 * Created by sherindharmarajan on 1/4/16.
 */
(function() {
    'use strict';

    angular
        .module('app.chart.financialchart.business', [])
        .service('financialChartBusiness', financialChartBusiness);

    /* @ngInject */
    function financialChartBusiness(commonBusiness) {

        var ratioTypes = [];
        var ratioTypeMap = null;
        var defaultRatio = null;
        var defaultRatioLabel = null;

        var peerIndustries = [];
        var peerIndustryMap = null;

        function getRatioTypeLabel(ratioType) {
            if (ratioTypeMap) {
                return ratioTypeMap[ratioType];
            } else {
                return null;
            }
        }

        function getPeerIndustryLabel(peerIndustryType) {
            if (peerIndustryMap) {
                return peerIndustryMap[peerIndustryType];
            } else {
                return null;
            }
        }

        function convertFinancialChartSettings(data) {
            //console.log(data);
            var result = {
                chartSettings: new Array()
            };
            if (data && data.ifChartSettings && data.ifChartSettings.length > 0) {
                var chartSetting;
                data.ifChartSettings.forEach(function (chartData) {
                    chartSetting = new Object();
                    chartSetting.chartTitle = chartData.chart_title;
                    chartSetting.compareNames = chartData.compare_name;
                    chartSetting.compareIds = chartData.compare_id;
                    chartSetting.chartMode = chartData.single_multi;
                    chartSetting.chartType = chartData.ratioselect;
                    chartSetting.chartPeriod = chartData.time_period;
                    if (chartData.is_custom_date === 'false') {
                        chartSetting.isCustomDate = false;
                    } else if (chartData.is_custom_date === 'true') {
                        chartSetting.isCustomDate = true;
                    } else {
                        chartSetting.isCustomDate = false;
                    }
                    chartSetting.startDate = chartData.startdate;
                    chartSetting.endDate = chartData.enddate;
                    chartSetting.chartId = chartData.chartId;
                    chartSetting.sequence = chartData.sequence;
                    result.chartSettings.unshift(chartSetting);
                });
            }
            return result;
        }

        function getSavedChartSettingsInputObject(projectId, stepId, mnemonicid, itemid) {
            var inputObject = new Object();
            inputObject.project_id = projectId;
            inputObject.step_id = stepId;
            inputObject.mnemonic = mnemonicid;
            inputObject.item_id = itemid;
            return inputObject;
        }

        function isDate(dateVal) {
            var d = new Date(dateVal);
            return d.toString() === 'Invalid Date' ? false : true;
        };

        function toDateString(dateObj, format) {
            if (!format) {
                format = 'MM/DD/YYYY';
            }
            var m = moment(dateObj.toISOString().substring(0, 10), 'YYYY-MM-DD');
            return m.format(format);
        }
        
        function getFinancialDataInputObject(compareNames, compareIds, companyId, singleMultiple, ratioSelect, timePeriod, isCustomDate, startDate, endDate) {
            var inputObject = new Object();
            inputObject.compare_name = compareNames;
            inputObject.compare_id = compareIds;
            inputObject.company_id = companyId;
            inputObject.single_multi = singleMultiple;
            inputObject.ratioselect = ratioSelect;
            inputObject.is_custom_date = isCustomDate;
            inputObject.time_period = timePeriod;
            if (isDate(startDate)) {
                inputObject.startdate = startDate;
            } else {
                inputObject.startdate = startDate;
            }
            if (isDate(endDate)) {
                inputObject.enddate = endDate;
            } else {
                inputObject.enddate = endDate;
            }
            return inputObject;
        }

        function getSaveChartInputObject(mnemonicItem) {
            var saveObject = new Object;
            var startDate;
            var endDate;

            saveObject.project_id = mnemonicItem.projectId;
            saveObject.step_id = mnemonicItem.stepId;
            saveObject.mnemonic = mnemonicItem.mnemonicId;
            saveObject.item_id = mnemonicItem.itemId;
            saveObject.company_id = mnemonicItem.companyId;
            saveObject.ifChartSettings = [];
            if (mnemonicItem.value && mnemonicItem.value.length > 0) {
                mnemonicItem.value.forEach(function (item) {
                    if (item.filterState.isCustomDate === true) {
                        startDate = item.filterState.startDate;
                        endDate = item.filterState.endDate;
                    } else {
                        startDate = '';
                        endDate = '';
                    }
                    saveObject.ifChartSettings.push({
                        chart_title: item.filterState.chartTitle,
                        compare_name: item.filterState.compareNames,
                        compare_id: item.filterState.compareIds,
                        single_multi: item.filterState.chartMode,
                        ratioselect: item.filterState.chartType,
                        time_period: item.filterState.chartPeriod,
                        is_custom_date: item.filterState.isCustomDate,
                        startdate: startDate,
                        enddate: endDate
                    });
                });
            }
            return saveObject;
        }

        var business = {
            getRatioTypeLabel: getRatioTypeLabel,
            getPeerIndustryLabel: getPeerIndustryLabel,
            getSaveChartInputObject: getSaveChartInputObject,
            getFinancialDataInputObject: getFinancialDataInputObject,
            getSavedChartSettingsInputObject: getSavedChartSettingsInputObject,
            convertFinancialChartSettings: convertFinancialChartSettings,
            toDateString: toDateString
        };

        Object.defineProperty(business, 'peerIndustries', {
            enumerable: true,
            configurable: false,
            get: function () {
                return peerIndustries;
            },
            set: function (value) {
                peerIndustries = value;
                peerIndustryMap = [];
                peerIndustries.forEach(function (peerIndustryItem) {
                    if (peerIndustryItem.value) {
                        if (!peerIndustryMap[peerIndustryItem.value]) {
                            peerIndustryMap[peerIndustryItem.value] = peerIndustryItem.label;
                        }
                    }
                });
            }
        });

        Object.defineProperty(business, 'ratioTypes', {
            enumerable: true,
            configurable: false,
            get: function () {
                return ratioTypes;
            },
            set: function (value) {
                ratioTypes = value;
                ratioTypeMap = [];
                defaultRatio = null;
                defaultRatioLabel = null;
                ratioTypes.forEach(function (ratioItem) {
                    if (!defaultRatio && ratioItem.value) {
                        defaultRatio = ratioItem.value;
                        defaultRatioLabel = ratioItem.label;
                    }
                    if (ratioItem.value) {
                        if (!ratioTypeMap[ratioItem.value]) {
                            ratioTypeMap[ratioItem.value] = ratioItem.label;
                        }
                    }
                });
            }
        });

        Object.defineProperty(business, 'defaultRatio', {
            enumerable: true,
            configurable: false,
            get: function () {
                return defaultRatio;
            }
        });

        Object.defineProperty(business, 'defaultRatioLabel', {
            enumerable: true,
            configurable: false,
            get: function () {
                return defaultRatioLabel;
            }
        });

        return business;
    }

})();
