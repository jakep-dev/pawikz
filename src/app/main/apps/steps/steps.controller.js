(function ()
{
    'use strict';

    angular
        .module('app.steps')
        .controller('StepController', StepController);



    /** @ngInject */
    function StepController($rootScope, $stateParams, $scope,
                            toast, store,
                            bottomSheetConfig, commonBusiness, breadcrumbBusiness, navConfig, templateBusiness, templateBusinessSave, stepsBusiness, overviewBusiness
                           )
    {
        var vm = this;
        var projectId = $stateParams.projectId;
        var stepId = $stateParams.stepId;
        var stepName = $stateParams.stepName;
        vm.stepId = stepId;
        $scope.stepId = stepId;
        $rootScope.isBottomSheet = true;
        bottomSheetConfig.url = 'app/main/apps/steps/sheet/steps-sheet.html';
        bottomSheetConfig.controller = $scope;

        vm.refreshstep = refreshStep;

        $scope.saveAll = saveAll;
        $scope.goTop = goTop;
        $scope.previousStep = previousStep;
        $scope.nextStep = nextStep;

        stepsBusiness.stepId = stepId;
        commonBusiness.stepId = stepId;
        commonBusiness.projectId = projectId;
        commonBusiness.stepName = stepName;
        $rootScope.projectId = $stateParams.projectId;

        function defineMenuActions(){
            commonBusiness.emitWithArgument("inject-main-menu", {
                menuName: 'Step ' + stepId + ' : ' + unescape(stepName),
                menuIcon: 'icon-menu',
                menuMode: 'Steps',
                companyId: commonBusiness.companyId,
                companyName: commonBusiness.companyName,
                workupName: commonBusiness.projectName
            });
             commonBusiness.emitWithArgument("project-step-set-selection", defineIsPrintableAll()); 
        }

        function defineIsPrintableAll() { 
            var isSelectAll = true; 
            if(overviewBusiness.templateOverview &&  
                overviewBusiness.templateOverview.steps &&  
                overviewBusiness.templateOverview.steps.length > 0) { 
                     
                var step = _.find(overviewBusiness.templateOverview.steps, {stepId: parseInt(stepId)} ); 
                _.each(step.sections, function(section){ 
                    if(section.value === false) { 
                        isSelectAll = false; 
                        return false; 
                    } 
                }); 
            } 
 
            commonBusiness.isPrintableAll = isSelectAll; 
            return isSelectAll; 
        }


        vm.TearSheetStep = null;

        var userDetails = store.get('user-info');

        if(userDetails)
        {
            $rootScope.passedUserId = userDetails.userId;
            commonBusiness.userId = userDetails.userId;
        }
        initialize();

        function defineBottomSheet(steps)
        {
            $scope.saveAll = saveAll;
            $scope.goTop = goTop;
            $scope.previousStep = previousStep;
            $scope.nextStep = nextStep;
            $scope.loadMore = loadMoreComponents;
            commonBusiness.isPrevDisabled = stepsBusiness.isPreviousStep(stepId, overviewBusiness.templateOverview.steps);
            commonBusiness.isNextDisabled = stepsBusiness.isNextStep(stepId, overviewBusiness.templateOverview.steps);
            commonBusiness.defineBottomSheet('app/main/apps/steps/sheet/steps-sheet.html', $scope, true);
        }

        function saveAll()
        {
            commonBusiness.emitMsg('saveAllChart');
            templateBusinessSave.save();
        }

        //Go to top
        function goTop()
        {
            commonBusiness.goTop('template');
        }

        function refreshStep()
        {
            initialize();
        }

        //Get Schema
        function getSchemaAndData()
        {
            stepsBusiness.get(projectId, stepId, commonBusiness.userId, (overviewBusiness.templateOverview === null)).then(function(response)
            {
                if(response)
                {
                    _.each(response, function(data)
                    {
                       if(data.list)    
                       {
                           templateBusiness.mnemonics = data.list;
                       }
                        else if(data.templateOverview) {
                           overviewBusiness.templateOverview = data.templateOverview;
                           overviewBusiness.templateOverview.isChanged = false;
                           commonBusiness.companyId = data.templateOverview.companyId;
                           commonBusiness.companyName = data.templateOverview.companyName;
                           commonBusiness.projectName = data.templateOverview.projectName;
                           navConfig.sideNavItems.splice(0, _.size(navConfig.sideNavItems));
                           _.each(data.templateOverview.steps, function(step)
                           {
                               navConfig.sideNavItems.push({
                                   stepName: step.stepName,
                                   stepId: step.stepId,
                                   projectId: $stateParams.projectId
                               });
                           });

                        //    defineMenuActions();

                       }
                       else if(data.header) {
                           vm.TearSheetStep = data;
                       }
                    });
                    defineMenuActions();
                    defineBottomSheet();
                }
            });
        }

        function initialize()
        {
            getSchemaAndData();
        }

        //Move to the previous step
        function previousStep() {
            if(overviewBusiness.templateOverview &&
                overviewBusiness.templateOverview.steps)
            {
                stepsBusiness.getPrevStep(stepId, overviewBusiness.templateOverview.steps);
            }
        }

        //Move to the next step
        function nextStep() {
            if(overviewBusiness.templateOverview &&
                overviewBusiness.templateOverview.steps)
            {
                stepsBusiness.getNextStep(stepId, overviewBusiness.templateOverview.steps);
            }
        }

        function loadMoreComponents()
        {
            commonBusiness.emitMsg('step-load-more');
        }
    }

})();
