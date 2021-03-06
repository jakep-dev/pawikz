(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('MsStepOverviewController', MsStepOverviewController)
        .directive('msStepOverview', msStepOverviewDirective);


    function MsStepOverviewController($scope, commonBusiness)
    {
        $scope.isExpanded = false;

        $scope.toggleExpanded = toggleExpanded;
        $scope.singleSelection = singleSelection;
        $scope.setStepSelection = setStepSelection;
        $scope.includeStepSelection = includeStepSelection;
        
        includeStepSelection();
        
        function includeStepSelection(){
            recalculateSelection();
        } 
        //set the step select and unselect feature.
        function setStepSelection()
        {
            // $scope.step.value = !$scope.step.value;
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

        function toggleExpanded()
        {
            $scope.isExpanded = !$scope.isExpanded;
        }

        function recalculateSelection()
        {
            if(angular.isDefined($scope.step) &&
               angular.isDefined($scope.step.sections))
            {
                $scope.step.value = _.some($scope.step.sections,
                    _.identity({value: true}));
            }
        }

        function isExpandable()
        {
            return (angular.isDefined($scope.expandable) && $scope.expandable === true);
        }

        commonBusiness.onMsg('IsStepExpanded', $scope, function () {
            if (commonBusiness.isStepExpandAll !== $scope.isExpanded) {
                toggleExpanded();
            }
        });
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
            controller: 'MsStepOverviewController',
            templateUrl: 'app/core/directives/ms-step-overview/ms-step-overview.html'
        };
    }
})();