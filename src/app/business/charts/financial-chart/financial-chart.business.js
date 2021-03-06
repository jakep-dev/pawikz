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
        var updateChartIdCallback = null;

        //Absolute minimum date for which we have data for charts
        var minimumChartDate = new Date(1996, 0, 1, 0, 0, 0, 0);

        //Each item has
        //label
        //value
        //shortName
        var peerIndustries = [];
        //Peer/Industry Mapping
        //value --> shortName
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
                chartSettings: new Array(),
                attachments: new Array()
            };
            if (data) {
                if (data.ifChartSettings && data.ifChartSettings.length > 0) {
                    var chartSetting;
                    data.ifChartSettings.forEach(function (chartData) {
                        chartSetting = new Object();
                        chartSetting.chartTitle = chartData.chart_title;
                        chartSetting.compareNames = chartData.compare_name;
                        chartSetting.shortNames = chartData.short_name;
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
                if (data.attachments && data.attachments.length > 0) {
                    var imageChartSetting;
                    data.attachments.forEach(function (chartData) {
                        imageChartSetting = new Object();
                        imageChartSetting.chartTitle = chartData.chartTitle;
                        imageChartSetting.url = chartData.url;
                        imageChartSetting.projectImageCode = chartData.projectImageCode;
                        result.attachments.push(imageChartSetting);
                    });
                }
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
        
        function getFinancialDataInputObject(compareNames, shortNames, compareIds, companyId, singleMultiple, ratioSelect, timePeriod, isCustomDate, startDate, endDate) {
            var inputObject = new Object();
            inputObject.compare_name = compareNames;
            inputObject.compare_id = compareIds;
            inputObject.short_name = shortNames;
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

        function getSaveFinancialChartInputObject(projectId, stepId, companyId, mnemonicId, itemId, value) {
            /** INPUT
            {
                projectId: projectId,
                stepId: stepId,
                companyId: companyId,
                mnemonicId: mnemonicId,
                itemId: itemId,
                value: {
                    projectImageCodes
                    newCharts
                }
            }
            */
            /** OUTPUT
                data: {
                    project_id: projectId,
                    step_id: stepId,
                    mnemonic: mnemonic,
                    item_id: itemId,
                    company_id: companyId,
                    projectImageCodes: projectImageCodes,
                    ifChartSettings: newCharts
                }
            */
            var saveObject = new Object;
            var startDate;
            var endDate;

            saveObject.project_id = projectId;
            saveObject.step_id = stepId;
            saveObject.mnemonic = mnemonicId;
            saveObject.item_id = itemId;
            saveObject.company_id = companyId;
            saveObject.projectImageCode = value.projectImageCodes;
            saveObject.ifChartSettings = [];
            if (value.newCharts && value.newCharts.length > 0) {
                value.newCharts.forEach(function (item) {
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
                        short_name: item.filterState.shortNames,
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

        function getSaveChartInputObject(mnemonicItem) {
            var saveObject = new Object;
            var startDate;
            var endDate;

            saveObject.project_id = mnemonicItem.projectId;
            saveObject.step_id = mnemonicItem.stepId;
            saveObject.mnemonic = mnemonicItem.mnemonicId;
            saveObject.item_id = mnemonicItem.itemId;
            saveObject.company_id = mnemonicItem.companyId;
            saveObject.projectImageCode = mnemonicItem.value.projectImageCodes;
            saveObject.ifChartSettings = [];
            if (mnemonicItem.value.newCharts && mnemonicItem.value.newCharts.length > 0) {
                mnemonicItem.value.newCharts.forEach(function (item) {
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
                        short_name: item.filterState.shortNames,
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
            getSaveFinancialChartInputObject: getSaveFinancialChartInputObject,

            convertFinancialChartSettings: convertFinancialChartSettings,
            toDateString: toDateString
        };

        Object.defineProperty(business, 'minimumChartDate', {
            enumerable: true,
            configurable: false,
            get: function () {
                return minimumChartDate;
            }
        });

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
                            peerIndustryMap[peerIndustryItem.value] = peerIndustryItem.shortName;
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

        Object.defineProperty(business, 'updateChartIdCallback', {
            enumerable: true,
            configurable: false,
            get: function () {
                return updateChartIdCallback;
            },
            set: function (value) {
                updateChartIdCallback = value;
            }
        });

        return business;
    }

})();
