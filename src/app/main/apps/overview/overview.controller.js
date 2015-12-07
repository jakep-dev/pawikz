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
    function OverviewController($rootScope, $stateParams, dataservice)
    {

        $rootScope.title = 'Overview';
        var vm = this;

        dataservice.getOverview($stateParams.projectId).then(function(data)
        {
            if(angular.isDefined(data.templateOverview))
            {
                vm.templateOverview = data.templateOverview;
            }
        });
    }

})();
