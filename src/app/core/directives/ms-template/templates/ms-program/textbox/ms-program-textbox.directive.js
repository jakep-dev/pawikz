(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('MsProgramTextController', MsProgramTextController)
        .directive('msProgramText', msProgramTextDirective);

    /** @ngInject */
    function MsProgramTextController($scope, $filter, templateBusiness)
    {
        $scope.disabled = ($scope.isdisabled === 'true');

        function removeCommaValue(inputValue)
        {
            var outputValue;
            
            if (inputValue)
            {
                outputValue = String(inputValue).replace(/\,/g, '');
                return outputValue;
            }
            else
            {
                return inputValue;
            }
        }

        $scope.textChange = function()
        {
            //console.log('textChange --> value = "' + $scope.value + '"');

            var inputVal = $.trim($scope.value);

            //if the number pattern matches numeric shortcuts ###[kmb] then skip the computation of the rest of the rows
            //ms-numeric-shortcut directive will call textchange and trigger the $scope.$watch
            var regEx = /^[0-9]+\.?[0-9]*[kKmMbB]$/;
            if (!regEx.test(inputVal))
            {
                inputVal = removeCommaValue(inputVal);
                if (inputVal) {
                    $scope.value = $filter("currency")(inputVal, '', 0);
                }
                else
                {
                    $scope.value = '';
                }
                $scope.compute({
                    currentRow: $scope.row, value: $scope.value,
                    rowId: $scope.rowid, columnName: $scope.columnname
                });
            }
            else { console.log('Skipping over the procession of ' + inputVal); }
        }

        $scope.$watch(
            "value",
            function handleAutoSave(newValue, oldValue) {
                //console.log('$watch on scope.value --> newValue = "' + newValue + '"' + ' oldValue ="' + oldValue + '"');
                newValue = removeCommaValue(newValue);
                oldValue = removeCommaValue(oldValue);
                if (newValue !== oldValue)
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