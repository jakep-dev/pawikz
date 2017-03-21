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
    function ProjectHistoryController($scope, $stateParams, $rootScope, store, $mdSidenav, navConfig, commonBusiness, overviewBusiness, projectHistoryBusiness)
    {
        var vm = this;
        var projectId = $stateParams.projectId;
        var userDetails = store.get('user-info');
        vm.historyList = null;
        vm.templateOverview = null;
        vm.searches = [];
        vm.filterStepId = null;
        vm.filterFieldName = null;
        vm.filterModifiedBy = null;
        vm.filterModifiedDate = null;
        vm.filterAction = null;

        vm.toggleSidenav = toggleSidenav;
        vm.removeFilter = removeFilter;

        if(userDetails) {
            $rootScope.passedUserId = userDetails.userId;
            commonBusiness.userId = userDetails.userId;
        }

        function defineMainMenu(){
            commonBusiness.emitWithArgument("inject-main-menu", {
                menuName: 'Project History',
                menuIcon: 'icon-history',
                menuMode: 'ProjectHistory'
            });
        }

        function dataTableConfiguration(){
            vm.dtOptions = projectHistoryBusiness.getDtOptions(getProjectHistory);
            vm.dtColumns = projectHistoryBusiness.getDtColumns();
        }

        //Get server call project history details
        function getProjectHistory(sSource, aoData, fnCallback, oSettings)
        {
            var draw = aoData[0].value;
            var columns = aoData[1].value;
            var sortOrder = aoData[2].value[0].dir;
            var sortFilterIndex = aoData[2].value[0].column;
            var sortFilter = columns[sortFilterIndex].data;
            var start = aoData[3].value;
            var length = aoData[4].value;
            var searchFilter = aoData[5].value.value;

            if(overviewBusiness.templateOverview){
                vm.templateOverview = overviewBusiness.templateOverview;
            }

            console.log('projectId-' + projectId);
            console.log('commonBusiness.userId-' + commonBusiness.userId);
            console.log('start-' + start);
            console.log('length-' + length);
            console.log('filterStepId-' + vm.filterStepId);
            console.log('filterFieldName-' + vm.filterFieldName);
            console.log('filterModifiedBy-' + vm.filterModifiedBy);
            console.log('filterModifiedDate-' + vm.filterModifiedDate);
            console.log('filterAction-' + vm.filterAction);

            projectHistoryBusiness.get(projectId, commonBusiness.userId, start, length, vm.filterStepId,
                                    vm.filterFieldName, vm.filterModifiedBy, vm.filterModifiedDate, vm.filterAction,
                                    (overviewBusiness.templateOverview === null)).then(function(response){
                var records = {
                    draw: draw,
                    recordsTotal: 0,
                    recordsFiltered: 0,
                    data: projectHistoryBusiness.getDefaultData()
                };

                console.log('project history');
                console.log(response);

                if(response){
                    _.each(response, function(data){
                        if(data.historyList){
                            records = {
                                draw: draw,
                                recordsTotal: data.paging.totalResults || 0,
                                recordsFiltered: data.paging.totalResults || 0,
                                data: data.historyList || projectHistoryBusiness.getDefaultData()
                            };
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
                }

                fnCallback(records);
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
            var headers = ["Log Id", "Step", "Field Name", "Old Value", "New Value", "Work-up Used", "Modified By", "Modified Date", "Action"];
            var rows = [];
            var linkElem = $('#project-history-download');
            var fileName = 'ProjectHistory_' + commonBusiness.projectName.trim() + '.csv';

            commonBusiness.explicitDownloadToCsv(headers, rows, linkElem, fileName);
        }

        //Filter Project History based on
        //StepId, FieldName, ModifiedBy, ModifiedDate and Action
        function filterProjectHistory(ev, data){
            if(data) {
                vm.searches = [];
                if(data.stepId){
                    vm.searches.push("StepName: " + data.stepId);
                    vm.filterStepId = data.stepId;
                }

                if(data.fieldName){
                    vm.searches.push("FieldName: " + data.fieldName);
                    vm.filterFieldName = data.fieldName;
                }

                if(data.modifiedBy){
                    vm.searches.push("ModifiedBy: " + data.modifiedBy);
                    vm.filterModifiedBy = data.modifiedBy;
                }

                if(data.modifiedDate){
                    vm.searches.push("ModifiedDate: " + data.modifiedDate);
                    vm.filterModifiedDate = data.modifiedDate;
                }

                if(data.action){
                    vm.searches.push("Action: " + data.action);
                    vm.filterAction = data.action;
                }

                if(_.size(vm.searches) > 0){
                    redrawDataTable();
                }
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

        function redrawDataTable()
        {
            var oTable = $('#projectHistoryDetails').dataTable();
            if(oTable){
                oTable.fnDraw();
            }
        }

        //Remove filter based on user selection
        function removeFilter(actionType){
            var types;
            var combinedStr;
            if(vm.searches.length === 0 || actionType === 'All'){
                $rootScope.$emit('remove-project-filter', { type: ['All'] });
                clearProjectHistory(null, null);
            }
            else {
                combinedStr = '';
                types = [];
                _.each(vm.searches, function(search){
                    combinedStr += search;
                });

                if(!combinedStr.includes('StepName')){
                    types.push('StepName');
                    vm.filterStepId = null;
                }

                if(!combinedStr.includes('FieldName')){
                    types.push('FieldName');
                    vm.filterFieldName = null;
                }

                if(!combinedStr.includes('ModifiedBy')){
                    types.push('ModifiedBy');
                    vm.filterModifiedBy = null;
                }

                if(!combinedStr.includes('ModifiedDate')){
                    types.push('ModifiedDate');
                    vm.filterModifiedDate = null;
                }

                if(!combinedStr.includes('Action')){
                    types.push('Action');
                    vm.filterAction = null;
                }

                if(_.size(types) > 0){
                    commonBusiness.emitWithArgument("remove-project-filter", { type: types });
                }
            }
        }

        dataTableConfiguration();
        defineMainMenu();
        defineEvents();
    }

})();
