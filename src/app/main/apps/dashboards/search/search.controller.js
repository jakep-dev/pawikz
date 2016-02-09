(function ()
{
    'use strict';

    angular
        .module('app.dashboard')
        .controller('DashboardSearchController', DashboardSearchController);

    /** @ngInject */
    function DashboardSearchController($scope, $mdSidenav, dashboardService,
                                       dashboardBusiness, commonBusiness)
    {
        var vm = this;
        vm.companyNames = [{ id: 0,  name: 'All', shortName:'All' }];
        vm.users = [{ id: 0,  name: 'All' }];
        vm.isSearching = false;
        vm.companyId = 0;
        vm.userId = 0;

        vm.filterDashboard = filterDashboard;
        vm.loadCompanyNames = loadCompanyNames;
        vm.loadUserNames = loadUserNames;
        vm.searchClear = searchClear;
        vm.toggleSidenav = toggleSidenav;


        commonBusiness.onMsg('ClearFilterDashboard', $scope, function() {
            dashboardBusiness.searchCompanyId = 0;
            dashboardBusiness.searchUserId = 0;
            vm.companyId = 0;
            vm.userId = 0;
        });


        //Filter Dashboard
        function filterDashboard() {
            toggleSidenav('quick-panel');
            dashboardBusiness.searchCompanyId = vm.companyId;
            dashboardBusiness.searchUserId = vm.userId;
            dashboardBusiness.isFilterDasboard = true;
        }

        //Toggle Sidenav
        function toggleSidenav(sidenavId) {
            $mdSidenav(sidenavId).toggle();
        }

        // Clear search
        function searchClear() {
            vm.companyId = 0;
            vm.userId = 0;
            dashboardBusiness.searchCompanyId = vm.companyId;
            dashboardBusiness.searchUserId = vm.userId;
            dashboardBusiness.isFilterDasboard = false;
        }

        // Load User Names
        function loadUserNames() {
            if (_.size(vm.users) === 1) {
                vm.isSearching = true;
                dashboardService.getUsers(commonBusiness.userId).then(function(data)
                {
                    if(angular.isDefined(data))
                    {
                        var result = data.list;

                        angular.forEach(result, function(row)
                        {
                            vm.users.push(row);
                        });
                    }
                    vm.isSearching = false;
                });
            }
        }

        // Load Company Names
        function loadCompanyNames() {
            if (_.size(vm.companyNames) === 1) {
                vm.isSearching = true;
                dashboardService.getCompanies(commonBusiness.userId).then(function(data)
                {
                    if(angular.isDefined(data))
                    {
                        var result = data.list;

                        angular.forEach(result, function(row)
                        {
                            vm.companyNames.push(row);
                        });
                    }
                    vm.isSearching = false;
                });
            }
        }

    }

})();
