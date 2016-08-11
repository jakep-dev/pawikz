/**
 * Created by sherindharmarajan on 1/4/16.
 */
(function() {
    'use strict';

    angular
        .module('app.business')
        .service('stockChartBusiness', stockChartBusiness);

    /* @ngInject */
    function stockChartBusiness(commonBusiness) {

        var splits = false;
        var earnings = false;
        var dividends = false;
        var interval = '3Y';
        var mainStock = 'TSLA';
        var selectedIndices = [];
        var selectedPeers = [];
        var startDate;
        var endDate;

        Object.defineProperty(this, 'mainStock', {
            enumerable: true,
            configurable: false,
            get: function() {
                return mainStock;
            },
            set: function(mainStock) {
                mainStock = mainStock;
                commonBusiness.emitMsg('chartDataChanged');
            }
        });

        Object.defineProperty(this, 'selectedIndices', {
            enumerable: true,
            configurable: false,
            get: function() {
                return selectedIndices;
            },
            set: function(value) {
                selectedIndices = value;
                commonBusiness.emitMsg('chartDataChanged');
            }
        });

        Object.defineProperty(this, 'selectedPeers', {
            enumerable: true,
            configurable: false,
            get: function() {
                return selectedPeers;
            },
            set: function(value) {
                selectedPeers = value;
                commonBusiness.emitMsg('chartDataChanged');
            }
        });

        Object.defineProperty(this, 'splits', {
            enumerable: true,
            configurable: false,
            get: function() {
                return splits;
            },
            set: function(value) {
                splits = value;
                commonBusiness.emitMsg('chartDataChanged');
            }
        });

        Object.defineProperty(this, 'earnings', {
            enumerable: true,
            configurable: false,
            get: function() {
                return earnings;
            },
            set: function(value) {
                earnings = value;
                commonBusiness.emitMsg('chartDataChanged');
            }
        });

        Object.defineProperty(this, 'dividends', {
            enumerable: true,
            configurable: false,
            get: function() {
                return dividends;
            },
            set: function(value) {
                dividends = value;
                commonBusiness.emitMsg('chartDataChanged');
            }
        });

        Object.defineProperty(this, 'interval', {
            enumerable: true,
            configurable: false,
            get: function() {
                return interval;
            },
            set: function(value) {
                interval = value;
                commonBusiness.emitMsg('chartDataChanged');
            }
        });

        Object.defineProperty(this, 'startDate', {
            enumerable: true,
            configurable: false,
            get: function() {
                return startDate;
            },
            set: function(value) {
                startDate = value;
                if(this.interval ==='CUSTOM'){
                    //commonBusiness.emitMsg('chartDataChanged');
                }
            }
        });
        Object.defineProperty(this, 'endDate', {
            enumerable: true,
            configurable: false,
            get: function() {
                return endDate;
            },
            set: function(value) {
                endDate = value;
                if(this.interval ==='CUSTOM'){
                    //commonBusiness.emitMsg('chartDataChanged');
                }
            }
        });
    }

})();
