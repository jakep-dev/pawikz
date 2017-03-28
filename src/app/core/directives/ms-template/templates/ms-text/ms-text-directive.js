(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('MsTextController', MsTextController)
        .directive('msText', msTextDirective);

    /** @ngInject */
    function MsTextController($scope, templateBusiness, clientConfig,
                              templateBusinessFormat, templateBusinessSave, commonBusiness)
    {
        $scope.disabled = ($scope.isdisabled === 'true');
        $scope.formatObj = angular.fromJson(_.unescape($scope.formats));
        $scope.formattedValue = templateBusinessFormat.formatData($scope.value, $scope.formatObj);
        $scope.iskmb = $scope.formatObj.isKMB;

        if($scope.fieldid)
        {
            commonBusiness.onMsg('fieldId_' + $scope.fieldid, $scope, function(ev, value) {
                $scope.value = value + '';
                $scope.formattedValue = templateBusinessFormat.formatData($scope.value, $scope.formatObj);
            });
        }

		//blur function add prefix, postfix and parenthesis for negatives
        $scope.textChange = function()
        {
            $scope.value = templateBusinessFormat.removeFixes($scope.formattedValue, $scope.formatObj);
            $scope.formattedValue = templateBusinessFormat.formatData($scope.value, $scope.formatObj);

            if($scope.fieldid)
            {
                templateBusiness.updateSummationMnemonics($scope.fieldid, $scope.itemid, $scope.value);
                templateBusiness.summation($scope.fieldid, $scope.itemid);
            }
        };
		
		//focus function remove prefix, postfix and parenthesis for negatives
		$scope.removeFixes = function() 
		{
            $scope.formattedValue = $scope.value;
		};

        $scope.$watch(
            "value",
            function handleAutoSave(newValue, oldValue) {
                if(newValue !== oldValue) {
                    var savedValue = ($scope.formatObj && $scope.formatObj.dataType && $scope.formatObj.dataType === 'DATE') ?
                                        templateBusinessFormat.formatDate(templateBusinessFormat.parseDate(newValue, 'M/D/YYYY'), 'DD-MMM-YY')
                                        : newValue;
                    templateBusinessSave.getReadyForAutoSave($scope.itemid, $scope.mnemonicid, savedValue, clientConfig.uiType.general);
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
                fieldid: '@',
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
                el.find('.md-errors-spacer').remove();
            }
        };
    }

})();