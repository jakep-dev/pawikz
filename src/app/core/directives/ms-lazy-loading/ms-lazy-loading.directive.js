(function ()
{
    'use strict';

    angular
        .module('app.core')
        .directive('msLazyLoading', msLazyLoadingDirective);

    /** @ngInject */
    function msLazyLoadingDirective(commonBusiness, $rootScope)
    {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var raw = element[0];
                element.bind('scroll', function () {
                    if(raw.scrollTop + raw.offsetHeight >= raw.scrollHeight) {
                        console.log('Reached Bottom-');
                        commonBusiness.emitMsg('reached-page-bottom');
                    }
                });
            }
        };
    }
})();