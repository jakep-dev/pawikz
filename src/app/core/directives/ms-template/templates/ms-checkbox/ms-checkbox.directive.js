(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('MsCheckboxController', MsCheckboxController)
        .directive('msCheckbox', msCheckboxDirective);

    /** @ngInject */
    function MsCheckboxController($scope, templateBusiness, templateBusinessSave, clientConfig)
    {
        $scope.disabled = ($scope.isdisabled === 'true');
        $scope.trueValue = '\'' + $scope.text + '\'';
        $scope.isSelected = false;

        $scope.checkChange = function()
        {
            $scope.value = $scope.isSelected;

            if($scope.value === $scope.tearsheet.selectedValue){
                return $scope.value;
            }
        };


        $scope.$watch(
            "tearsheetObj.selectedValue",
            function handleAutoSave(newValue, oldValue) {
                
                if($scope.isSelected)
                {
                    newValue = $scope.value;
                }

                if(newValue !== oldValue)
                {
                    templateBusinessSave.getReadyForAutoSave($scope.itemid, $scope.mnemonicid, newValue, clientConfig.uiType.general);
                    templateBusiness.updateMnemonicValue($scope.itemid, $scope.mnemonicid, newValue);
                }
            }


        );
    }

    /** @ngInject */
    function msCheckboxDirective()
    {
        return {
            restrict: 'E',
            scope   : {
                row: '=',
                isdisabled: '@',
                text: '@',
                value : '@',
                itemid : '@',
                mnemonicid : '@',
                tearsheet : '@'
            },
            controller: 'MsCheckboxController',
            templateUrl: 'app/core/directives/ms-template/templates/ms-checkbox/ms-checkbox.html',
            link: function($scope)
            {
                 $scope.tearsheetObj = angular.fromJson(_.unescape($scope.tearsheet));

                 // angular.extend({
                 //    values : [{
                 //        id: 0,
                 //        shortName: 'All'
                 //    }],
                 //    isdisabled: false
                 // }, detail);
            }
        };
    }

})();