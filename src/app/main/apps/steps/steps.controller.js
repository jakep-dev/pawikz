(function ()
{
    'use strict';

    angular
        .module('app.steps')
        .controller('StepController', StepController);



    /** @ngInject */
    function StepController($rootScope, $stateParams, templateService)
    {
        var vm = this;
        var projectId = $stateParams.projectId;
        var stepId = $stateParams.stepId;
        var stepName = $stateParams.stepName;
        vm.TearSheetStep = null;
        vm.TearSheetData = null;

        $rootScope.title = stepName;

        console.log('--Steps Input - ', projectId, ' - ', stepId);

        vm.getSchema = getSchema;
        vm.getSchemaData = getSchemaData;

        initialize();

        //Get Schema Data
        function getSchemaData()
        {
            templateService.getData(projectId, stepId).then(function(response)
            {
                if(angular.isUndefined(response.list))
                {
                    vm.TearSheetData = response.list;
                }
            });
        }

        //Get Schema
        function getSchema()
        {
            // Data
            templateService.getSchema(projectId, stepId).then(function(response)
            {
                vm.TearSheetStep = response;
            });
        }

        function initialize()
        {
            getSchema();
           // getSchemaData();
        }

    }

})();
