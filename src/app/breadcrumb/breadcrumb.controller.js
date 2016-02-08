/**
 * Created by sdharmarajan on 10/27/2015.
 */
(function ()
{
  'use strict';

  angular
    .module('app.breadcrumb')
    .controller('BreadcrumbController', BreadcrumbController);

  /** @ngInject */
  function BreadcrumbController($rootScope, $scope, commonBusiness, breadcrumbBusiness)
  {
    var vm = this;

    commonBusiness.onMsg('Dashboard', $scope, function() {
       vm.title = breadcrumbBusiness.title;
    });
  }

})();
