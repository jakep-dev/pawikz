(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('MsStepOverviewController', MsStepOverviewController)
        .directive('msStepOverview', msStepOverviewDirective);


    function MsStepOverviewController($scope)
    {
        $scope.isExpanded = false;
        $scope.isOverAllSelected = isAllSectionSelected();
        $scope.expandCollapseToggle = expandCollapseToggle;

        $scope.unSelectAll = unSelectAll;
        $scope.selectAll = selectAll;

        console.log('Inside StepOverview Directive = ' + $scope.isExpanded);

        function unSelectAll()
        {
            angular.forEach($scope.step.sections, function(section)
            {
                section.value = false;
            });
            $scope.isOverAllSelected = false;
        }

        function selectAll()
        {
            angular.forEach($scope.step.sections, function(section)
            {
                section.value = true;
            });
            $scope.isOverAllSelected = true;
        }

        function expandCollapseToggle()
        {
            $scope.isExpanded = !$scope.isExpanded;
        }

        function isAllSectionSelected()
        {
            var isAllSelected = false;

            if(angular.isDefined($scope.step) &&
               angular.isDefined($scope.step.sections))
            {
                var totalCount = $scope.step.sections.length;
                var actualCount = 0;
                angular.forEach($scope.step.sections, function(section)
                {

                    section.value = angular.isDefined(section.value) ? JSON.parse(section.value) : false;
                    if(section.value)
                    {
                        actualCount++;
                    }

                });

                if(totalCount === actualCount)
                {
                    isAllSelected = true;
                }
                console.log('TotalCount = ' + totalCount);
                console.log('ActualCount = ' + actualCount);
            }


            return isAllSelected;
        }



        function isExpandable()
        {
            return (angular.isDefined($scope.expandable) && $scope.expandable === true);
        }

    }

    /** @ngInject */
    function msStepOverviewDirective()
    {
        return {
            restrict: 'E',
            scope: {
                step: '=',
                expandable: '=?'
            },
            transclude: true,
            controller: 'MsStepOverviewController',
            templateUrl: 'app/core/directives/ms-step-overview/ms-step-overview.html'
        };


    }
})();