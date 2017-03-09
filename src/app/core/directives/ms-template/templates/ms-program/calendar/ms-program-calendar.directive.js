(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('MsProgramCalendarController', MsProgramCalendarController)
        .directive('msProgramCalendar', msProgramCalendarDirective);

    /** @ngInject */
    function MsProgramCalendarController($scope, templateBusinessFormat)
    {
        $scope.formatDate = templateBusinessFormat.parseDate($scope.value, 'DD-MMM-YY');
        
        $scope.dateChange = function() 
        {
            $scope.value = templateBusinessFormat.formatDate($scope.formatDate, 'DD-MMM-YY');
        }

        $scope.$watch(
            "value",
            function handleAutoSave(newValue, oldValue) {
                if(newValue !== oldValue)
                {
                    $scope.formatDate = templateBusinessFormat.parseDate(newValue, 'DD-MMM-YY');
                    newValue = templateBusinessFormat.formatDate($scope.formatDate, 'DD-MMM-YY');
                    
                    $scope.compute({
                        currentRow: $scope.row, value: newValue,
                        rowId: $scope.rowid, columnName: $scope.columnname
                    });
                }
            }
        );
    }

    /** @ngInject */
    function msProgramCalendarDirective()
    {
        return {
            restrict: 'E',
            scope   : {
                value: '=',
                compute: '&',
                rowid: '@',
                columnname: '@'
            },
            controller: 'MsProgramCalendarController',
            templateUrl: 'app/core/directives/ms-template/templates/ms-program/calendar/ms-program-calendar.html'
        };
    }

})();