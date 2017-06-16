(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('MsPivotTextController', MsPivotTextController)
        .directive('msPivotText', msPivotTextDirective);

    /** @ngInject */
    function MsPivotTextController($scope, commonBusiness, templateBusinessFormat, templateBusiness)
    {
		
		$scope.disabled = ($scope.isdisabled === 'true');
        $scope.formatObj = angular.fromJson(_.unescape($scope.formats));
        $scope.row[$scope.columnname] = templateBusinessFormat.formatData($scope.row[$scope.columnname], $scope.formatObj);

        $scope.textChange = function()
        {
			$scope.row[$scope.columnname] = templateBusinessFormat.formatData($scope.row[$scope.columnname], $scope.formatObj);
            $scope.save({row: $scope.row});
        };

        $scope.removeFixes = function()
        {
            $scope.row[$scope.columnname] = templateBusinessFormat.removeFixes($scope.row[$scope.columnname], $scope.formatObj);
        }
    }

    /** @ngInject */
    function msPivotTextDirective()
    {
        return {
            restrict: 'E',
            scope   : {
                row: '=',
                isdisabled: '@',
				save: '&',
                columnname: '@',
                formats: '@'
            },
            controller: 'MsPivotTextController',
            templateUrl: 'app/core/directives/ms-template/templates/ms-table-layout/readonly/pivot/textbox/ms-pivot-textbox.html',
            link: function(scope, el)
            {
            }
        };
    }

})();