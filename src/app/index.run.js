(function ()
{
    'use strict';

    angular
        .module('advisen')
        .run(runBlock);

    /** @ngInject */
    function runBlock($rootScope, $timeout, commonBusiness)
    {


        $rootScope.$on('$stateChangeStart', function ()
        {
            commonBusiness.resetBottomSheet();
        });

        //$rootScope.$on('$stateChangeSuccess', function ()
        //{
        //    $timeout(function ()
        //    {
        //        $rootScope.loadingSearchProgress = false;
        //    });
        //});
    }
})();
