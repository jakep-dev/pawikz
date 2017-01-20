(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('MsProgramDropdownController', MsProgramDropdownController)
        .directive('msProgramDropdown', msProgramDropdownDirective);

    /** @ngInject */
    function MsProgramDropdownController($scope)
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
                }
            }
        );


    }

    /** @ngInject */
    function msProgramDropdownDirective(fuseHelper)
    {
        return {
            restrict: 'E',
            scope   : {
                itemid: '@',
                mnemonicid: '@',
                tearsheet: '@',
                compute: '&',
                rowid: '@',
                isIE: '=?'
            },
            controller: 'MsProgramDropdownController',
            templateUrl: 'app/core/directives/ms-template/templates/ms-program/dropdown/ms-program-dropdown.html',
            compile: function(el, attrs)
            {
                return function($scope)
                {
                    $scope.isIE = fuseHelper.isIE();
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