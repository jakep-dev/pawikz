(function() {
    'use strict';

    angular
        .module('app.core')
        .controller('msNewsController', msNewsController)
        .directive('msNews', msNewsDirective);

    function msNewsController($scope) {

        defineAction($scope);

        function defineAction($scope) {

            if ($scope.name) {
                $scope.$parent.$parent.action.push({
                    id: 1,
                    callback: $scope.itemid + '-Bookmark',
                    icon: 'icon-bookmark',
                    isclicked: null,
                    tooltip: 'Attach Checked Article',
                    type: 'button'
                });
            }

        }
    }

    /** @ngInject */
    function msNewsDirective($compile) {
        return {
            restrict: 'E',
            scope: {
                name: '@',
                action: '@'
            },
            controller: 'msNewsController',
            controllerAs: 'vm',
            templateUrl: 'app/core/directives/ms-news/ms-news.html',
            transclude: true,
            link: function(scope, el, attrs) {
                /*var html = '<div style="border:1px solid red;">Some text</div>';
                var sort = el.find('#newsPageDetails_sort');
                $("#newsPageDetails_sort").append(html);
                console.log("Visible" + sort);
                $compile(sort)(scope);
                el.append(sort);*/
            }
        };
    }
})();