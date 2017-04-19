(function ()
{
    'use strict';

    angular
        .module('app.project-history')
        .controller('ProjectHistorySearchController', ProjectHistorySearchController);

    /** @ngInject */
    function ProjectHistorySearchController($scope, $rootScope, $stateParams,
                                            $mdSidenav, commonBusiness, projectHistoryService)
    {
        var vm = this;
        vm.steps = [];
        vm.fieldNames = [];
        vm.modifiedBys = [];
        vm.modifiedDates = [];
        vm.actions = [];
        vm.selectedStep = null;
        vm.selectedFieldName = null;
        vm.selectedModifiedBy = null;
        vm.selectedModifiedDate = null;
        vm.selectedAction = null;
        vm.isSearching = false;
        vm.projectId = $stateParams.projectId;

        vm.toggleSidenav = toggleSidenav;
        vm.searchCtrlLoad = searchCtrlLoad;
        vm.filterProjectHistory = filterProjectHistory;
        vm.clearProjectHistoryFilter = clearProjectHistoryFilter;

        defineEventListeners();

        //Toggle Side Navigation
        function toggleSidenav(sidenavId) {
            $mdSidenav(sidenavId).toggle();
        }

        //Search control load based on filter type
        function searchCtrlLoad(obj, filterType){
            if (_.size(obj) !== 0) {
                return;
            }
            vm.isSearching = true;
            projectHistoryService.getProjectHistoryFilters(vm.projectId, filterType, vm.selectedStep).then(function(data)
            {
                if(data && data.filter) {
                    _.each(data.filter, function(fil){
                       obj.push({
                         id: fil.value,
                         name: fil.label
                       });
                    });
                }
                vm.isSearching = false;
            });
        }

        //Filter project history
        function filterProjectHistory(){
            toggleSidenav('quick-panel');
            commonBusiness.emitWithArgument('filter-project-history',{
                stepId: vm.selectedStep !== 'None' ? vm.selectedStep : null,
                fieldName: vm.selectedFieldName !== 'None' ? vm.selectedFieldName : null,
                modifiedBy: vm.selectedModifiedBy !== 'None' ? vm.selectedModifiedBy : null,
                modifiedDate: vm.selectedModifiedDate !== 'None' ? vm.selectedModifiedDate : null,
                action: vm.selectedAction !== 'None' ? vm.selectedAction : null
            });
        }

        //Clear project history filter
        function clearProjectHistoryFilter(){
            if(vm.selectedStep || vm.selectedFieldName || vm.selectedModifiedBy ||
               vm.selectedModifiedDate || vm.selectedAction){
                vm.selectedStep = null;
                vm.selectedFieldName = null;
                vm.selectedModifiedBy = null;
                vm.selectedModifiedDate = null;
                vm.selectedAction = null;
                commonBusiness.emitMsg('clear-project-history');
            }
        }

        //Define all the event listeners
        function defineEventListeners(){
            $rootScope.$on('remove-project-filter', function (event, data) {
                if(data && data.type) {
                    removeFilter(data.type);
                }
            });
        }

        //Remove filter based on user selection
        function removeFilter(types){
            _.each(types, function(type){
                switch (type){
                    case 'All':
                        vm.selectedStep = null;
                        vm.selectedFieldName = null;
                        vm.selectedModifiedBy = null;
                        vm.selectedModifiedDate = null;
                        vm.selectedAction = null;
                        break;

                    case 'StepName':
                        vm.selectedStep = null;
                        break;

                    case 'FieldName':
                        vm.selectedFieldName = null;
                        break;

                    case 'ModifiedBy':
                        vm.selectedModifiedBy = null;
                        break;

                    case 'ModifiedDate':
                        vm.selectedModifiedDate = null;
                        break;

                    case 'Action':
                        vm.selectedAction = null;
                        break;
                }
            });
        }


    }

})();
