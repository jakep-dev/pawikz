(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('MsTextController', MsTextController)
        .directive('msText', msTextDirective);

    /** @ngInject */
    function MsTextController($scope, $filter, templateBusiness, templateBusinessFormat)
    {
        $scope.disabled = ($scope.isdisabled === 'true');
        $scope.formatObj = angular.fromJson(_.unescape($scope.formats));
        $scope.formattedValue = templateBusinessFormat.formatData($scope.value, $scope.formatObj);
        $scope.iskmb = $scope.formatObj.isKMB;

		//blur function add prefix, postfix and parenthesis for negatives
        $scope.textChange = function()
        {
            $scope.value = templateBusinessFormat.removeFixes($scope.formattedValue, $scope.formatObj);
            $scope.formattedValue = templateBusinessFormat.formatData($scope.value, $scope.formatObj);
        }
		
		//focus function remove prefix, postfix and parenthesis for negatives
		$scope.removeFixes = function() 
		{
			//$scope.value = removeFixes($scope.value);
            $scope.formattedValue = $scope.value;
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
    function msTextDirective()
    {
        return {
            restrict: 'E',
            scope   : {
                itemid: '@',
                mnemonicid: '@',
                value: '@',
                formats: '@',
				prefix: '@',
				postfix: '@',
				precision: '=',
                isdisabled: '=?',
                type: '@',
                iskmb: '=?',
                classtype: '@'
            },
            controller: 'MsTextController',
            templateUrl: 'app/core/directives/ms-template/templates/ms-text/ms-text.html',
            link: function(scope, el)
            {
                // $('.md-errors-spacer').remove();
                el.find('.md-errors-spacer').remove();
            }
        };
    }

})();