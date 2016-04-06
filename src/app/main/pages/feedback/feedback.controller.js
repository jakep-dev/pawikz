/**
 * Created by sdharmarajan on 11/4/2015.
 */

(function ()
{
  'use strict';

  angular
    .module('app.pages.feedback')
    .controller('FeedbackController', FeedbackController);

  /** @ngInject */
  function FeedbackController($rootScope)
  {

    $rootScope.title = 'Feedback';
    var vm = this;


    vm.showReportBug = showReportBug;
    vm.showAddNewIdea = showAddNewIdea;

    ///Methods
    function showReportBug()
    {

    }

    function showAddNewIdea()
    {

    }

  }

})();
