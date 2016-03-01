(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('msChartController', msChartController)
        .directive('msChart', msChartDirective);

    /** @ngInject */
    function msChartController($scope) {
        var vm = this;




    }

    /** @ngInject */
    function msChartDirective($compile, stockService, commonBusiness)
    {
        return {
            restrict: 'E',
            scope : {
                type: '@',
                mnemonicid: '@',
                itemid: '@'
            },
            templateUrl: 'app/core/directives/ms-chart/ms-chart.html',
            controller : 'msChartController',
            link:
            {
                pre: function(scope, el)
                {
                    var html = '';
                    var newScope = null;

                    switch (angular.lowercase(scope.type))
                    {
                        case 'stock':
                            stockService.getSavedChartData(
                                commonBusiness.projectId,
                                commonBusiness.stepId,
                                scope.mnemonicid,
                                scope.itemid)
                                .then(function(data)
                                {
                                    var idCount = 1;

                                    //Creating Legacy Charts
                                    if(data.legacyCharts)
                                    {
                                        angular.forEach(data.legacyCharts, function(chart)
                                        {
                                            var msChartPlaceHolderId = 'chart-'.concat(++idCount);

                                            newScope = scope.$new();
                                            newScope.tearsheet = {
                                                type: 'image',
                                                url: chart.url,
                                                isChartTitle: true
                                            };

                                            html += '<ms-chart-placeholder id="'+msChartPlaceHolderId+'" title="" tearsheet="tearsheet"></ms-chart-placeholder>';
                                            el.find('#ms-chart-container').append($compile(html)(newScope));
                                        });
                                    }

                                    //Creating new charts
                                    if(data.newCharts)
                                    {
                                        angular.forEach(data.newCharts, function(chart)
                                        {
                                            var msChartPlaceHolderId = 'chart-'.concat(++idCount);
                                            newScope = scope.$new();

                                            newScope.tearsheet = {
                                                type: 'stock',
                                                isChartTitle: true,
                                                chartSetting: '',
                                                mnemonicId: scope.mnemonicid,
                                                itemId: scope.itemId
                                            };

                                            html += '<ms-chart-placeholder id="'+ msChartPlaceHolderId +' title="'+ chart.chartTitle +'" tearsheet="tearsheet"></ms-chart-placeholder>';
                                            el.find('#ms-chart-container').append($compile(html)(newScope));
                                        });
                                    }
                                });
                            break;
                        case 'bar':

                            break;

                        default:break;
                    }
                }
            }
        };
    }
})();