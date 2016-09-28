(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('MsDropdownController', MsDropdownController)
        .directive('msDropdown', msDropDownDirective);

    /** @ngInject */
    function MsDropdownController($scope, templateBusiness)
    {
        $scope.$watch(
            "tearsheetobj.selectedValue",
            function handleAutoSave(newValue, oldValue) {
                if(newValue !== oldValue)
                {
                    templateBusiness.getReadyForAutoSave($scope.itemid, $scope.mnemonicid, newValue);
                }
            }
        );
    }

    /** @ngInject */
    function msDropDownDirective()
    {
        return {
            restrict: 'E',
            scope   : {
                itemid: '@',
                mnemonicid: '@',
                tearsheet: '@'
            },
            controller: 'MsDropdownController',
            templateUrl: 'app/core/directives/ms-template/templates/ms-dropdown/ms-dropdown.html',
            compile: function(el, attrs)
            {
                return function($scope)
                {
                    //$scope.$watch(
                    //    "tearsheet",
                    //    function tearSheetObj(newValue, oldValue) {
                    //        if(newValue !== oldValue)
                    //        {
                    //            $scope.tearsheetobj = angular.fromJson($scope.tearsheet);
                    //        }
                    //    }
                    //);

                    $scope.tearsheetobj = angular.fromJson(_.unescape($scope.tearsheet));
                };
            }
        };
    }

})();