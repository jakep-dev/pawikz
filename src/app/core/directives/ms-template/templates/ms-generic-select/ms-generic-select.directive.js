(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('MsGenericSelectController', MsGenericSelectController)
        .directive('msGenericSelect', msGenericSelectDirective);

    /** @ngInject */
    function MsGenericSelectController($scope, templateBusiness, templateBusinessSave, clientConfig)
    {
        $scope.disabled = ($scope.isdisabled === 'true');
        $scope.trueValue = '\'' + $scope.text + '\'';
        $scope.isSelected =false;

        $scope.checkChange = function()
        {
            $scope.value = $scope.isSelected;
        };


        $scope.$watch(
            "tearsheetObj.selectedValue",
            function handleAutoSave(newValue, oldValue) {
                if(newValue !== oldValue)
                {
                    templateBusinessSave.getReadyForAutoSave($scope.itemid, $scope.mnemonicid, newValue, clientConfig.uiType.general);
                    templateBusiness.updateMnemonicValue($scope.itemid, $scope.mnemonicid, newValue);
                }
            }


        );
    }

    /** @ngInject */
    function msGenericSelectDirective()
    {
        return {
            restrict: 'E',
            scope   : {
                row: '=',
                isdisabled: '@',
                text: '@',
                ischecked: '@',
                value : '@',
                itemid : '@',
                mnemonicid : '@',
                tearsheet : '@'
            },
            controller: 'MsGenericSelectController',
            templateUrl: 'app/core/directives/ms-template/templates/ms-generic-select/ms-generic-select.html',
            link: function($scope)
            {
                 $scope.tearsheetObj = angular.fromJson(_.unescape($scope.tearsheet));
            }
        };
    }

})();