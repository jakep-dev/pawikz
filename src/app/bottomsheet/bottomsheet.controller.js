(function ()
{
    'use strict';

    angular
        .module('app.bottomsheet')
        .controller('BottomsheetController', BottomsheetController);

    /** @ngInject */
    function BottomsheetController($mdBottomSheet, $mdToast, bottomSheetConfig)
    {
        var vm = this;

        vm.showGridBottomSheet = showGridBottomSheet;

        function showGridBottomSheet($event) {
            var sheetPromise = $mdBottomSheet.show({
                templateUrl: bottomSheetConfig.url,
                scope: bottomSheetConfig.controller.$new(),
                targetEvent: $event
            }).then(function(clickedItem) {
                $mdToast.show(
                    $mdToast.simple()
                        .content(clickedItem['name'] + ' clicked!')
                        .position('top right')
                        .hideDelay(1500)
                )});
        }
    }

})();
