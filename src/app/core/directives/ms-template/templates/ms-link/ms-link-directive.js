(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('MsLinkController', MsLinkController)
        .directive('msLink', msLinkDirective);

    /** @ngInject */
    function MsLinkController($scope, $window)
    {
        $scope.openInNewTab = openInNewTab;


        function openInNewTab(url) {
            var win = $window.open('http://'.concat(url), '_blank');
            win.focus();
        }
    }

    /** @ngInject */
    function msLinkDirective()
    {
        return {
            restrict: 'E',
            scope   : {
                value: '@',
                href: '@',
                isdisabled: '=?'
            },
            controller: 'MsLinkController',
            templateUrl: 'app/core/directives/ms-template/templates/ms-link/ms-link.html'
        };
    }
})();