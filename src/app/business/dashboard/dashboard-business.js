/**
 * Created by sherindharmarajan on 1/4/16.
 */
(function() {
    'use strict';

    angular
        .module('app.dashboard.business', [])
        .service('dashboardBusiness', dashboardBusiness);

    /* @ngInject */
    function dashboardBusiness(commonBusiness) {
        this.searchCompanyId = 0;
        this.searchUserId = 0;

        var isFilterDasboard = false;
        var isClearDashboard = false;
        
        var business = {
            getActionButtonsHtml: getActionButtonsHtml,
            getWorkupHtml: getWorkupHtml
        }

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

        //get action buttons html in dashboard
        function getActionButtonsHtml(data, type, full, meta)
        {
            return '<div layout="row" layout-align="center center"> ' +
                    '<div flex> ' +
                        '<md-icon md-font-icon="icon-rotate-3d"  class="renewStyle" projectId="'+ full.projectId +'" projectName="'+ full.projectName +'"> ' +
                            '<md-tooltip md-direction="top">Renew</md-tooltip> ' +
                        '</md-icon> ' +
                    '</div> ' + 
                    '<div flex> ' +
                        '<md-icon md-font-icon="icon-delete" class="deleteWorkupStyle" projectId="'+ full.projectId +'" projectName="'+ full.projectName +'"> ' +
                            '<md-tooltip md-direction="top">Delete</md-tooltip> ' +
                        '</md-icon> ' + 
                    '</div> ' + 
                '</div> ';
        }

        // get workup link html in dashboard
        function getWorkupHtml(data, type, full, meta)
        {
            return '<a class="overviewStyle" overview="true" projectId="'+ full.projectId +'"  href="#">' + data + '</a>';
        }

        return business;
    }
})();
