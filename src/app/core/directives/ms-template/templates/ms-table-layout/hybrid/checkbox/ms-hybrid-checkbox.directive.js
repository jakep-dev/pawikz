(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('MsHybridCheckboxController', MsHybridCheckboxController)
        .directive('msHybridCheckbox', msHybridCheckboxDirective);

    /** @ngInject */
    function MsHybridCheckboxController($scope)
    {
        $scope.disabled = ($scope.isdisabled === 'true');
		$scope.trueValue = '\'' + $scope.text + '\'';

        $scope.checkChange = function()
        {
			$scope.save({row: $scope.row});
        };
    }

    /** @ngInject */
    function msHybridCheckboxDirective()
    {
        return {
            restrict: 'E',
            scope   : {
                row: '=',
                isdisabled: '@',
				text: '@',
                type: '@',
				save: '&',
                rowid: '=',
                columnname: '@'
            },
            controller: 'MsHybridCheckboxController',
            templateUrl: 'app/core/directives/ms-template/templates/ms-table-layout/hybrid/checkbox/ms-hybrid-checkbox.html',
            link: function(scope)
            {
            }
        };
    }

})();