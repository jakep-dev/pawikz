(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('PdfDownloadDialogController', PdfDownloadDialogController);
})();

/** @ngInject */
function PdfDownloadDialogController($timeout, dialog, clientConfig)
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
        if(vm.counter === clientConfig.activity.pdfDownloadTimeout)
        {
            $timeout.cancel(mytimeout);
            vm.isLongProcess = true;
        }
    }
}
