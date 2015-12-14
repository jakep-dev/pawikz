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
    function OverviewController($rootScope, $stateParams, dataservice)
    {
        $rootScope.projectId = $stateParams.projectId;
        $rootScope.title = 'Overview';
        var vm = this;
        vm.isExpanded = true;
        vm.isOverviewLoaded = false;
        vm.isTabletMode = false;
        vm.isStepTabletMode = false;

        vm.flipView = flipView;
        vm.expandCollapseToggle = expandCollapseToggle;
        vm.flipStepView = flipStepView;
        //vm.templateOverview = overViewData();
        //
        //angular.forEach(vm.templateOverview.steps, function(step)
        //{
        //    $rootScope.projectOverview.push({
        //        stepName: step.stepName
        //    })
        //});

        console.log(vm.templateOverview)

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
