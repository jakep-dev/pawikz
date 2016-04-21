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
        var isAutoSaveEnabled = false;
        console.log('Calendar Scope = ');
        console.log($scope);
		
		$scope.value = parseDate($scope.value, $scope.parseFormat);

        $scope.$watch(
            "value",
            function handleAutoSave(value) {
                if(isAutoSaveEnabled)
                {
                    templateBusiness.getReadyForAutoSave($scope.itemid, $scope.mnemonicid, value);
                    console.log( "$watch() -- Calendar Outer: ", value);
                }
                isAutoSaveEnabled = true;
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