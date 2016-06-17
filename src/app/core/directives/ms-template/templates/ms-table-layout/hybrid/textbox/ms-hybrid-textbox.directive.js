(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('MsHybridTextController', MsHybridTextController)
        .directive('msHybridText', msHybridTextDirective);

    /** @ngInject */
    function MsHybridTextController($scope, templateBusiness)
    {
        $scope.disabled = ($scope.isdisabled === 'true');

        $scope.textChange = function()
        {
			$scope.save({row: $scope.row});
        };
    }

    /** @ngInject */
    function msHybridTextDirective()
    {
        return {
            restrict: 'E',
            scope   : {
                itemid: '@',
                mnemonicid: '@',
                row: '=',
                isdisabled: '@',
                type: '@',
				save: '&',
                rowid: '=',
                columnname: '@'
            },
            controller: 'MsHybridTextController',
            templateUrl: 'app/core/directives/ms-template/templates/ms-table-layout/hybrid/textbox/ms-hybrid-textbox.html',
            link: function(scope)
            {
            }
        };
    }

})();