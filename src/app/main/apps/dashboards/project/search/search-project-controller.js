/**
 * Created by sdharmarajan on 11/5/2015.
 */
(function ()
{
  'use strict';

  angular
    .module('app.dashboard-project')
    .controller('DashboardSearchProjectController', DashboardSearchProjectController);

  /** @ngInject */
  function DashboardSearchProjectController($rootScope, $mdSidenav, dataservice)
  {
    var vm = this;
    vm.loadingSearchProgress = false;
    vm.companyId = 0;
    vm.userId = 0;

    vm.companyNames = [{ id: 0,  name: 'All' }];
    vm.users = [{ id: 0,  name: 'All' }];

    // Methods
    vm.toggleSidenav = toggleSidenav;
    vm.filterDashboard = filterDashboard;
    vm.searchClear = searchClear;
    vm.loadCompanyNames = loadCompanyNames;
    vm.loadUserNames = loadUserNames;

    // Load User Names
    function loadUserNames() {
      if (_.size(vm.users) === 1) {
        vm.loadingSearchProgress = true;
        dataservice.getDashboardUsers().then(function(data)
        {
          var result = data.list;

          angular.forEach(result, function(row)
          {
            vm.users.push(row);
          });

          vm.loadingSearchProgress = false;
        });
      }
    }

    // Load Company Names
    function loadCompanyNames() {
      if (_.size(vm.companyNames) === 1) {
        vm.loadingSearchProgress = true;
        dataservice.getDashboardCompanies().then(function(data)
        {
          var result = data.list;

          angular.forEach(result, function(row)
          {
            vm.companyNames.push(row);
          });
          vm.loadingSearchProgress = false;
        });
      }
    }

    function toggleSidenav(sidenavId) {
      $mdSidenav(sidenavId).toggle();
    }

    function filterDashboard() {
      vm.loadingSearchProgress = true;
      $rootScope.templateDetails = [];
      dataservice.getDashboard(25357, vm.userId, vm.companyId, 1, 10).then(function(data)
      {

        angular.forEach(data.projects, function(row)
        {
          $rootScope.templateDetails.push(row);
        });

        vm.loadingSearchProgress = false;
      });
    }

    // Clear search
    function searchClear() {
      vm.companyId = 0;
      vm.userId = 0;
      vm.loadingSearchProgress = true;
      $rootScope.templateDetails = [];
      dataservice.getDashboard(25357, 25357, 1000637, 1, 10).then(function(data)
      {

        angular.forEach(data.projects, function(row)
        {
          $rootScope.templateDetails.push(row);
        });

        vm.loadingSearchProgress = false;
      });
    }
  }

})();
