(function ()
{
    'use strict';

    angular
        .module('app.steps')
        .controller('StepController', StepController);



    /** @ngInject */
    function StepController($rootScope, $stateParams, templateService, overviewService, navConfig,
                            templateBusiness, breadcrumbBusiness, commonBusiness, toast, store)
    {
        var vm = this;
        var projectId = $stateParams.projectId;
        var stepId = $stateParams.stepId;
        var stepName = $stateParams.stepName;

        commonBusiness.stepId = stepId;
        commonBusiness.projectId = projectId;
        $rootScope.projectId = $stateParams.projectId;

        vm.TearSheetStep = null;

        breadcrumbBusiness.title = stepName;

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
            templateService.getSchemaAndData(projectId, stepId).then(function(response)
            {
                toast.simpleToast('AutoSave Enabled');
                console.log('Defer Response Data ---');
                console.log(response);
                if(angular.isDefined(response))
                {
                    angular.forEach(response, function(data)
                    {
                       if(angular.isDefined(data.list))
                       {
                           templateBusiness.mnemonics = data.list;
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
            getStepDetails();
        }

        function getStepDetails()
        {
            if(navConfig.sideNavItems && navConfig.sideNavItems.length === 0)
            {
                console.log('Getting Step Details');
                overviewService.get($stateParams.projectId).then(function(data)
                {
                    if(angular.isDefined(data.templateOverview))
                    {
                        commonBusiness.companyId = data.templateOverview.companyId;
                        commonBusiness.companyName = data.templateOverview.companyName;
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

        }
    }

})();
