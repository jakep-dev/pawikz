(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('MsHybridTextController', MsHybridTextController)
        .directive('msHybridText', msHybridTextDirective);

    /** @ngInject */
    function MsHybridTextController($scope, commonBusiness, templateBusinessFormat, templateBusiness)
    {
		
		$scope.disabled = ($scope.isdisabled === 'true');
        $scope.formatObj = angular.fromJson(_.unescape($scope.formats));
        $scope.row[$scope.columnname] = templateBusinessFormat.formatData($scope.row[$scope.columnname], $scope.formatObj);

        $scope.textChange = function()
        {
			$scope.row[$scope.columnname] = templateBusinessFormat.formatData($scope.row[$scope.columnname], $scope.formatObj);
            $scope.save({row: $scope.row});
            commonBusiness.emitWithArgument($scope.tableItemId + '-CellUpdate', $scope.element);
        };

        $scope.removeFixes = function()
        {
            $scope.row[$scope.columnname] = templateBusinessFormat.removeFixes($scope.row[$scope.columnname], $scope.formatObj);
        }
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
                tableItemId: '@',
                columnname: '@',
                formats: '@'
            },
            controller: 'MsHybridTextController',
            templateUrl: 'app/core/directives/ms-template/templates/ms-table-layout/hybrid/textbox/ms-hybrid-textbox.html',
            link: function(scope, el)
            {
                scope.element = el;
            }
        };
    }

})();