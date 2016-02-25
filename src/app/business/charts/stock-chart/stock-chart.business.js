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
        var interval = '1W';

        var isChartsEvents = false;

        Object.defineProperty(this, 'splits', {
            enumerable: true,
            configurable: false,
            get: function() {
                console.log('get!');
                return splits;
            },
            set: function(value) {
                console.log('set split value!' + value);
                splits = value;
                commonBusiness.emitMsg('chartsEvents');
            }
        });

        Object.defineProperty(this, 'earnings', {
            enumerable: true,
            configurable: false,
            get: function() {
                console.log('get!');
                return earnings;
            },
            set: function(value) {
                console.log('set earnings value!' + value);
                earnings = value;
                commonBusiness.emitMsg('chartsEvents');
            }
        });

        Object.defineProperty(this, 'dividends', {
            enumerable: true,
            configurable: false,
            get: function() {
                console.log('get!');
                return dividends;
            },
            set: function(value) {
                console.log('set dividends value!' + value);
                dividends = value;
                commonBusiness.emitMsg('chartsEvents');
            }
        });

        Object.defineProperty(this, 'interval', {
            enumerable: true,
            configurable: false,
            get: function() {
                console.log('get!');
                return interval;
            },
            set: function(value) {
                console.log('set interval value!' + value);
                interval = value;
                commonBusiness.emitMsg('chartsEvents');
            }
        });




    }

})();
