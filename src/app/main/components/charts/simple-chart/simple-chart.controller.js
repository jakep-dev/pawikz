/**
 * Created by sherindharmarajan on 12/16/15.
 */
(function ()
{
    'use strict';

    angular
        .module('app.components.charts.simple-chart')
        .controller('SimpleChartController', SimpleChartController);

    function SimpleChartController($rootScope, templateService)
    {
        var vm = this;
        $rootScope.title = 'Simple Chart';


        // Data
        templateService.getSchema(100162482, 1).then(function(response)
        {
           console.log('----Schema Structure UI----');
           console.log(response);
        });



        templateService.getData(100162482, 1).then(function(response)
        {
            console.log('----Schema Data Structure UI----');
            console.log(response);
        });

        // Methods

        //////////

    }

})();