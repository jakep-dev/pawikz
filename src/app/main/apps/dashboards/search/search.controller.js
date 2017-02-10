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
        $scope.isTooltipVisible = false;

        vm.filterDashboard = filterDashboard;
        vm.loadCompanyNames = loadCompanyNames;
        vm.loadUserNames = loadUserNames;
        vm.searchClear = searchClear;
        vm.toggleSidenav = toggleSidenav;


        commonBusiness.onMsg('ClearFilter', $scope, function(ev, data) {
            console.log('Clear Filter');
            console.log(data);
            if(data && data.type){
                switch (data.type){
                    case 'All':
                        vm.companyId = 0;
                        vm.userId = 0;
                        break;

                    case 'Company':
                        vm.companyId = 0;
                        break;

                    case 'User':
                        vm.userId = 0;
                        break;
                }
            }
        });


        //Filter Dashboard
        function filterDashboard() {
            toggleSidenav('quick-panel');
            var companyName = getCompanyName(vm.companyId);
            var userName = getUserName(vm.userId);

            commonBusiness.emitWithArgument('FilterMyWorkUp',{
                companyId: vm.companyId,
                userId: vm.userId,
                userName: userName,
                companyName: companyName
            });
        }

        //Get company Name details
        function getCompanyName(companyId){
            var selectedCompany = _.find(vm.companyNames, function(company){
                if(parseInt(company.id) === parseInt(companyId)){
                    return company;
                }
            });

            if(!selectedCompany){
                return null;
            }

            return selectedCompany.name;
        }

        //Get UserName
        function getUserName(userId){
            var selectedUser = _.find(vm.users, function(user){
                if(parseInt(user.id) === parseInt(userId)){
                    return user;
                }
            });



            if(!selectedUser){
                return null;
            }

            return selectedUser.name;
        }

        //Toggle Sidenav
        function toggleSidenav(sidenavId) {
            $mdSidenav(sidenavId).toggle();
        }

        // Clear search
        function searchClear() {
            vm.companyId = 0;
            vm.userId = 0;
            toggleSidenav('quick-panel');
            commonBusiness.emitWithArgument('FilterMyWorkUp',{
                companyId: 0,
                userId: 0
            });
        }

        // Load User Names
        function loadUserNames() {
            if (_.size(vm.users) === 1) {
                vm.isSearching = true;
                dashboardService.getUsers(commonBusiness.userId).then(function(data)
                {
                    if(data)
                    {
                        var result = data.list;
                        _.each(result, function(row)
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
                    if(data)
                    {
                        var result = data.list;
                        _.each(result, function(row)
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
