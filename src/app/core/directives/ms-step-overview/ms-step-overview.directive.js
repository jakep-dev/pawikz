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
        $scope.expandCollapseToggle = expandCollapseToggle;
        $scope.singleSelection = singleSelection;
        $scope.setStepSelection = setStepSelection;


        console.log('Inside StepOverview Directive = ' + $scope.isExpanded);

        console.log($scope.step);

        //set the step select and unselect feature.
        function setStepSelection()
        {
            $scope.step.value = !$scope.step.value;
            setChildSelection();
        }

        //set the child select and unselect feature
        function setChildSelection()
        {
            angular.forEach($scope.step.sections, function(section)
            {
                section.value = $scope.step.value;
            });
        }

        function singleSelection()
        {
            recalculateSelection();
        }

        function expandCollapseToggle()
        {
            $scope.isExpanded = !$scope.isExpanded;
        }

        function recalculateSelection()
        {
            console.log('Enter recalculate selection');

            if(angular.isDefined($scope.step) &&
               angular.isDefined($scope.step.sections))
            {
                $scope.step.value = _.every($scope.step.sections,
                    _.identity({value: true}));
            }
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
				projectId: '=',
                expandable: '=?'
            },
            transclude: true,
            controller: 'MsStepOverviewController',
            templateUrl: 'app/core/directives/ms-step-overview/ms-step-overview.html'
        };


    }
})();