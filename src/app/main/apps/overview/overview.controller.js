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
    function OverviewController($rootScope, $stateParams, $scope, $interval,
                                overviewService, clientConfig, bottomSheetConfig,
                                navConfig, breadcrumbBusiness, commonBusiness,
                                overviewBusiness, store, toast)
    {
        commonBusiness.projectId = $stateParams.projectId;
        $rootScope.projectId = $stateParams.projectId;
        breadcrumbBusiness.title = 'Overview';
        $rootScope.isBottomSheet = true;
        bottomSheetConfig.url = 'app/main/apps/overview/sheet/overview-sheet.html';
        bottomSheetConfig.controller = $scope;

        var userDetails = store.get('user-info');

        if(userDetails)
        {
            $rootScope.passedUserId = userDetails.userId;
        }

        console.log('RootScope ProjectID' + $rootScope.projectId );

        var undoData = [];
        var redoData = [];

        var vm = this;
        vm.isExpanded = true;
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
        $scope.saveAll = saveAll;
        //vm.saveAll = saveAll;
        vm.reload = loadData;
        $scope.goTop = goTop;
        //vm.goTop = goTop;
        vm.undo = undo;
        vm.redo = redo;
        vm.showOverviewDetails =showOverviewDetails;

        //Data
        loadData();

        function showOverviewDetails(step)
        {
            console.log('Overview Details');
            console.log(step);
        }

        //Go to top
        function goTop()
        {
            console.log(navConfig);
            var objScroll = $('div #overview').parents('[ms-scroll]')[0];
            if (!(objScroll === undefined)) {
                $(objScroll).scrollTop(0);
            }
        }

        //Undo overview data
        function undo()
        {
           if(undoData)
           {
               console.log('-Undo-');
               console.log(undoData);
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
                console.log('-Undo-');
                console.log(redoData);
                var templateData = _.first(redoData);
                vm.templateOverview = templateData;
                redoData.splice(0,1);
            }
        }

        //Load data for project-section and step-section
        function loadData()
        {
            overviewService.get($stateParams.projectId).then(function(data)
            {
                if(data.templateOverview)
                {
                    vm.templateOverview = data.templateOverview;

                    commonBusiness.companyId = vm.templateOverview.companyId;
                    commonBusiness.companyName = vm.templateOverview.companyName + " (" + vm.templateOverview.ticker + ")" ;
                    navConfig.sideNavItems.splice(0, _.size(navConfig.sideNavItems));

                    overviewBusiness.templateOverview = vm.templateOverview;

                    angular.forEach(vm.templateOverview.steps, function(step)
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
                toast.simpleToast('AutoSave Enabled');
            });
        }


        //Auto save the data change based on timeout set
        function autoSave()
        {
            $scope.$watch('vm.templateOverview.steps',function()
                {
                    console.log('Firing Overview watch');
                    if(vm.isOverviewLoaded)
                    {
                        console.log('Inside Firing Overview watch');
                        overviewBusiness.templateOverview = vm.templateOverview;
                        overviewBusiness.getReadyForAutoSave();
                    }
                    vm.isOverviewLoaded = true;
                },
                true);
        }

        //Save all the changes to database
        function saveAll()
        {
            templateBusiness.save();
        }

        //Flip only the step view to tab and vice-versa
        function flipStepView()
        {
            vm.isStepTabletMode = !vm.isStepTabletMode;
        }

        //Flip the select/unselect functionlity.
        function flipSelectionView()
        {
            vm.isAllSelected = !vm.isAllSelected;
            selectionProcess(vm.isAllSelected);
            console.log($scope);
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
            commonBusiness.isStepExpandAll = !commonBusiness.isStepExpandAll;
        }

    }

})();
