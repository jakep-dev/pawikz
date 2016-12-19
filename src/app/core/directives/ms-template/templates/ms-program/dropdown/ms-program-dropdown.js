(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('MsProgramDropdownController', MsProgramDropdownController)
        .directive('msProgramDropdown', msProgramDropdownDirective);

    /** @ngInject */
    function MsProgramDropdownController($scope, templateBusiness, templateBusinessSave, clientConfig)
    {
        $scope.$watch(
            "tearsheetobj.selectedValue",
            function handleAutoSave(newValue, oldValue) {
                if(newValue !== oldValue)
                {
                    $scope.compute({
                        value: newValue,
                        rowId: $scope.rowid
                    });
                    templateBusinessSave.getReadyForAutoSave($scope.itemid, $scope.mnemonicid, newValue, clientConfig.uiType.general);
                    templateBusiness.updateMnemonicValue($scope.itemid, $scope.mnemonicid, newValue);
                }
            }
        );


    }

    /** @ngInject */
    function msProgramDropdownDirective()
    {
        return {
            restrict: 'E',
            scope   : {
                itemid: '@',
                mnemonicid: '@',
                tearsheet: '@',
                compute: '&',
                rowid: '@',
            },
            controller: 'MsProgramDropdownController',
            templateUrl: 'app/core/directives/ms-template/templates/ms-program/dropdown/ms-program-dropdown.html',
            compile: function(el, attrs)
            {
                return function($scope)
                {
                    $scope.$watch(
                        "tearsheet",
                        function handleAutoSave(newValue, oldValue) {
                            if(newValue !== oldValue)
                            {
                                $scope.tearsheetobj = angular.fromJson($scope.tearsheet);
                            }
                        }
                    );

                    $scope.tearsheetobj = angular.fromJson($scope.tearsheet);
                };
            }
        };
    }

})();