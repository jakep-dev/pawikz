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
            commonBusiness.userId = userDetails.userId;
        }

        console.log('--Steps Input - ', projectId, ' - ', stepId);

        initialize();

        function defineBottomSheet(steps)
        {
            $scope.saveAll = saveAll;
            $scope.goTop = goTop;
            $scope.previousStep = previousStep;
            $scope.nextStep = nextStep;
            $scope.isPrevDisabled = stepsBusiness.isPreviousStep(stepId, overviewBusiness.templateOverview.steps);
            $scope.isNextDisabled = stepsBusiness.isNextStep(stepId, overviewBusiness.templateOverview.steps);
            commonBusiness.defineBottomSheet('app/main/apps/steps/sheet/steps-sheet.html', $scope, true);
        }

        function saveAll()
        {
            templateBusiness.save();
        }

        //Go to top
        function goTop()
        {
            commonBusiness.goTop('template');
        }

        //Get Schema
        function getSchemaAndData()
        {
            stepsBusiness.get(projectId, stepId).then(function(response)
            {
                toast.simpleToast('AutoSave Enabled');
                console.log('Defer Response Data ---');
                console.log(response);
                if(response)
                {
                    angular.forEach(response, function(data)
                    {
                       if(data.list)
                       {
                           templateBusiness.mnemonics = data.list;
                       }
                        else if(data.templateOverview) {
                           overviewBusiness.templateOverview = data.templateOverview;
                           commonBusiness.companyId = data.templateOverview.companyId;
                           commonBusiness.companyName = data.templateOverview.companyName;
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

                           defineBottomSheet();
                       }
                       else {
                           vm.TearSheetStep = data;
                       }
                    });
                }
            });
        }

        function initialize()
        {
            getSchemaAndData();
        }

        //Move to the previous step
        function previousStep() {

            console.log('Previous Step - ');
            console.log(overviewBusiness.templateOverview);

            if(overviewBusiness.templateOverview &&
                overviewBusiness.templateOverview.steps)
            {
                stepsBusiness.getPrevStep(stepId, overviewBusiness.templateOverview.steps);
            }
        }

        //Move to the next step
        function nextStep() {
            //if (parseInt(stepId) < navConfig.sideNavItems.length) {
            //    var stateConfig = {
            //        projectId: $rootScope.projectId,
            //        stepId: (parseInt(stepId) + 1),
            //        stepName: navConfig.sideNavItems[parseInt(stepId)].stepName
            //    };
            //    $state.go('app.steps', stateConfig);
            //}

            console.log('Previous Step - ');
            console.log(overviewBusiness.templateOverview);

            if(overviewBusiness.templateOverview &&
                overviewBusiness.templateOverview.steps)
            {
                stepsBusiness.getNextStep(stepId, overviewBusiness.templateOverview.steps);
            }
        }
    }

})();
