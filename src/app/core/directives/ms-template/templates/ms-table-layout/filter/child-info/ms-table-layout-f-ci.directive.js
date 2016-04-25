(function ()
{
    'use strict';

    angular
        .module('app.core')
        .directive('msTablelayoutFCi', msTablelayoutFCiDirective);

    function msTablelayoutFCiDirective()
    {
        return {
            restrict: 'E',
            transclude: true,
            templateUrl: 'app/core/directives/ms-template/templates/ms-table-layout/filter/child-info/ms-table-layout-f-ci.html'
        };
    }



})();