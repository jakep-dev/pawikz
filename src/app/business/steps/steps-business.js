/**
 * Created by sherindharmarajan on 1/4/16.
 */
(function() {
    'use strict';

    angular
        .module('app.business')
        .service('stepsBusiness', stepsBusiness);

    /* @ngInject */
    function stepsBusiness($q, overviewService, templateService) {

        var business =
        {
            stepId: null,
            get: get
        };

        return business;

        function get(projectId, stepId)
        {
            var all = $q.all([templateService.getSchemaDefer(projectId, stepId).promise,
                templateService.getDataDefer(projectId, stepId).promise,
                overviewService.getOverviewDefer(projectId).promise]);

            return all;
        }
    }
})();
