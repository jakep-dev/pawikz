(function () {
    'use strict';

    angular.module('app.core')
    .directive('closeTooltips', [function () {
        return {
            restrict: 'A',
            link: function (scope, element, attibutes) {
                element.bind('click', function () {
                    var obj = angular.element(document).find("md-tooltip");
                    if (Array.isArray(obj)) {
                        Array.forEach(function (o) {
                            o.hide();
                        });
                    } else {
                        obj.hide();
                    }
                })
            }
        }
    }]);
})();