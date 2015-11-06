(function ()
{
    'use strict';

    angular
        .module('app.dashboard-project')
        .controller('DashboardProjectController', DashboardProjectController);

    /** @ngInject */
    function DashboardProjectController($rootScope, $mdSidenav, DTColumnDefBuilder, DashboardData)
    {

        var vm = this;
        $rootScope.templateDetails = [];
        vm.templateDetails = DashboardData.templateDetails;

        angular.forEach(vm.templateDetails, function(row)
        {
          $rootScope.templateDetails.push(row);
        });

        //Dashboard DataTable Configuration
        vm.dtOptions = {
          dom       : '<"top"f>rt<"bottom"<"left"<"length"l>><"right"<"info"i><"pagination"p>>>',
          pagingType: 'simple',
          autoWidth : false,
          responsive: true
        };


        vm.dtColumnDefs = [
          DTColumnDefBuilder.newColumnDef(3).notSortable()
        ];

        // Methods
        vm.toggleSidenav = toggleSidenav;

        function toggleSidenav(sidenavId) {
          $mdSidenav(sidenavId).toggle();
        }
    }

})();
