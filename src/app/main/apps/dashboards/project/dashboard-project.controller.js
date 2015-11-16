(function ()
{
    'use strict';

    angular
        .module('app.dashboard-project')
        .controller('DashboardProjectController', DashboardProjectController);



    /** @ngInject */
    function DashboardProjectController($rootScope, $mdSidenav, DTColumnDefBuilder, DashboardData, dataservice)
    {

        var vm = this;

        vm.dashboardLoading = false;

        $rootScope.templateDetails = [];

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


        dataservice.getDashboard(25357, 25357, 1000637, 1, 10).then(function(data)
        {
            //vm.templateDetails = data.projects;

            angular.forEach(data.projects, function(row)
            {
                $rootScope.templateDetails.push(row);
            });

            vm.dashboardLoading = true;
        });
    }

})();
