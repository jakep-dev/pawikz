/**
 * Created by sherindharmarajan on 1/19/16.
 */
(function() {
    'use strict';

    angular
        .module('app.business')
        .factory('overviewBusiness', overviewBusiness);

    /* @ngInject */
    function overviewBusiness(overviewService) {

        var business = {
            autoSavePromise: [],
            save: save,
            get: get
        };

        return business;

        function get(projectId)
        {

        }

        function save(userId, projectId, projectName, steps)
        {
            overviewService.save(userId, projectId, projectName, steps).then(function(data)
            {
                console.log(data);
                logger.simpleToast('Saved successfully');
            });
        }

        //Cancel the auto-save promise.
        function cancelPromise()
        {
            $interval.cancel(business.autoSavePromise);
            business.autoSavePromise = [];
        }
    }
})();
