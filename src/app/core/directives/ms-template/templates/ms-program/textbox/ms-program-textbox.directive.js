(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('MsProgramTextController', MsProgramTextController)
        .directive('msProgramText', msProgramTextDirective);

    /** @ngInject */
    function MsProgramTextController($scope, $filter, templateBusiness, templateBusinessFormat, templateBusinessSave, clientConfig)
    {
        $scope.disabled = ($scope.isdisabled === 'true');
        $scope.formatObj = angular.fromJson(_.unescape($scope.formats));
        $scope.value = templateBusinessFormat.formatProgramTableData($scope);

        $scope.textChange = function()
        {
            $scope.value = templateBusinessFormat.formatProgramTableData($scope);

            $scope.compute({
                currentRow: $scope.row, value: $scope.value,
                rowId: $scope.rowid, columnName: $scope.columnname
            });
        };
		
		//focus function remove prefix, postfix and parenthesis for negatives
		$scope.removeFixes = function() 
		{
            $scope.value = templateBusinessFormat.removeFixes($scope.value, $scope.formatObj);;
		};
    }

    /** @ngInject */
    function msProgramTextDirective()
    {
        return {
            restrict: 'E',
            scope   : {
                itemid: '@',
                mnemonicid: '@',
                value: '@',
                compute: '&',
                row: '=',
                isdisabled: '@',
                type: '@',
                rowid: '@',
                columnname: '@',
                formats: '@'
            },
            controller: 'MsProgramTextController',
            templateUrl: 'app/core/directives/ms-template/templates/ms-program/textbox/ms-program-textbox.html',
            link: function (scope, element)
            {
                scope.sourceElement = element;
            }
        };
    }

})();