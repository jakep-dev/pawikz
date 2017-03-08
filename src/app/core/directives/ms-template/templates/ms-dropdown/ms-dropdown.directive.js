(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('MsDropdownController', MsDropdownController)
        .directive('msDropdown', msDropDownDirective);

    /** @ngInject */
    function MsDropdownController($scope, templateBusinessSave, clientConfig)
    {
        $scope.$watch(
            "tearsheetobj.selectedValue",
            function handleAutoSave(newValue, oldValue) {
                if(newValue !== oldValue)
                {
                    templateBusinessSave.getReadyForAutoSave($scope.itemid, $scope.mnemonicid, newValue, clientConfig.uiType.general);
                }
            }
        );
    }

    /** @ngInject */
    function msDropDownDirective(fuseHelper)
    {
        return {
            restrict: 'E',
            scope   : {
                itemid: '@',
                mnemonicid: '@',
                tearsheet: '@',
                isIE: '=?'
            },
            controller: 'MsDropdownController',
            templateUrl: 'app/core/directives/ms-template/templates/ms-dropdown/ms-dropdown.html',
            compile: function(el, attrs)
            {
                return function($scope)
                {
                    $scope.isIE = fuseHelper.isIE() || fuseHelper.isIECheck();
                    $scope.tearsheetobj = angular.fromJson(_.unescape($scope.tearsheet));
                };
            }
        };
    }

})();