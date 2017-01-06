(function ()
{
    'use strict';

    angular
        .module('app.workup')
        .controller('RenewWorkUpDialogController', RenewWorkUpDialogController)
        .controller('CreateWorkUpDialogController', CreateWorkUpDialogController);
})();

/** @ngInject */
function RenewWorkUpDialogController($rootScope, $timeout, dialog, $location, commonBusiness, navConfig, clientConfig)
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
        if(vm.counter === clientConfig.activity.renewWorkupTimeout)
        {
            $timeout.cancel(mytimeout);
            vm.isLongProcess = true;
        }
    }
}



/** @ngInject */
function CreateWorkUpDialogController($rootScope, $timeout, dialog, $location, commonBusiness, navConfig, clientConfig)
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
        dialog.close();
    }

    function onTimeout() {
        vm.counter++;
        mytimeout = $timeout(vm.onTimeout,1000);
        if(vm.counter === clientConfig.activity.createWorkupTimeout)
        {
            $timeout.cancel(mytimeout);
            vm.isLongProcess = true;
        }
    }
}
