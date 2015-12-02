(function ()
{
    'use strict';

    angular
        .module('app.dashboard-project')
        .controller('DashboardProjectController', DashboardProjectController);



    /** @ngInject */
    function DashboardProjectController($rootScope, $mdSidenav, $stateParams, DTColumnDefBuilder, dataservice)
    {
        $rootScope.title = 'Dashboard';

        var vm = this;

        vm.dashboardLoading = false;

        $rootScope.templateDetails = [];

        //Dashboard DataTable Configuration
        vm.dtOptions = {
          dom       : '<"top"f>rt<"bottom"<"left"<"length"l>><"right"<"info"i><"pagination"p>>>',
          pagingType: 'simple_numbers',
          autoWidth : false,
          responsive: true
        };

        //25357



        vm.dtColumnDefs = [
          DTColumnDefBuilder.newColumnDef(3).notSortable()
        ];

        // Methods
        vm.toggleSidenav = toggleSidenav;

        function toggleSidenav(sidenavId) {
          $mdSidenav(sidenavId).toggle();
        }


        dataservice.getDashboard($stateParams.userId, 0, 0, 1, 10).then(function(data)
        {

            angular.forEach(data.projects, function(row)
            {
                $rootScope.templateDetails.push(row);
            });

            vm.dashboardLoading = true;
        });
    }

})();
