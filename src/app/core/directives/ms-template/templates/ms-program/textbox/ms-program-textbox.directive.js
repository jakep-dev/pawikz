(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('MsProgramTextController', MsProgramTextController)
        .directive('msProgramText', msProgramTextDirective);

    /** @ngInject */
    function MsProgramTextController($scope, templateBusiness)
    {
        $scope.disabled = ($scope.isdisabled === 'true');

        $scope.textChange = function()
        {
            $scope.compute({currentRow: $scope.row, value: $scope.value,
                            rowId: $scope.rowid, columnName: $scope.columnname});
        }

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
    function msProgramTextDirective()
    {
        return {
            restrict: 'E',
            scope   : {
                itemid: '@',
                mnemonicid: '@',
                value: '@',
                compute: '&',
                row: '=',
                isdisabled: '@',
                type: '@',
                rowid: '@',
                columnname: '@'
            },
            controller: 'MsProgramTextController',
            templateUrl: 'app/core/directives/ms-template/templates/ms-program/textbox/ms-program-textbox.html',
            link: function(scope)
            {

            }
        };
    }

})();