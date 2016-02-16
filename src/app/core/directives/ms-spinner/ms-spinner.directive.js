(function ()
{
    'use strict';

    angular
        .module('app.core')
        .directive('msSpinner', msSpinnerDirective);

    /** @ngInject */
    function msSpinnerDirective()
    {
        return {
            restrict: 'E',
            scope   : {
            },
            templateUrl: 'app/core/directives/ms-spinner/ms-spinner.html'
        };
    }

})();