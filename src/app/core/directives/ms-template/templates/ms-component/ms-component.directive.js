(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('msComponentController', msComponentController)
        .directive('msComponent', msComponentDirective);

    function msComponentController($scope)
    {
        //$scope.collapsed = $scope.initialCollapsed;

        $scope.collapse = collapse;

        //Toggle the collapse
        function collapse()
        {
            $scope.collapsed = !$scope.collapsed;
        }
    }

    /** @ngInject */
    function msComponentDirective($compile)
    {
        return {
            restrict: 'E',
            scope   : {
                tearsheet: '=',
                tearcontent: '=',
                iscollapse: '=?'
            },
            controller: 'msComponentController',
            templateUrl: 'app/core/directives/ms-template/templates/ms-component/ms-component.html',
            link: function(scope, el, attrs)
            {
                console.log(scope);

                scope.collapsed = false;



                angular.forEach(scope.tearsheet, function(eachSheet)
                {
                    if(eachSheet.id === 'LabelItem')
                    {
                        scope.title = eachSheet.Label;
                    }
                });

                var html = '';
                angular.forEach(scope.tearcontent, function(content)
                {
                    html = '<div>';
                    switch (content.id)
                    {
                        case 'GenericTableItem':
                            var newScope  = scope.$new();
                            newScope.tearsheet = {
                                rows: content.row
                            };
                            console.log(newScope);
                            html += '<ms-generic-table tearsheet="tearsheet"></ms-generic-table>';
                            html += '</div>';
                            el.find('#ms-accordion-content').append($compile(html)(newScope));
                            break;
                        case 'TableLayOut':
                            var newScope  = scope.$new();
                            html += '<ms-message message="Under Contruction"></ms-message>';
                            html += '</div>';
                            el.find('#ms-accordion-content').append($compile(html)(newScope));
                            break;
                        case '':
                            break;
                    }
                });
            }
        };
    }

})();