(function ()
{
    'use strict';

    angular
        .module('app.steps')
        .controller('StepController', StepController);



    /** @ngInject */
    function StepController($rootScope, $stateParams, templateService,
                            templateBusiness, breadcrumbBusiness, commonBusiness, toast)
    {
        var vm = this;
        var projectId = $stateParams.projectId;
        var stepId = $stateParams.stepId;
        var stepName = $stateParams.stepName;

        commonBusiness.stepId = stepId;
        commonBusiness.projectId = projectId;

        vm.TearSheetStep = null;

        breadcrumbBusiness.title = stepName;

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
        }

    }

})();
