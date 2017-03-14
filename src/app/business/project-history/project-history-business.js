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
        function get(projectId, userId, rowStart, rowEnd, isAll){
            var projectHistoryDetails = null;
            if(isAll){
                projectHistoryDetails = $q.all([overviewService.getOverviewDefer(projectId, userId).promise,
                    projectHistoryService.getProjectHistoryDefer(projectId, userId, rowStart, rowEnd).promise]);
            }
            else{
                projectHistoryDetails = $q.all([projectHistoryService.getProjectHistoryDefer(projectId, userId, rowStart, rowEnd).promise]);
            }
            return projectHistoryDetails;
        }


        //Get data-table options
        function getDataTableOptions(callBackServerData){
            return DTOptionsBuilder
                .newOptions()
                .withFnServerData(callBackServerData)
                .withDataProp('data')
                .withOption('processing', true)
                .withOption('serverSide', true)
                .withOption('paging', true)
                .withOption('autoWidth', true)
                .withOption('responsive', true)
                .withOption('stateSave', true)
                .withOption('order',[4, 'desc'])
                .withPaginationType('full')
                .withDOM('<"top padding-10" <"left"<"length"l>><"right"f>>rt<"top padding-10"<"left"<"info text-bold"i>><"right"<"pagination"p>>>');
        }

        //Get data-table columns
        function getDataTableColumns(){
            return [
                DTColumnBuilder.newColumn('logId', 'Log Id'),
                DTColumnBuilder.newColumn('step', 'Step'),
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
