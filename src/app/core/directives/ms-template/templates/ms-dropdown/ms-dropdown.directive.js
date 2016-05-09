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
            "tearsheet.selectedValue",
            function handleAutoSave(newValue, oldValue) {
                if(newValue !== oldValue)
                {
                    templateBusiness.getReadyForAutoSave($scope.itemid, $scope.mnemonicid, newValue);
                    console.log( "$watch() -- Drop down Outer: ", newValue);
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
                tearsheet: '='
            },
            controller: 'MsDropdownController',
            templateUrl: 'app/core/directives/ms-template/templates/ms-dropdown/ms-dropdown.html',
            compile: function(el, attrs)
            {
                return function($scope)
                {
                  console.log('DropDown - Compile');
                  console.log($scope);
                };
            }
        };
    }

})();