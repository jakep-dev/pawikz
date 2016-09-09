(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('MsRadioButtonController', MsRadioButtonController)
        .directive('msRadioButton', msRadioButtonDirective);

    /** @ngInject */
    function MsRadioButtonController($scope, templateBusiness)
    {
        $scope.$watch(
            "tearsheet.value",
            function handleAutoSave(newValue, oldValue) {
                if(newValue !== oldValue)
                {
                    templateBusiness.getReadyForAutoSave($scope.itemid, $scope.mnemonicid, newValue);
                }
            }
        );

    }

    /** @ngInject */
    function msRadioButtonDirective()
    {
        return {
            restrict: 'E',
            scope   : {
                itemid: '@',
                mnemonicid: '@',
                tearsheet: '='
            },
            controller: 'MsRadioButtonController',
            templateUrl: 'app/core/directives/ms-template/templates/ms-radio-button/ms-radio-button.html',
            link:function(scope)
            {
            }
        };
    }

})();