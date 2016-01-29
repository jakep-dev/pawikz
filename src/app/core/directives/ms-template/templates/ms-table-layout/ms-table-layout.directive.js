(function ()
{
    'use strict';

    angular
        .module('app.core')
        //.controller('msTablelayoutController', msTablelayoutController)
        .directive('msTablelayout', msTablelayoutDirective);


    function msTablelayoutController($scope)
    {
        var vm = this;
    }

    /** @ngInject */
    function msTablelayoutDirective($compile)
    {
        return {
            restrict: 'E',
            scope   : {
                tearsheet: '='
            },
            templateUrl: 'app/core/directives/ms-template/templates/ms-table-layout/ms-table-layout.html',
            //controller:'msTablelayoutController',
            link:function(scope, el, attrs)
            {

            }
        };
    }

})();