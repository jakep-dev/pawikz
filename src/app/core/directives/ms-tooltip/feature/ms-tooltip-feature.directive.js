(function () {
    'use strict';

    angular.module('app.core')
    .directive('closeTooltips', [function () {
        return {
            restrict: 'A',
            link: function (scope, element, attibutes) {
                element.bind('click', function () {
                    scope.isTooltipVisible = false;
                });
            }
        }
    }]);
})();