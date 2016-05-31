/**
 * Created by sherindharmarajan on 1/19/16.
 */
(function() {
    'use strict';

    angular
        .module('app.business')
        .factory('overviewBusiness', overviewBusiness);

    /* @ngInject */
    function overviewBusiness(overviewService, commonBusiness,
                              clientConfig, $interval, toast) {

        var business = {
            templateOverview: null,
            autoSavePromise: [],
            save: save,
            get: get,
            getReadyForAutoSave: getReadyForAutoSave,
            updateTemplateOverview: updateTemplateOverview,
            cancelPromise: cancelPromise
        };

        return business;

        function updateTemplateOverview(sectionId, value)
        {
            if(business.templateOverview)
            {
                var specificStep = _.find(business.templateOverview.steps, function(step)
                {
                    if(parseInt(step.stepId) === parseInt(commonBusiness.stepId))
                    {
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

            console.log(business.templateOverview);
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
                console.log('Creating Promise for TemplateOverview');
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
            var projectName = business.templateOverview.projectName;
            var steps = [];

            if(business.templateOverview.steps)
            {
                angular.forEach(business.templateOverview.steps, function(step)
                {
                    var stepId = step.stepId;
                    var stepName = step.stepName;
                    var sections = [];
                    if(step.sections)
                    {
                        angular.forEach(step.sections, function(section)
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

            if(_.size(steps) > 0)
            {
                overviewService.save(userId, projectId, projectName, steps).then(function(data)
                {
                    toast.simpleToast('Saved successfully');
                });
            }
            else {
                toast.simpleToast('No changes to save');
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
