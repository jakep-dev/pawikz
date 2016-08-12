/**
 * Created by sherindharmarajan on 1/4/16.
 */
(function() {
    'use strict';

    angular
        .module('app.steps.business', [])
        .service('stepsBusiness', stepsBusiness);

    /* @ngInject */
    function stepsBusiness($q, $state, $rootScope, overviewService, templateService) {

        var business =
        {
            stepId: null,
            get: get,
            getNextStep: getNextStep,
            getPrevStep: getPrevStep,
            isPreviousStep: isPreviousStep,
            isNextStep: isNextStep
        };

        return business;

        //Go to previous step
        function getPrevStep(stepId, steps)
        {
            var stepIdInt = parseInt(stepId);

            if(steps)
            {
                var count = -1;
                var currentIndex = -1;
                angular.forEach(steps, function(step)
                {
                    count ++;
                    if(step.stepId === stepIdInt)
                    {
                        currentIndex = count;
                    }
                });

                if(currentIndex !== -1 &&
                    currentIndex !== 0)
                {
                    var prevIndex = currentIndex - 1;
                    var prevStep =  steps[prevIndex];

                    if(prevStep)
                    {
                        var stateConfig = {
                            projectId: $rootScope.projectId,
                            stepId: parseInt(prevStep.stepId),
                            stepName: prevStep.stepName
                        };
                        $state.go('app.steps', stateConfig);
                    }
                }
            }
        }

        //Go to next step
        function getNextStep(stepId, steps)
        {
            var stepIdInt = parseInt(stepId);

            if(steps)
            {
                var totalCount = _.size(steps);
                var count = -1;
                var currentIndex = -1;
                angular.forEach(steps, function(step)
                {
                    count ++;
                    if(step.stepId === stepIdInt)
                    {
                        currentIndex = count;
                    }
                });

                if(totalCount !== (currentIndex + 1))
                {
                    var nextIndex = currentIndex + 1;
                    var nextStep =  steps[nextIndex];

                    if(nextStep)
                    {
                        var stateConfig = {
                            projectId: $rootScope.projectId,
                            stepId: parseInt(nextStep.stepId),
                            stepName: nextStep.stepName
                        };
                        $state.go('app.steps', stateConfig);
                    }
                }
            }
        }

        //Check for step previous button enable/disable
        function isPreviousStep(stepId, steps)
        {
            var isdisabled = false;
            var stepIdInt = parseInt(stepId);

            if(steps)
            {
                var count = -1;
                var currentIndex = -1;
                angular.forEach(steps, function(step)
                {
                    count ++;
                    if(step.stepId === stepIdInt)
                    {
                        currentIndex = count;
                    }
                });

                if(currentIndex === 0)
                {
                    isdisabled = true;
                }
            }

            return isdisabled;
        }

        //Check for next step disable/enable
        function isNextStep(stepId, steps)
        {
            var isdisabled = false;
            var stepIdInt = parseInt(stepId);

            if(steps)
            {
                var totalCount = _.size(steps);
                var count = -1;
                var currentIndex = -1;
                angular.forEach(steps, function(step)
                {
                    count ++;
                    if(step.stepId === stepIdInt)
                    {
                        currentIndex = count;
                    }
                });

                totalCount = (totalCount - 1);

                if(totalCount === currentIndex)
                {
                    isdisabled = true;
                }
            }

            return isdisabled;
        }

        //Get the overview, template schema and template data
        function get(projectId, stepId, userId)
        {
            var all = $q.all([templateService.getSchemaDefer(projectId, stepId).promise,
                templateService.getDataDefer(projectId, stepId).promise,
                overviewService.getOverviewDefer(projectId, userId).promise]);

            return all;
        }
    }
})();
