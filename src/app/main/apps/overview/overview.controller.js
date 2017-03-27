/**
 * Created by sherindharmarajan on 11/19/15.
 */
(function ()
{
    'use strict';

    angular
        .module('app.overview')
        .controller('OverviewController', OverviewController);



    /** @ngInject */
    function OverviewController($rootScope, $stateParams, $scope,
                                $mdMenu, overviewService, workupService,
                                navConfig, breadcrumbBusiness, workupBusiness, commonBusiness, notificationBusiness,
                                overviewBusiness, templateBusiness, store, toast)
    {
        var isCompleteLoadRequired = (commonBusiness.projectId !== $stateParams.projectId);
        commonBusiness.projectId = $stateParams.projectId;
            $rootScope.projectId = $stateParams.projectId;
        breadcrumbBusiness.title = 'Overview';

        defineMenuActions();

        var userDetails = store.get('user-info');

        if(userDetails)
        {
            $rootScope.passedUserId = userDetails.userId;
            commonBusiness.userId = userDetails.userId;
        }

        var undoData = [];
        var redoData = [];

        var vm = this;
        vm.isExpanded = false;
        commonBusiness.isStepExpandAll = vm.isExpanded;
        vm.expandClass = 'expand';
        vm.isOverviewLoaded = false;
        vm.isTabletMode = false;
        vm.isStepTabletMode = false;
        vm.isAllExpanded = false;
        vm.isAllSelected = false;
        vm.templateOverview = [];
		vm.projectId = $stateParams.projectId;
        vm.isUndo = false;
        vm.isRedo = false;

        //Methods
        vm.toggleExpand = toggleExpand;
        vm.flipStepView = flipStepView;
        vm.flipSelectionView = flipSelectionView;
        vm.reload = loadData;
        vm.undo = undo;
        vm.redo = redo;
        vm.saveAll = saveAll;
        vm.showOverviewDetails =showOverviewDetails;
        vm.pdfDownload = pdfDownload;
        vm.renew = renew;
        vm.projectHistory = projectHistory;

        //Data
        loadData();

        function projectHistory(){

        }

        function pdfDownload() {
           templateBusiness.requestPdfDownload();
        }

        function defineMenuActions(){
            commonBusiness.emitWithArgument("inject-main-menu", {
                menuName: 'Work-up Overview',
                menuIcon: 'icon-view-agenda',
                menuMode: 'ProjectOverview'
            });


            commonBusiness.onMsg("project-overview-save-all", $scope, function(){
                saveAll();
            });

            commonBusiness.onMsg("project-overview-flip", $scope, function(){
                    flipStepView();
            });

            commonBusiness.onMsg("project-overview-toggle-expand", $scope, function(){
                    toggleExpand();
            });

            commonBusiness.onMsg("project-overview-flip-selection", $scope, function(){
                    flipSelectionView();
            });

            commonBusiness.onMsg("pdf-download", $scope, function(){
                    pdfDownload();
            });

            commonBusiness.onMsg("project-renew", $scope, function(){
                renew(vm.projectId);
            });

            commonBusiness.onMsg("project-history", $scope, function(){
                goToProjectHistory(vm.projectId, commonBusiness.userId);
            });
        }

        function goToProjectHistory(projectId, userId){
            overviewBusiness.goToProjectHistory(projectId, userId);
        }

        function showOverviewDetails(step) {

        }

        //Renew workup
        function renew(projectId)
        {
            notificationBusiness.initializeMessages($scope);
            workupBusiness.renew(commonBusiness.userId, parseInt(projectId), commonBusiness.projectName, 'reload-overview');
        }

        //Go to top
        function goTop()
        {
            commonBusiness.goTop('overview');
        }

        //Undo overview data
        function undo()
        {
           if(undoData)
           {
               var templateData = _.last(undoData);
               vm.templateOverview = templateData;
               undoData.splice(_.size(undoData),1);

           }
        }

        //Redo overview data
        function redo()
        {
            if(redoData)
            {
                var templateData = _.first(redoData);
                vm.templateOverview = templateData;
                redoData.splice(0,1);
            }
        }

        //Load data for project-section and step-section
        function loadData()
        {
            if(overviewBusiness.templateOverview !== null && !isCompleteLoadRequired){
                vm.templateOverview = overviewBusiness.templateOverview;
                vm.isOverviewLoaded = true;
                return;
            }

            overviewService.get($stateParams.projectId, $rootScope.passedUserId, commonBusiness.prevProjectId).then(function(data)
            {
                if(data.templateOverview)
                {
                    vm.templateOverview = data.templateOverview;
                    commonBusiness.companyId = vm.templateOverview.companyId;
                    commonBusiness.projectName = vm.templateOverview.projectName;
                    commonBusiness.companyName = vm.templateOverview.companyName;
                    navConfig.sideNavItems.splice(0, _.size(navConfig.sideNavItems));

                    overviewBusiness.templateOverview = vm.templateOverview;
                    overviewBusiness.templateOverview.isChanged = false;

                    _.each(vm.templateOverview.steps, function(step)
                    {
                        navConfig.sideNavItems.push({
                            stepName: step.stepName,
                            stepId: step.stepId,
                            projectId: $stateParams.projectId
                        });
                        step.isExpanded = true;
                    });

                    autoSave();

                    commonBusiness.prevProjectId = commonBusiness.projectId;
                }
                else {
                    navConfig.sideNavItems.splice(0, _.size(navConfig.sideNavItems));
                    toast.simpleToast('There are no overview details available');
                }

            });
        }


        //Auto save the data change based on timeout set
        function autoSave()
        {
            $scope.$watch('vm.templateOverview',function()
                {
                    if(vm.isOverviewLoaded)
                    {
                        overviewBusiness.templateOverview = vm.templateOverview;
                        overviewBusiness.templateOverview.isChanged = true;
                        overviewBusiness.getReadyForAutoSave();
                    }
                    vm.isOverviewLoaded = true;
                },
                true);
        }

        //Save all the changes to database
        function saveAll()
        {
            overviewBusiness.save();
            $mdMenu.hide();
            overviewBusiness.cancelPromise();
        }

        //Flip only the step view to tab and vice-versa
        function flipStepView()
        {
            vm.isStepTabletMode = !vm.isStepTabletMode;
            $mdMenu.hide()
        }

        //Flip the select/unselect functionlity.
        function flipSelectionView()
        {
            vm.isAllSelected = !vm.isAllSelected;
			commonBusiness.isPrintableAll = vm.isAllSelected;
            selectionProcess(vm.isAllSelected);
            $mdMenu.hide()
        }

        function expandAll()
        {
            vm.isAllExpanded = !vm.isAllExpanded;
        }

        //Select the steps
        function selectionProcess(value)
        {
            if(angular.isDefined(vm.templateOverview)) {

                angular.forEach(vm.templateOverview.steps, function(step)
                {
                    if(_.size(step.sections) !== 0)
                    {
                        step.value = value;
                    }

                    angular.forEach(step.sections, function(section)
                    {
                        section.value = value;
                    });
                });
            }
        }

        //Expand/Collapse the steps
        function toggleExpand()
        {
            vm.isExpanded = !vm.isExpanded;
            commonBusiness.isStepExpandAll = vm.isExpanded;
            $mdMenu.hide()
        }

    }

})();
