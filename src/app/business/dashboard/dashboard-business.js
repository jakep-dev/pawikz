/**
 * Created by sherindharmarajan on 1/4/16.
 */
(function() {
    'use strict';

    angular
        .module('app.business')
        .service('dashboardBusiness', dashboardBusiness);

    /* @ngInject */
    function dashboardBusiness(commonBusiness) {
        this.searchCompanyId = 0;
        this.searchUserId = 0;

        var isFilterDasboard = false;
        var isClearDashboard = false;

        Object.defineProperty(this, 'isFilterDasboard', {
            enumerable: true,
            configurable: false,
            get: function() {
                return isFilterDasboard;
            },
            set: function(value) {
                isFilterDasboard = value;
                commonBusiness.emitMsg('FilterDashboard');
            }
        });

        Object.defineProperty(this, 'isClearDashboard', {
            enumerable: true,
            configurable: false,
            get: function() {
                return isFilterDasboard;
            },
            set: function(value) {
                isFilterDasboard = value;
                commonBusiness.emitMsg('ClearFilterDashboard');
            }
        });
    }
})();
