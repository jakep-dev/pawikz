(function ()
{
    'use strict';

    angular
        .module('fuse')
        .run(runBlock);

    /** @ngInject */
    function runBlock($rootScope, $timeout)
    {


        //$rootScope.$on('$stateChangeStart', function ()
        //{
        //    $rootScope.loadingSearchProgress = true;
        //});
        //
        //$rootScope.$on('$stateChangeSuccess', function ()
        //{
        //    $timeout(function ()
        //    {
        //        $rootScope.loadingSearchProgress = false;
        //    });
        //});
    }
})();
