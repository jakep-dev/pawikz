(function ()
{
    'use strict';

    angular
        .module('app.workup')
        .controller('WorkUpDialiogController', WorkUpDialiogController);
})();

/** @ngInject */
function WorkUpDialiogController($rootScope, $timeout, dialog, $location, commonBusiness, navConfig, clientConfig)
{
    var vm = this;
    vm.onTimeout = onTimeout;
    vm.close = close;


    vm.isLongProcess = false;
    vm.counter = 0;
    var mytimeout = null;

    vm.onTimeout();

    function close()
    {
        navConfig.sideNavItems.splice(0, _.size(navConfig.sideNavItems));
        $location.url('/dashboard/'+ commonBusiness.userId );
        dialog.close();
    }

    function onTimeout() {
        vm.counter++;
        mytimeout = $timeout(vm.onTimeout,1000);
        if(vm.counter === clientConfig.activity.dialogtimeout)
        {
            $timeout.cancel(mytimeout);
            vm.isLongProcess = true;
        }
    }
}