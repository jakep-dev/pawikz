(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('MsNumberController', MsNumberController)
        .directive('msNumber', msNumberDirective);

    /** @ngInject */
    function MsNumberController($scope, templateBusiness)
    {
        $scope.actualValue = parseInt($scope.value);

        $scope.$watch(
            "value",
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
    function msNumberDirective()
    {
        return {
            restrict: 'E',
            scope   : {
                itemid: '@',
                mnemonicid: '@',
                value: '@',
                isdisabled: '=?',
                type: '@'
            },
            controller: 'MsNumberController',
            templateUrl: 'app/core/directives/ms-template/templates/ms-number/ms-number.html'
        };
    }

})();