(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('MsCalendarController', MsCalendarController)
        .directive('msCalendar', msCalendarDirective);

    /** @ngInject */
    function MsCalendarController($scope, clientConfig, templateBusiness, templateBusinessSave)
    {
		$scope.dateValue = templateBusiness.parseDate($scope.value, 'MM/DD/YYYY');
		
		$scope.$watch(
            "dateValue",
            function handleAutoSave(newValue, oldValue) {
				newValue = templateBusiness.formatDate(newValue, 'DD-MMM-YY');
				oldValue = templateBusiness.formatDate(oldValue, 'DD-MMM-YY');
                if(newValue !== oldValue)
                {
                    templateBusinessSave.getReadyForAutoSave($scope.itemid, $scope.mnemonicid, newValue, clientConfig.uiType.general);
                }
            }
        );
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
                isdisabled: '=?'
            },
            controller: 'MsCalendarController',
            templateUrl: 'app/core/directives/ms-template/templates/ms-calendar/ms-calendar.html'
        };
    }

})();