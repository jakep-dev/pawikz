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
        var isAutoSaveEnabled = false;
        $scope.$watch(
            "value",
            function handleAutoSave(value) {
                if(isAutoSaveEnabled)
                {
                    templateBusiness.getReadyForAutoSave($scope.itemid, $scope.mnemonicid, value);
                    console.log( "$watch() -- Outer: ", value);
                }
                isAutoSaveEnabled = true;
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
                isdisabled: '=?'
            },
            controller: 'MsTextController',
            templateUrl: 'app/core/directives/ms-template/templates/ms-text/ms-text.html',
            link: function(scope)
            {

            }
        };
    }

})();