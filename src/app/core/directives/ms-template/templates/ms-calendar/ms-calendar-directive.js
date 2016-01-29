(function ()
{
    'use strict';

    angular
        .module('app.core')
        .directive('msCalendar', msCalendarDirective);

    /** @ngInject */
    function msCalendarDirective()
    {
        return {
            restrict: 'E',
            scope   : {
                tearsheet: '='
            },
            templateUrl: 'app/core/directives/ms-template/templates/ms-calendar/ms-calendar.html'
        };
    }

})();