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
        var isAutoSaveEnabled = false;
        console.log('DropDown Controller Scope = ');
        console.log($scope);

        $scope.$watch(
            "tearsheet.selectedValue",
            function handleAutoSave(value) {
                if(isAutoSaveEnabled)
                {
                    templateBusiness.getReadyForAutoSave($scope.itemid, $scope.mnemonicid, value);
                    console.log( "$watch() -- Drop down Outer: ", value);
                }
                isAutoSaveEnabled = true;
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