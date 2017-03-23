(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('MsHybridCalendarController', MsHybridCalendarController)
        .directive('msHybridCalendar', msHybridCalendarDirective);

    /** @ngInject */
    function MsHybridCalendarController($scope, templateBusiness)
    {
		if(!angular.isDate($scope.row[$scope.columnname]))
		{
			$scope.row[$scope.columnname] = templateBusiness.parseDate($scope.row[$scope.columnname], 'DD-MMM-YY');
		}
		
		$scope.disabled = ($scope.isdisabled === 'true');

        $scope.textChange = function()
        {
			$scope.save({row: $scope.row});
            $scope.$parent.$parent.cellUpdateDate();   
		};
    }

    /** @ngInject */
    function msHybridCalendarDirective()
    {
        return {
            restrict: 'E',
            scope   : {
                row: '=',
                isdisabled: '@',
				save: '&',
                columnname: '@'
            },
            controller: 'MsHybridCalendarController',
            templateUrl: 'app/core/directives/ms-template/templates/ms-table-layout/hybrid/calendar/ms-hybrid-calendar.html',
            link: function(scope)
            {
            }
        };
    }

})();