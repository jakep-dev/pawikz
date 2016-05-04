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
        var isAutoSaveEnabled = false;
        console.log('DropDown Controller Scope = ');
        console.log($scope);
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
                    var tearsheet = $scope.tearsheet;
                    $scope.tearsheetobj = angular.fromJson(tearsheet);
                };
            }
        };
    }

})();