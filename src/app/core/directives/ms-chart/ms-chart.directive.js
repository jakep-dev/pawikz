(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('msChartController', msChartController)
        .directive('msChart', msChartDirective);

    /** @ngInject */
    function msChartController() {
        var vm = this;


    }

    /** @ngInject */
    function msChartDirective($compile, $document)
    {
        return {
            restrict: 'E',
            scope : {
                type: '@'
            },
            templateUrl: 'app/core/directives/ms-chart/ms-chart.html',
            controller : 'msChartController',
            link: function(scope, el, attrs)
            {
                var html = '';
                var newScope = null;
                switch (angular.lowercase(scope.type))
                {
                    case 'stock':
                        //Loop will happen based on array.
                        //We have to call the stockservice and get the result.
                        //Whether we should inject stockchart // Imagechart.


                            newScope = scope.$new();
                            html += '<ms-chart-placeholder title="Chart Name"></ms-chart-placeholder>';
                            el.find('#ms-chart-container').append($compile(html)(newScope));

                        break;
                    case 'bar':
                        break;

                    default:break;
                }
            }
        };
    }
})();