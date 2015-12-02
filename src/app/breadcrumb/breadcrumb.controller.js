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
  function BreadcrumbController($rootScope)
  {
    var vm = this;
    //vm.path = $rootScope.title;
  }

})();
