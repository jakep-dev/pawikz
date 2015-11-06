/**
 * Created by sdharmarajan on 11/4/2015.
 */
(function ()
{
  'use strict';

  angular
    .module('app.pages.feedback', [])
    .config(config);

  /** @ngInject */
  function config($stateProvider, $translatePartialLoaderProvider)
  {
    $stateProvider.state('app.pages_feedback', {
      url    : '/pages/feedback',
      views  : {
        'content@app': {
          templateUrl: 'app/main/pages/feedback/feedback.html',
          controller : 'FeedbackController as vm'
        }
      }
    });

    $translatePartialLoaderProvider.addPart('app/main/pages/feedback');

  }

})();
