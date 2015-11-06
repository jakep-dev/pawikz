/**
 * Created by sdharmarajan on 10/27/2015.
 */
(function ()
{
  'use strict';

  angular
    .module('app.breadcrumb', [])
    .config(config);

  /** @ngInject */
  function config($translatePartialLoaderProvider)
  {
    $translatePartialLoaderProvider.addPart('app/breadcrumb');
  }
})();
