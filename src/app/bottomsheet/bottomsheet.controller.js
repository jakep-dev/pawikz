(function ()
{
    'use strict';

    angular
        .module('app.bottomsheet')
        .controller('BottomsheetController', BottomsheetController);

    /** @ngInject */
    function BottomsheetController($mdBottomSheet, $mdToast, toast, bottomSheetConfig)
    {
        var vm = this;

        vm.showGridBottomSheet = showGridBottomSheet;

        function showGridBottomSheet($event) {
            var sheetPromise = $mdBottomSheet.show({
                templateUrl: bottomSheetConfig.url,
                scope: bottomSheetConfig.controller.$new(),
                targetEvent: $event
            }).then(function(clickedItem) {
                //alert('clicked');
               });
        }
    }

})();
