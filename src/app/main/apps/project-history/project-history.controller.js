/**
 * Created by sherindharmarajan on 11/19/15.
 */
(function ()
{
    'use strict';

    angular
        .module('app.project-history')
        .controller('ProjectHistoryController', ProjectHistoryController);

    /** @ngInject */
    function ProjectHistoryController($scope, $stateParams, $rootScope, $timeout, store, $mdSidenav, navConfig, commonBusiness, overviewBusiness, projectHistoryBusiness)
    {
        var vm = this;
        var projectId = $stateParams.projectId;
        var userDetails = store.get('user-info');
        vm.historyList = [];
        vm.completeHistoryData = [];
        vm.templateOverview = overviewBusiness.templateOverview;
        vm.searches = [];
        vm.filterStepId = null;
        vm.filterFieldName = null;
        vm.filterModifiedBy = null;
        vm.filterModifiedDate = null;
        vm.filterAction = null;
        vm.isProcessing = false;
        vm.isInitiallyLoaded = false;
        vm.dtOptions = null;
        vm.dtColumnDefs = null;
        vm.dtInstanceCallback = {};

        vm.toggleSidenav = toggleSidenav;
        vm.removeFilter = removeFilter;

        if(userDetails) {
            $rootScope.passedUserId = userDetails.userId;
            commonBusiness.userId = userDetails.userId;
        }

        function defineMainMenu(){
            commonBusiness.emitWithArgument("inject-main-menu", {
                menuName: 'Work-up History',
                menuIcon: 'icon-history',
                menuMode: 'ProjectHistory'
            });
        }

        function dataTableConfiguration(){
            vm.dtOptions = projectHistoryBusiness.getDtOptions();
            vm.dtColumnDefs = projectHistoryBusiness.getDtColumns();
        }

        function indexList(){
            _.each(vm.historyList, function(row, index) {
                row.index = index;
            });
        }

        //Get server call project history details
        function getProjectHistory()
        {
            vm.historyList = [];
            vm.completeHistoryData = [];
            projectHistoryBusiness.get(projectId, commonBusiness.userId, 0, 20000, vm.filterStepId,
                vm.filterFieldName, vm.filterModifiedBy, vm.filterModifiedDate, vm.filterAction,
                (overviewBusiness.templateOverview === null)).then(function(response){
                if(response){
                    _.each(response, function(data){
                        if(data.historyList){
                            vm.completeHistoryData = data.historyList;
                            vm.historyList.push.apply(vm.historyList, data.historyList);
                            indexList();
                        }
                        else if(data.templateOverview){
                            vm.templateOverview = data.templateOverview;
                            overviewBusiness.templateOverview = data.templateOverview;
                            overviewBusiness.templateOverview.isChanged = false;
                            commonBusiness.companyId = data.templateOverview.companyId;
                            commonBusiness.companyName = data.templateOverview.companyName;
                            commonBusiness.projectName = data.templateOverview.projectName;
                            navConfig.sideNavItems.splice(0, _.size(navConfig.sideNavItems));
                            _.each(data.templateOverview.steps, function(step) {
                                navConfig.sideNavItems.push({
                                    stepName: step.stepName,
                                    stepId: step.stepId,
                                    projectId: $stateParams.projectId
                                });
                            });
                        }
                    });
                    vm.isInitiallyLoaded = true;
                }
            });
        }

        //Define Events
        function defineEvents(){
            commonBusiness.onMsg('filter-project-history', $scope, filterProjectHistory);
            commonBusiness.onMsg('clear-project-history', $scope, clearProjectHistory);
            commonBusiness.onMsg('project-history-download-csv', $scope, downloadToCsv);
        }

        //Download project history to Csv file
        function downloadToCsv(){
            var table = vm.dtInstanceCallback.DataTable;
            var headers = ["Log Id", "Step", "Field Name", "Old Value", "New Value", "Work-up Used", "Modified By", "Modified Date", "Action"];
            var rows = [];
            
            var searchValue = (table && table.context[0] && 
                                    table.context[0].oPreviousSearch && 
                                    table.context[0].oPreviousSearch.sSearch)?
                                        table.context[0].oPreviousSearch.sSearch : '';

            if(searchValue.length > 0 ) {
                var filteredData = table.rows( { filter : 'applied'} ).data();
                var searchedIndices = [];
                
                _.each(filteredData, function(row){
                    searchedIndices.push(parseInt(row[0]));
                });
                
                _.each(vm.historyList, function(history){
                    if(_.includes(searchedIndices, history.index)) {
                        rows.push(getRowDownload(history));
                    }
                });
            } else {
                _.each(vm.historyList, function(history){                    
                    rows.push(getRowDownload(history));
                });
            }
            
            var linkElem = $('#project-history-download');
            var fileName = 'ProjectHistory_' + commonBusiness.projectName.trim() + '.csv';

            commonBusiness.explicitDownloadToCsv(headers, rows, linkElem, fileName);
        }

        function getRowDownload(history) {
            var historyRow = [];
            historyRow.push(history.logId);
            historyRow.push(history.stepName);
            historyRow.push(history.fieldName);
            historyRow.push(history.oldValue);
            historyRow.push(history.newValue);
            historyRow.push(history.workupUsed);
            historyRow.push(history.modifiedBy);
            historyRow.push(history.modifiedDate);
            historyRow.push(history.action);

            return historyRow;
        }
        //Filter Project History based on
        //StepId, FieldName, ModifiedBy, ModifiedDate and Action
        function filterProjectHistory(ev, data){
            if(data) {
                vm.filterStepId = null;
                vm.filterFieldName = null;
                vm.filterModifiedBy = null;
                vm.filterModifiedDate = null;
                vm.filterAction = null;
                vm.searches = [];
                if(data.stepId){
                    vm.searches.push("Step Name: " + data.stepId);
                    vm.filterStepId = data.stepId;
                }

                if(data.fieldName){
                    vm.searches.push("Field Name: " + data.fieldName);
                    vm.filterFieldName = data.fieldName;
                }

                if(data.modifiedBy){
                    vm.searches.push("Modified By: " + data.modifiedBy);
                    vm.filterModifiedBy = data.modifiedBy;
                }

                if(data.modifiedDate){
                    vm.searches.push("Modified Date: " + data.modifiedDate);
                    vm.filterModifiedDate = data.modifiedDate;
                }

                if(data.action){
                    vm.searches.push("Action: " + data.action);
                    vm.filterAction = data.action;
                }

                console.log('DataTable Filter');
                redrawDataTable();
            }
        }

        //Clear project history details and reload data
        function clearProjectHistory(ev, data){
            vm.filterStepId = null;
            vm.filterFieldName = null;
            vm.filterModifiedBy = null;
            vm.filterModifiedDate = null;
            vm.filterAction = null;
            vm.searches = [];
            redrawDataTable();
        }

        //Toggle Sidenav
        function toggleSidenav(sidenavId) {
            $mdSidenav(sidenavId).toggle();
        }

        //Re-draw data table
        function redrawDataTable()
        {
            vm.isProcessing = true;

            vm.historyList = _.filter(vm.completeHistoryData, function(history){
                if((vm.filterAction === null || history.action === vm.filterAction) &&
                   (vm.filterModifiedBy === null || history.modifiedBy === vm.filterModifiedBy) &&
                   (vm.filterModifiedDate === null || history.modifiedDate === vm.filterModifiedDate) &&
                   (vm.filterStepId === null || history.stepName === vm.filterStepId) &&
                   (vm.filterFieldName === null || history.fieldName === vm.filterFieldName) ){
                    return history;
                }
            });

            $timeout(function(){
                vm.isProcessing = false;
            }, 300);
        }

        //Remove filter based on user selection
        function removeFilter(actionType){
            var types;
            var combinedStr;
            if(vm.searches.length === 0 || actionType === 'All'){
                $rootScope.$emit('remove-project-filter', { type: ['All'] });
                clearProjectHistory(null, null);
                getProjectHistory();

            }
            else {
                combinedStr = '';
                types = [];
                _.each(vm.searches, function(search){
                    combinedStr += search;
                });

               if(!(combinedStr.indexOf('Step Name') > -1)){ //IE doesn't support includes
                    types.push('StepName');
                    vm.filterStepId = null;
                }

                if(!(combinedStr.indexOf('Field Name') > -1)){ //IE doesn't support includes
                    types.push('FieldName');
                    vm.filterFieldName = null;
                }

                if(!(combinedStr.indexOf('Modified By') > -1)){ //IE doesn't support includes
                    types.push('ModifiedBy');
                    vm.filterModifiedBy = null;
                }

                if(!(combinedStr.indexOf('Modified Date') > -1)){ //IE doesn't support includes
                    types.push('ModifiedDate');
                    vm.filterModifiedDate = null;
                }

                if(!(combinedStr.indexOf('Action') > -1)){ //IE doesn't support includes
                    types.push('Action');
                    vm.filterAction = null;
                }

                if(_.size(types) > 0){
                    commonBusiness.emitWithArgument("remove-project-filter", { type: types });
                }

                redrawDataTable();
            }
        }

        dataTableConfiguration();
        defineMainMenu();
        defineEvents();
        getProjectHistory();
    }

})();
