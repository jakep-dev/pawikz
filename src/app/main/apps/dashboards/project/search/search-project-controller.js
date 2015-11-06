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
  function DashboardSearchProjectController($rootScope, $mdSidenav)
  {
    var vm = this;

    vm.companyName = 'All';
    vm.userName = 'All';

    vm.companyNames = [{company: 'All'}];
    vm.users = [{ user: 'All' }];

    // Methods
    vm.toggleSidenav = toggleSidenav;
    vm.filterDashboard = filterDashboard;
    vm.searchClear = searchClear;
    vm.loadCompanyNames = loadCompanyNames;
    vm.loadUserNames = loadUserNames;



    // Load User Names
    function loadUserNames() {
      if (_.size(vm.users) === 1) {
        _.each($rootScope.templateDetails, function (row) {

          if (_.where(vm.users, {user: row.createdName}).length === 0) {
            vm.users.push({
              user: row.createdName
            });
          }
        });
      }
    }

    // Load Company Names
    function loadCompanyNames() {
      if (_.size(vm.companyNames) === 1) {
        _.each($rootScope.templateDetails, function (row) {
          if (_.where(vm.companyNames, {company: row.company}).length === 0) {
            vm.companyNames.push({
              company: row.company
            });
          }
        });
      }
    }

    function toggleSidenav(sidenavId) {
      $mdSidenav(sidenavId).toggle();
    }

    function filterDashboard() {

    }

    // Clear search
    function searchClear() {
      vm.companyName = 'All';
      vm.userName = 'All';
    }
  }

})();
