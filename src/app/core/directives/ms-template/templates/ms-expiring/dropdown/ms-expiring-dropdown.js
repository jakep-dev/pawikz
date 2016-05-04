(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('MsExpiringDropdownController', MsExpiringDropdownController)
        .directive('msExpiringDropdown', msExpiringDropdownDirective);

    /** @ngInject */
    function MsExpiringDropdownController($scope, templateBusiness)
    {
        $scope.$watch(
            "tearsheetobj.selectedValue",
            function handleAutoSave(newValue, oldValue) {
                if(newValue !== oldValue)
                {
                    templateBusiness.getReadyForAutoSave($scope.itemid, $scope.mnemonicid, newValue);
                    templateBusiness.updateMnemonicValue($scope.itemid, $scope.mnemonicid, newValue);
                }
            }
        );


    }

    /** @ngInject */
    function msExpiringDropdownDirective()
    {
        return {
            restrict: 'E',
            scope   : {
                itemid: '@',
                mnemonicid: '@',
                tearsheet: '@'
            },
            controller: 'MsExpiringDropdownController',
            templateUrl: 'app/core/directives/ms-template/templates/ms-expiring/dropdown/ms-expiring-dropdown.html',
            compile: function(el, attrs)
            {
                return function($scope)
                {
                    console.log('DropDown - Compile');
                    console.log($scope);

                    $scope.$watch(
                        "tearsheet",
                        function handleAutoSave(newValue, oldValue) {
                            if(newValue !== oldValue)
                            {
                                $scope.tearsheetobj = angular.fromJson($scope.tearsheet);
                                console.log('Changed');
                                console.log($scope.tearsheetobj);
                            }
                        }
                    );

                    $scope.tearsheetobj = angular.fromJson($scope.tearsheet);
                };
            }
        };
    }

})();