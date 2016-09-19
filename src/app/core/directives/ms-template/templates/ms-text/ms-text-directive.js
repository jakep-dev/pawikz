(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('MsTextController', MsTextController)
        .directive('msText', msTextDirective);

    /** @ngInject */
    function MsTextController($scope, $filter, templateBusiness)
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

		//blur function add prefix, postfix and parenthesis for negatives
        $scope.textChange = function()
        {
            if($scope.iskmb)
            {    
               var inputVal = $.trim($scope.value);

                //if the number pattern matches numeric shortcuts ###[kmb] then skip the computation of the rest of the rows
                //ms-numeric-shortcut directive will call textchange and trigger the $scope.$watch
                var regEx = /^[0-9]+\.?[0-9]*[kKmMbB]$/;
                if (!regEx.test(inputVal))
                {
                    inputVal = removeCommaValue(inputVal);
                    if (inputVal) {
						var precision = $scope.precision || 0;
                        $scope.value = $filter("currency")(inputVal, '', precision);
                    }
                    else
                    {
                        $scope.value = '';
                    }
                    // $scope.compute({
                    //     currentRow: $scope.row, value: $scope.value,
                    //     rowId: $scope.rowid, columnName: $scope.columnname
                    // });
                }
                else { }
            }
			
			if($scope.value && $scope.value.length > 0)
			{
				if($scope.precision)
				{
					$scope.value = templateBusiness.numberWithCommas(parseFloat(removeCommaValue($scope.value)).toFixed($scope.precision));
				}
				$scope.value = templateBusiness.numberWithCommas(removeCommaValue($scope.value));
				$scope.value = templateBusiness.parenthesisForNegative($scope.value);
				$scope.value = $scope.prefix + $scope.value + $scope.postfix;
			}
        }
		
		//focus function remove prefix, postfix and parenthesis for negatives
		$scope.removeFixes = function() 
		{
			$scope.value = removeFixes($scope.value);
		}

        $scope.$watch(
            "value",
            function handleAutoSave(newValue, oldValue) {
                if($scope.iskmb)
                {
                    newValue = removeCommaValue(newValue);
                    oldValue = removeCommaValue(oldValue);
                }

                if(removeFixes(newValue) !== removeFixes(oldValue))
                {
                    templateBusiness.getReadyForAutoSave($scope.itemid, $scope.mnemonicid, newValue);
                    templateBusiness.updateMnemonicValue($scope.itemid, $scope.mnemonicid, newValue);
                }
            }
        );
		
		//remove prefix, postfix and parenthesis for negatives
		function removeFixes(value)
		{
			value = templateBusiness.removeParenthesis(value);			
			
			if($scope.prefix && $scope.prefix.length > 0)
			{
				value = value.replace($scope.prefix, '');
			}
			
			if($scope.postfix && $scope.postfix.length > 0)
			{
				value = value.replace($scope.postfix, '');
			}
			
			return value;
		}
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
				prefix: '@',
				postfix: '@',
				precision: '=',
                isdisabled: '=?',
                type: '@',
                iskmb: '=?'
            },
            controller: 'MsTextController',
            templateUrl: 'app/core/directives/ms-template/templates/ms-text/ms-text.html',
            link: function(scope)
            {

            }
        };
    }

})();