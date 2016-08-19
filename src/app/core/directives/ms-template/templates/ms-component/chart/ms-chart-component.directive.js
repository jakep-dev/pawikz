(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('msChartComponentController', msChartComponentController)
        .directive('msChartComponent', msChartComponentDirective);

    function msChartComponentController($scope, commonBusiness)
    {
        var vm = this;
        vm.isNonEditable = $scope.isnoneditable;
        vm.iscollapsible = $scope.iscollapsible;
        vm.isProcessComplete = $scope.isprocesscomplete;


        $scope.$watch(
            "isprocesscomplete",
            function handleProgress(value) {
                vm.isProcessComplete = value;
            }
        );

        commonBusiness.onMsg('IsTemplateExpanded', $scope, function () {
            if (commonBusiness.isTemplateExpandAll === vm.collapsed) {
                toggleCollapse();
            }
        });

        vm.collapsed = false;
        vm.toggleCollapse = toggleCollapse;

        function toggleCollapse()
        {
            vm.collapsed = !vm.collapsed;
        }

    }

    /** @ngInject */
    function msChartComponentDirective($compile, templateBusiness)
    {
        return {
            restrict: 'E',
            scope   : {
                tearheader: '=',
                tearcontent: '=',
                iscollapsible: '=?',
                isnoneditable: '=?',
                isprocesscomplete: '=?'
            },
            controller: 'msChartComponentController',
            controllerAs: 'vm',
            templateUrl: 'app/core/directives/ms-template/templates/ms-component/chart/ms-chart-component.html',
            link: function(scope, el, attrs)
            {
                var html = '';
                angular.forEach(scope.tearcontent, function(content)
                {
                    html = '<div>';
                    switch (content.id)
                    {
                        case "ScrapedItem":
                            var newScope  = scope.$new();
                            var mnemonicid = content.Mnemonic;
                            var itemid = content.ItemId;

                            newScope.mnemonicid = mnemonicid;
                            newScope.itemid = itemid;

                            html += '<ms-chart type="Stock" mnemonicid="'+ mnemonicid +'" itemid="'+ itemid +'"></ms-chart>';
                            el.find('#ms-chart-accordion-content').append($compile(html)(newScope));
                            break;
                    }
                });
            }
        };
    }

})();