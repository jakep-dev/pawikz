(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('MsRadioButtonController', MsRadioButtonController)
        .directive('msRadioButton', msRadioButtonDirective);

    /** @ngInject */
    function MsRadioButtonController($scope, templateBusinessSave, clientConfig)
    {
        $scope.$watch(
            "tearsheetobj.value",
            function handleAutoSave(newValue, oldValue) {
                if(newValue !== oldValue) {
                    templateBusinessSave.getReadyForAutoSave($scope.itemid, $scope.mnemonicid, newValue, clientConfig.uiType.general);
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
                tearsheet: '@'
            },
            controller: 'MsRadioButtonController',
            templateUrl: 'app/core/directives/ms-template/templates/ms-radio-button/ms-radio-button.html',
            compile: function(el, attrs)
            {
                return function($scope)
                {
                    $scope.tearsheetobj = angular.fromJson(_.unescape($scope.tearsheet));
                };
            }
        };
    }

})();