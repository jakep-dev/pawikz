(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('MsCalendarController', MsCalendarController)
        .directive('msCalendar', msCalendarDirective);

    /** @ngInject */
    function MsCalendarController($scope, templateBusiness)
    {
		$scope.value = parseDate($scope.value, $scope.parseFormat);

        $scope.$watch(
            "value",
            function handleAutoSave(newValue, oldValue) {
                if(newValue !== oldValue)
                {
                    templateBusiness.getReadyForAutoSave($scope.itemid, $scope.mnemonicid, newValue);
                }
            }
        );
		
		function parseDate(str, format){
			var date = moment(str, format, true);
			return date.isValid() ? date.toDate() : '';
		}
		
		function formatDate(str, format){
			var date = moment(date);
			return date.isValid() ? date.format(format) : '';
		}
    }

    /** @ngInject */
    function msCalendarDirective()
    {
        return {
            restrict: 'E',
            scope   : {
                itemid: '@',
                mnemonicid: '@',
                value: '@',
                isdisabled: '=?',
				parseformat : '@'
            },
            controller: 'MsCalendarController',
            templateUrl: 'app/core/directives/ms-template/templates/ms-calendar/ms-calendar.html'
        };
    }

})();