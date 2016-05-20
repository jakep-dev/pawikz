(function ()
{
    'use strict';

    angular
        .module('app.steps')
        .controller('StepController', StepController);



    /** @ngInject */
    function StepController($rootScope, $stateParams, $scope, $state, templateService,
                            overviewService, bottomSheetConfig, navConfig,
                            templateBusiness, breadcrumbBusiness, commonBusiness,
                            stepsBusiness, overviewBusiness, toast, store)
    {
        var vm = this;
        var projectId = $stateParams.projectId;
        var stepId = $stateParams.stepId;
        var stepName = $stateParams.stepName;
        $scope.stepId = stepId;
        bottomSheetConfig.url = 'app/main/apps/overview/sheet/overview-sheet.html';
        bottomSheetConfig.controller = $scope;

        $scope.saveAll = saveAll;
        $scope.goTop = goTop;
        $scope.previousStep = previousStep;
        $scope.nextStep = nextStep;

        stepsBusiness.stepId = stepId;
        commonBusiness.stepId = stepId;
        commonBusiness.projectId = projectId;
        $rootScope.projectId = $stateParams.projectId;

        vm.TearSheetStep = null;

        breadcrumbBusiness.title = unescape(stepName);

        var userDetails = store.get('user-info');

        if(userDetails)
        {
            $rootScope.passedUserId = userDetails.userId;
        }

        console.log('--Steps Input - ', projectId, ' - ', stepId);

        initialize();

        //Get Schema
        function getSchemaAndData()
        {
            if (overviewBusiness.templateOverview === null) {
                templateService.getSchemaAndDataAndOverview(projectId, stepId).then(function (response) {
                    processResponses(response);
                }
                );
            }
            else
            {
                templateService.getSchemaAndData(projectId, stepId).then(function (response) {
                    processResponses(response);
                }
                );
            }
        }

        function processResponses(response)
        {
            toast.simpleToast('AutoSave Enabled');
            console.log('Defer Response Data ---');
            console.log(response);
            if (angular.isDefined(response)) {
                angular.forEach(response, function (data) {
                    if (angular.isDefined(data.list)) {
                        templateBusiness.mnemonics = data.list;
                    }
                    else if (angular.isDefined(data.templateOverview)) {
                        if (!angular.isDefined(overviewBusiness.templateOverview) || (overviewBusiness.templateOverview === null)) {
                            overviewBusiness.templateOverview = data.templateOverview;
                        }
                        if (!angular.isDefined(commonBusiness.companyId) || (commonBusiness.companyId === null)) {
                            commonBusiness.companyId = data.templateOverview.companyId;
                        }
                        if (!angular.isDefined(commonBusiness.companyName) || (commonBusiness.companyName === null)) {
                            commonBusiness.companyName = data.templateOverview.companyName + " (" + data.templateOverview.ticker + ")";
                        }
                        if (!angular.isDefined(commonBusiness.projectName) || (commonBusiness.projectName === null)) {
                            commonBusiness.projectName = data.templateOverview.projectName;
                        }

                        if (navConfig.sideNavItems && navConfig.sideNavItems.length === 0) {
                            angular.forEach(data.templateOverview.steps, function (step) {
                                navConfig.sideNavItems.push({
                                    stepName: step.stepName,
                                    stepId: step.stepId,
                                    projectId: $stateParams.projectId
                                });
                            });
                            $scope.lastStepNumber = navConfig.sideNavItems.length;
                        }
                    }
                    else {
                        vm.TearSheetStep = data;
                    }
                });
            }
        }

        function initialize()
        {
            getSchemaAndData();
            //getStepDetails();
        }

        function getStepDetails()
        {
            if(navConfig.sideNavItems && navConfig.sideNavItems.length === 0)
            {
                console.log('Getting Step Details');
                overviewService.get($stateParams.projectId).then(function(data)
                {

                    if(data.templateOverview)
                    {
                        overviewBusiness.templateOverview = data.templateOverview;
                        commonBusiness.companyId = data.templateOverview.companyId;
                        commonBusiness.companyName = data.templateOverview.companyName + " (" + data.templateOverview.ticker + ")";
                        commonBusiness.projectName = data.templateOverview.projectName;
                        navConfig.sideNavItems.splice(0, _.size(navConfig.sideNavItems));
                        angular.forEach(data.templateOverview.steps, function(step)
                        {
                            navConfig.sideNavItems.push({
                                stepName: step.stepName,
                                stepId: step.stepId,
                                projectId: $stateParams.projectId
                            });
                        });
                    }
                });
            }
            $scope.lastStepNumber = navConfig.sideNavItems.length;
        }

        //Go to top
        function goTop() {
            var objScroll = $('div #template').parents('[ms-scroll]')[0];
            if (!(objScroll === undefined)) {
                $(objScroll).scrollTop(0);
            }
        }

        //Save all the changes to database
        function saveAll() {
            templateBusiness.save();
        }

        //Move to the previous step
        function previousStep() {
            if (parseInt(stepId) > 1) {
                var stateConfig = {
                    projectId: $rootScope.projectId,
                    stepId: (parseInt(stepId) - 1),
                    stepName: navConfig.sideNavItems[parseInt(stepId) - 2].stepName
                };
                $state.go('app.steps', stateConfig);
            }
        }

        //Move to the next step
        function nextStep() {
            if (parseInt(stepId) < navConfig.sideNavItems.length) {
                var stateConfig = {
                    projectId: $rootScope.projectId,
                    stepId: (parseInt(stepId) + 1),
                    stepName: navConfig.sideNavItems[parseInt(stepId)].stepName
                };
                $state.go('app.steps', stateConfig);
            }
        }
    }

})();
