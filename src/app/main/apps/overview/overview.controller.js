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
                                store, toast)
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
        var promise = [];

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
            cancelPromise();
            overviewService.get($stateParams.projectId).then(function(data)
            {
                if(angular.isDefined(data.templateOverview))
                {
                    vm.templateOverview = data.templateOverview;

                    commonBusiness.companyId = vm.templateOverview.companyId;
                    commonBusiness.companyName = vm.templateOverview.companyName + " (" + vm.templateOverview.ticker + ")" ;
                    navConfig.sideNavItems.splice(0, _.size(navConfig.sideNavItems));
                    angular.forEach(vm.templateOverview.steps, function(step)
                    {
                        navConfig.sideNavItems.push({
                            stepName: step.stepName,
                            stepId: step.stepId,
                            projectId: $stateParams.projectId
                        });

                        console.log('NavConfig - ');
                        console.log(navConfig);

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
                    if(_.size(promise) === 0 && vm.isOverviewLoaded)
                    {
                        console.log('Creating Promise');
                        promise = $interval(function()
                        {
                            saveAll();
                        }, clientConfig.appSettings.autoSaveTimeOut);
                    }
                    vm.isOverviewLoaded = true;
                },
                true);
        }

        //Cancel the auto-save promise.
        function cancelPromise()
        {
            $interval.cancel(promise);
            promise = [];
        }

        //Save all the changes to database
        function saveAll()
        {
            var userId = commonBusiness.userId;
            var projectId = commonBusiness.projectId;
            var projectName = vm.templateOverview.projectName;
            var steps = [];


            if(angular.isDefined(vm.templateOverview.steps))
            {
                angular.forEach(vm.templateOverview.steps, function(step)
                {
                    var stepId = step.stepId;
                    var stepName = step.stepName;
                    var sections = [];
                    if(angular.isDefined(step.sections))
                    {
                        _.each(step.sections, function(section)
                        {
                            sections.push({
                                mnemonic: section.mnemonic,
                                itemId: section.itemId,
                                value: section.value
                            });
                        });
                    }

                    steps.push({
                        stepId: stepId,
                        stepName: stepName,
                        sections: sections
                    });
                });
            }

            overviewService.save(userId, projectId, projectName, steps).then(function(data)
            {
                toast.simpleToast('Saved successfully');
            });

            cancelPromise();
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
