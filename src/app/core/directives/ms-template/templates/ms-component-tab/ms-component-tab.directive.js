(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('msComponentTabController', msComponentTabController)
        .directive('msComponentTab', msComponentTabDirective);

    function msComponentTabController($scope)
    {
        $scope.collapse = collapse;

        //Toggle the collapse
        function collapse()
        {
            $scope.collapsed = !$scope.collapsed;
        }
    }

    /** @ngInject */
    function msComponentTabDirective($compile, templateBusiness)
    {
        return {
            restrict: 'E',
            scope   : {
                tearheader: '=',
                tearcontent: '=',
                iscollapse: '=?'
            },
            controller: 'msComponentTabController',
            templateUrl: 'app/core/directives/ms-template/templates/ms-component-tab/ms-component-tab.html',
            link: function(scope, el, attrs)
            {
                scope.collapsed = false;
                scope.title = scope.tearheader.label;

                angular.forEach(scope.tearcontent, function(content)
                {
                    var index = _.findIndex(scope.tearcontent, content);

                    console.log('Tab Index - ' + index);

                });

            }
        };
    }

})();