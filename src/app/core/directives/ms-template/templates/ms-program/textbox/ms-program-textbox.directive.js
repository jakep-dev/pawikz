(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('MsProgramTextController', MsProgramTextController)
        .directive('msProgramText', msProgramTextDirective);

    /** @ngInject */
    function MsProgramTextController($scope, $filter, templateBusiness, templateBusinessFormat, templateBusinessSave, clientConfig)
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
            var inputVal = $.trim($scope.value);

            //if the number pattern matches numeric shortcuts ###[kmb] then skip the computation of the rest of the rows
            //ms-numeric-shortcut directive will call textchange and trigger the $scope.$watch
            if (!templateBusiness.isKMBValue(inputVal))
            {

                templateBusinessFormat.removeNonNumericCharacters(inputVal, 'Invalid entry. Input numbers with k, m or b for thousand, million or billion respectively.');

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

                //In the scenario if the visible text field has value of ###[KMB] 
                //and the prior value is the same as converted value of the current visible value(###[KMB])
                //For example prior value 2,000,000 and then user enters 2m, all the textchange and scope.watch was triggered.
                var element = $scope.sourceElement.find("input");
                var visibleValue = element.val();
                if (templateBusiness.isKMBValue(visibleValue))
                {
                    element.val($scope.value);
                }
            }
        };

        /*$scope.$watch(
            "value",
            function handleAutoSave(newValue, oldValue) {
                //In the scenario if the visible text field has value of ###[KMB]
                //and the prior value is the same as converted value of the current visible value(###[KMB])
                //scope.watch gets triggered with the 2m value and need to convert it
                if (templateBusiness.isKMBValue(newValue))
                {
                    newValue = templateBusiness.transformKMB(newValue);
                }
                newValue = removeCommaValue(newValue);
                oldValue = removeCommaValue(oldValue);
                if (newValue !== oldValue)
                {
                    templateBusinessSave.getReadyForAutoSave($scope.itemid, $scope.mnemonicid, newValue, clientConfig.uiType.general);
                    templateBusiness.updateMnemonicValue($scope.itemid, $scope.mnemonicid, newValue);
                }
            }
        );*/
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
            link: function (scope, element)
            {
                scope.sourceElement = element;
            }
        };
    }

})();