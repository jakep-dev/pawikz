/**
 * Created by sherindharmarajan on 1/19/16.
 */
(function() {
    'use strict';

    angular
        .module('app.project-history.business', [])
        .factory('projectHistoryBusiness', projectHistoryBusiness);

    /* @ngInject */
    function projectHistoryBusiness($q, DTColumnBuilder, DTOptionsBuilder, overviewService, projectHistoryService) {
        var business = {
            get: get,
            getDtOptions: getDataTableOptions,
            getDtColumns: getDataTableColumns,
            getDefaultData: getDefaultData
        };
        return business;

        //Get overview and project history details
        //isAll = true will get all details
        //isAll = false will get only project history details
        function get(projectId, userId, rowStart, rowEnd, stepId, fieldName,
                     modifiedBy, modifiedDate, action, isAll){
            var projectHistoryDetails = null;
            if(isAll){
                projectHistoryDetails = $q.all([overviewService.getOverviewDefer(projectId, userId).promise,
                    projectHistoryService.getProjectHistoryDefer(projectId, userId, rowStart, rowEnd, stepId, fieldName, modifiedBy, modifiedDate, action).promise]);
            }
            else{
                projectHistoryDetails = $q.all([projectHistoryService.getProjectHistoryDefer(projectId, userId, rowStart, rowEnd, stepId, fieldName, modifiedBy, modifiedDate, action).promise]);
            }
            return projectHistoryDetails;
        }


        //Get data-table options
        function getDataTableOptions(){
            return DTOptionsBuilder
                .newOptions()
                .withDataProp('data')
                .withOption('processing', true)
                .withOption('paging', true)
                .withOption('autoWidth', true)
                .withOption('responsive', true)
                .withOption('order',[7, 'desc'])
                .withPaginationType('full')
                .withDOM('<"top padding-10" <"left"<"length"l>><"right"f>>rt<"top padding-10"<"left"<"info text-bold"i>><"right"<"pagination"p>>>');
        }

        //Get data-table columns
        function getDataTableColumns(){
            return [
                DTColumnBuilder.newColumn('logId', 'Log Id'),
                DTColumnBuilder.newColumn('stepName', 'Step'),
                DTColumnBuilder.newColumn('fieldName', 'Field Name'),
                DTColumnBuilder.newColumn('oldValue', 'Old Value'),
                DTColumnBuilder.newColumn('newValue', 'New Value'),
                DTColumnBuilder.newColumn('workupUsed', 'Work-up Used'),
                DTColumnBuilder.newColumn('modifiedBy', 'Modified By'),
                DTColumnBuilder.newColumn('modifiedDate', 'Modified Date')
            ];
        }

        //Get Default Data table details
        function getDefaultData(){
            return {
                logId: '',
                step: '',
                fieldName: '',
                oldValue: '',
                newValue: '',
                workupUsed: '',
                modifiedBy: '',
                modifiedDate: ''
            };
        }
    }
})();
