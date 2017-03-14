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
    function ProjectHistoryController($stateParams, $rootScope, store, DTOptionsBuilder, navConfig, commonBusiness, overviewBusiness, projectHistoryBusiness)
    {
        var vm = this;
        var projectId = $stateParams.projectId;
        var userDetails = store.get('user-info');
        vm.historyList = null;
        vm.templateOverview = null;

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
            console.log('userId-' + commonBusiness.userId);
            console.log('start-' + start);
            console.log('length-' + length);

            projectHistoryBusiness.get(projectId, commonBusiness.userId, start, length, (overviewBusiness.templateOverview === null)).then(function(response){
                var records = {

                };

                console.log('project history');
                console.log(response);

                if(response){
                    _.each(response, function(data){
                        if(data.historyList){
                            vm.historyList = data.historyList;
                            records = {
                                draw: draw,
                                recordsTotal: 100,
                                recordsFiltered: 0,
                                data: projectHistoryBusiness.getDefaultData()
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

        dataTableConfiguration();
        defineMainMenu();
    }

})();
