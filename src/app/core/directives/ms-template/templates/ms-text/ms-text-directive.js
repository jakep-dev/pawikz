(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('MsTextController', MsTextController)
        .directive('msText', msTextDirective);

    /** @ngInject */
    function MsTextController($scope, templateBusiness)
    {
        $scope.disabled = ($scope.isdisabled === 'true');

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
    function msTextDirective()
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
            controller: 'MsTextController',
            templateUrl: 'app/core/directives/ms-template/templates/ms-text/ms-text.html',
            link: function(scope)
            {

            }
        };
    }

})();