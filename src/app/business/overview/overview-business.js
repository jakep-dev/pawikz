/**
 * Created by sherindharmarajan on 1/19/16.
 */
(function() {
    'use strict';

    angular
        .module('app.overview.business', [])
        .factory('overviewBusiness', overviewBusiness);

    /* @ngInject */
    function overviewBusiness(overviewService, commonBusiness,
                              clientConfig,toast, $state, $interval) {

        var business = {
            templateOverview: null,
            autoSavePromise: [],
            save: save,
            get: get,
            getReadyForAutoSave: getReadyForAutoSave,
            updateTemplateOverview: updateTemplateOverview,
            cancelPromise: cancelPromise,
            goToProjectHistory: goToProjectHistory
        };

        return business;

        //Navigates to project history details
        function goToProjectHistory(projectId, userId){
            $state.go('app.project-history', {projectId: projectId, userId: userId});
        }

        function updateTemplateOverview(sectionId, value)
        {
            if(business.templateOverview)
            {
                var specificStep = _.find(business.templateOverview.steps, function(step) {
                    if (parseInt(step.stepId) === parseInt(commonBusiness.stepId)) {
                        return step;
                    }
                });

                if(specificStep)
                {
                    var specificSection = _.find(specificStep.sections, function(section)
                    {
                        if(section.itemId === sectionId)
                        {
                            return section;
                        }
                    });

                    if(specificSection)
                    {
                        specificSection.value = value;
                    }
                }
            }
        }

        function cancelPromise()
        {
            $interval.cancel(business.autoSavePromise);
            business.autoSavePromise = [];
        }


        function getReadyForAutoSave()
        {
            if(_.size(business.autoSavePromise) === 0)
            {
                business.autoSavePromise = $interval(function()
                {
                    save();
                    cancelPromise();
                }, clientConfig.appSettings.autoSaveTimeOut);
            }
        }

        function get(projectId)
        {

        }

        function save()
        {
            var userId = commonBusiness.userId;
            var projectId = commonBusiness.projectId;
            var projectName = '';
            var steps = null;

            if(business.templateOverview &&
                business.templateOverview.steps &&
                business.templateOverview.isChanged)
            {
                projectName = business.templateOverview.projectName;
                steps = [];
                _.each(business.templateOverview.steps, function(step)
                {
                    var stepId = step.stepId;
                    var stepName = step.stepName;
                    var sections = [];
                    if(step.sections)
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

            if(steps && _.size(steps) > 0)
            {
                overviewService.save(userId, projectId, projectName, steps)
                               .then(function(data)
                {

                });
            }
        }

        //Cancel the auto-save promise.
        function cancelPromise()
        {
            $interval.cancel(business.autoSavePromise);
            business.autoSavePromise = [];
        }
    }
})();
