(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('MsHybridDropdownController', MsHybridDropdownController)
        .directive('msHybridDropdown', msHybridDropdownDirective);

    /** @ngInject */
    function MsHybridDropdownController($scope, templateBusiness)
    {
		$scope.disabled = ($scope.isdisabled === 'true');
		$scope.row[$scope.columnname] = ($scope.row[$scope.columnname] && $scope.row[$scope.columnname] !== '')? $scope.row[$scope.columnname]: $scope.defaultvalue;

        $scope.selectionChange = function()
        {
			$scope.save({row: $scope.row});
            $scope.cellUpdate();
        };
    }

    /** @ngInject */
    function msHybridDropdownDirective()
    {
        return {
            restrict: 'E',
            scope   : {
                row: '=',
                isdisabled: '@',
				selections: '=',
				defaultvalue: '@',
				save: '&',
                cellUpdate: '&',
                columnname: '@'
            },
            controller: 'MsHybridDropdownController',
            templateUrl: 'app/core/directives/ms-template/templates/ms-table-layout/hybrid/dropdown/ms-hybrid-dropdown.html',
            link: function(scope)
            {
            }
        };
    }

})();