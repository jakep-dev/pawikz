/**
 * Created by sherindharmarajan on 11/19/15.
 */
(function ()
{
    'use strict';

    angular
        .module('app.overview')
        .controller('OverviewController', OverviewController);



    /** @ngInject */
    function OverviewController($rootScope, $stateParams, dataservice, $scope)
    {
        $rootScope.projectId = $stateParams.projectId;
        $rootScope.title = 'Overview';

        var vm = this;
        vm.isExpanded = true;
        vm.isOverviewLoaded = false;
        vm.isTabletMode = false;
        vm.isStepTabletMode = false;
        vm.isAllSelected = false;
        vm.templateOverview = [];

        vm.flipView = flipView;
        vm.expandCollapseToggle = expandCollapseToggle;
        vm.flipStepView = flipStepView;
        vm.flipSelectionView = flipSelectionView;
        vm.saveAll = saveAll;


        ////Data
        dataservice.getOverview($stateParams.projectId).then(function(data)
        {
            if(angular.isDefined(data.templateOverview))
            {
                vm.templateOverview = data.templateOverview;
                console.log(vm.templateOverview);

                angular.forEach(vm.templateOverview.steps, function(step)
                {
                   $rootScope.projectOverview.push({
                       stepName: step.stepName
                   })
                });
            }
            vm.isOverviewLoaded = true;
        });

        function saveAll()
        {
            var userId = $rootScope.passedUserId;
            var projectId = $rootScope.projectId;
            var steps = [];

            if(angular.isDefined(vm.templateOverview.steps))
            {
                _.each(vm.templateOverview.steps, function(step)
                {
                    var stepId = step.stepId;
                    var stepName = step.stepName;
                    var sections = [];
                    if(angular.isDefined(step.sections))
                    {
                        _.each(step.sections, function(section)
                        {
                            sections.push({
                                mnemonic: section.mnemonic,
                                itemId: section.itemId,
                                value: section.value
                            });
                        });
                    }
                    steps.push({
                        stepId: stepId,
                        stepName: stepName,
                        sections: sections
                    })
                });
            }

            console.log(steps);

            dataservice.saveOverview(userId, projectId, steps).then(function(data)
            {
                console.log('Inside saveOverview')
                console.log(data);
            });
        }

        //Methods
        function flipView()
        {
            console.log('Flipping - ' + vm.isTabletMode);
            vm.isTabletMode = !vm.isTabletMode;
            flipStepView();
        }

        function flipStepView()
        {
            vm.isStepTabletMode = !vm.isStepTabletMode;
        }

        function flipSelectionView()
        {
            vm.isAllSelected = !vm.isAllSelected;
            selectionProcess(vm.isAllSelected);
            console.log($scope);
        }

        function selectionProcess(value)
        {
            if(angular.isDefined(vm.templateOverview)) {

                angular.forEach(vm.templateOverview.steps, function(step)
                {
                    step.value = value;
                    angular.forEach(step.sections, function(section)
                    {
                        section.value = value;
                    });
                });
            }
        }


        function expandCollapseToggle()
        {
            console.log('Expand/Collapse');
            vm.isExpanded = !vm.isExpanded;
        }


        function overViewData()
        {
            return {
                steps: [
                    {
                        stepName: 'Step 1',
                        sections: [{
                            label: 'Label 1'
                        },
                            {
                                label: 'Label 2'
                                ,value: true
                            },
                            {
                                label: 'Label 3'
                                ,value: true
                            }]
                    },
                    {
                        stepName: 'Step 1',
                        sections: [{
                            label: 'Label 1'
                        },
                            {
                                label: 'Label 2'
                                ,value: true
                            },
                            {
                                label: 'Label 3'
                                ,value: true
                            }]
                    },
                    {
                        stepName: 'Step 1',
                        sections: [{
                            label: 'Label 1'
                        },
                            {
                                label: 'Label 2'
                                ,value: true
                            },
                            {
                                label: 'Label 3'
                                ,value: true
                            },{
                                label: 'Label 4'
                                ,value: true
                            },
                            {
                                label: 'Label 4'
                                ,value: true
                            }]
                    },
                    {
                        stepName: 'Step 1',
                        sections: [{
                            label: 'Label 1'
                            ,value: true
                        },
                            {
                                label: 'Label 2'
                                ,value: true
                            },
                            {
                                label: 'Label 3'
                                ,value: true
                            },{
                                label: 'Label 4'
                                ,value: true
                            },
                            {
                                label: 'Label 4'
                                ,value: true
                            }]
                    }
                ]
            }
        }
    }

})();
