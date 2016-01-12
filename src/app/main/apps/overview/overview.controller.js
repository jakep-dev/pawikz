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
                                navConfig, logger)
    {
        $rootScope.projectId = $stateParams.projectId;
        $rootScope.title = 'Overview';
        $rootScope.isBottomSheet = true;
        bottomSheetConfig.url = 'app/main/apps/overview/sheet/overview-sheet.html';
        bottomSheetConfig.controller = $scope;

        var vm = this;
        vm.isExpanded = true;
        vm.isOverviewLoaded = false;
        vm.isTabletMode = false;
        vm.isStepTabletMode = false;
        vm.isAllSelected = false;
        vm.templateOverview = [];

        vm.flipView = flipView;
        vm.expandCollapseToggle = expandCollapseToggle;
        vm.flipStepView = flipStepView;
        vm.flipSelectionView = flipSelectionView;
        vm.saveAll = saveAll;
        vm.reload = loadData;
        vm.goTop = goTop;
        var promise = [];

        //Data
        loadData();

        //Go to top
        function goTop()
        {

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
                    console.log(vm.templateOverview);

                    navConfig.sideNavItems.splice(0, _.size(navConfig.sideNavItems));

                    angular.forEach(vm.templateOverview.steps, function(step)
                    {
                        navConfig.sideNavItems.push({
                            stepName: step.stepName
                        });
                    });

                    autoSave();

                }
                logger.simpleToast('AutoSave Enabled');
                vm.isOverviewLoaded = true;
            });
        }


        //Auto save the data change based on timeout set
        function autoSave()
        {
            $scope.$watch('vm.templateOverview',function()
                {
                    console.log('Watching .... Data changed');
                    console.log(_.size(promise));

                    if(_.size(promise) === 0)
                    {
                        console.log('Creating Promise');
                        promise = $interval(function()
                        {
                            saveAll();
                        }, clientConfig.appSettings.autoSaveTimeOut);
                    }
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
            console.log('Saving....');
            var userId = $rootScope.passedUserId;
            var projectId = $rootScope.projectId;
            var projectName = vm.templateOverview.projectName;
            var steps = [];


            if(angular.isDefined(vm.templateOverview.steps))
            {
                _.each(vm.templateOverview.steps, function(step)
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

            console.log(steps);
            console.log(projectName);

            overviewService.save(userId, projectId, projectName, steps).then(function(data)
            {
                console.log('Inside saveOverview');
                console.log(data);
                logger.simpleToast('Saved successfully');
            });

            cancelPromise();
        }

        //Flip the entire view to tab and vice-versa
        function flipView()
        {
            console.log('Flipping - ' + vm.isTabletMode);
            vm.isTabletMode = !vm.isTabletMode;
            flipStepView();
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
        function expandCollapseToggle()
        {
            vm.isExpanded = !vm.isExpanded;
        }

    }

})();
