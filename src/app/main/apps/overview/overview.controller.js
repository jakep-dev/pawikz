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
                                $mdMenu, overviewService,
                                navConfig, breadcrumbBusiness, workupBusiness, commonBusiness,
                                overviewBusiness, templateBusiness, store, toast)
    {
        commonBusiness.projectId = $stateParams.projectId;
            $rootScope.projectId = $stateParams.projectId;
        breadcrumbBusiness.title = 'Overview';


        defineBottomSheet();

        var userDetails = store.get('user-info');

        if(userDetails)
        {
            $rootScope.passedUserId = userDetails.userId;
            commonBusiness.userId = userDetails.userId;
        }

        var undoData = [];
        var redoData = [];

        var vm = this;
        vm.isExpanded = true;
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

        //Data
        loadData();

        function pdfDownload() {
           templateBusiness.requestPdfDownload();
        }

        function defineBottomSheet()
        {
            $scope.saveAll = saveAll;
            $scope.goTop = goTop;
            commonBusiness.defineBottomSheet('app/main/apps/overview/sheet/overview-sheet.html', $scope, true);
        }

        function showOverviewDetails(step)
        {

        }

        //Renew workup
        function renew(projectId)
        {
            templateBusiness.initializeMessages($scope);
            workupBusiness.renew(commonBusiness.userId, projectId, commonBusiness.projectName, 'reload-overview');
            commonBusiness.onMsg('reload-overview', $scope, function(ev, data)
            {
               templateBusiness.updateNotification(parseInt(data.old_project_id), 'complete', 'Renewal',
                   parseInt(data.projectId), data.project_name);
            });
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
            overviewService.get($stateParams.projectId, $rootScope.passedUserId).then(function(data)
            {
                if(data.templateOverview)
                {
                    toast.simpleToast('AutoSave Enabled');
                    vm.templateOverview = data.templateOverview;
                    commonBusiness.companyId = vm.templateOverview.companyId;
                    commonBusiness.projectName = vm.templateOverview.projectName;
                    commonBusiness.companyName = vm.templateOverview.companyName + " (" + vm.templateOverview.ticker + ")" ;
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
