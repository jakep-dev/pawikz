(function ()
{
    'use strict';

    angular
        .module('app.core')
        .directive('msLazyLoading', msLazyLoadingDirective);

    /** @ngInject */
    function msLazyLoadingDirective()
    {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var visibleHeight = element.height();
                var threshold = 100;

                element.scroll(function() {
                    var scrollableHeight = element.prop('scrollHeight');
                    var hiddenContentHeight = scrollableHeight - visibleHeight;

                    if (hiddenContentHeight - element.scrollTop() <= threshold) {
                        // Scroll is almost at the bottom. Loading more rows
                        scope.$apply(attrs.msLazyLoading);
                    }
                });
            }
        };
    }
})();