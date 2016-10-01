(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('MsHybridTextController', MsHybridTextController)
        .directive('msHybridText', msHybridTextDirective);

    /** @ngInject */
    function MsHybridTextController($scope, templateBusiness)
    {
		//formats the data on initialization
		$scope.row[$scope.columnname] = templateBusiness.formatData($scope.row[$scope.columnname], _.find($scope.$parent.$parent.subMnemonics, {mnemonic: $scope.columnname}));
		$scope.disabled = ($scope.isdisabled === 'true');

        $scope.textChange = function()
        {
			var findMnemonic = _.find($scope.$parent.$parent.subMnemonics, {mnemonic: $scope.columnname});
			if(findMnemonic && findMnemonic.dataType == 'NUMBER')
			{
				$scope.row[$scope.columnname] = $scope.row[$scope.columnname].replace(/[^0-9]/g, '');
			}
			//removes the format before formatting
			$scope.row[$scope.columnname] = templateBusiness.removeFormatData($scope.row[$scope.columnname], findMnemonic);
			$scope.row[$scope.columnname] = templateBusiness.formatData($scope.row[$scope.columnname], findMnemonic);
			
			$scope.save({row: $scope.row});
        };
    }

    /** @ngInject */
    function msHybridTextDirective()
    {
        return {
            restrict: 'E',
            scope   : {
                row: '=',
                isdisabled: '@',
				save: '&',
                columnname: '@'
            },
            controller: 'MsHybridTextController',
            templateUrl: 'app/core/directives/ms-template/templates/ms-table-layout/hybrid/textbox/ms-hybrid-textbox.html',
            link: function(scope)
            {
            }
        };
    }

})();