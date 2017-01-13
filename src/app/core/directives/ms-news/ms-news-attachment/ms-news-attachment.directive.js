(function() {
    'use strict';

    angular
        .module('app.core')
        .controller('MsNewsAttachmentController', MsNewsAttachmentController)
        .directive('msNewsAttachment', msNewsAttachmentDirective);

    /** @ngInject */
    function MsNewsAttachmentController($scope, newsService, commonBusiness, templateBusiness, $compile, $element) {
        var vm = this;
        var title = '';
        var resourceId = '';
        var externalUrl = '';

        vm.collapsed = false;
        $scope.collapsedData = {};
        vm.bookmarkedItems = [];
        vm.collapsed = $scope.initialCollapsed;
        vm.iscollapsible = $scope.iscollapsible;
        vm.toggleCollapse = toggleCollapse;
        vm.toggleCollapseData = toggleCollapseData;
        vm.isProcessComplete = $scope.isprocesscomplete;
        vm.loadAttachments = loadAttachments;


/*        $scope.$watch(
            "isprocesscomplete",
            function handleProgress(value) {
                vm.isProcessComplete = value;
            }
        );
*/
        vm.loadAttachments();

        commonBusiness.onMsg('reload-news-attachments', $scope, function() {
           vm.loadAttachments();
        });

        commonBusiness.onMsg('news-bookmark', $scope, function() {
            vm.loadAttachments();
        });


        function toggleCollapse() {
            vm.collapsed = !vm.collapsed;
        }

        function toggleCollapseData(index) {
            $scope.collapsedData[index] = !$scope.collapsedData[index];
        }

        //Toggle the collapse
        function collapse() {
            vm.collapsed = !$scope.collapsed;
        }


        function recompileHtml(row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
        }

        function loadAttachments() {
            newsService.getAttachedArticles(commonBusiness.projectId, commonBusiness.stepId).then(function(response) {
                
                vm.bookmarkedItems = [];
                if (response.bookmarks) {
                    _.each(response.bookmarks, function(details, index) {
                        vm.bookmarkedItems.push({
                            rowId: index,
                            isOpen: false,
                            title: details.title,
                            resourceId: details.resourceId,
                            externalUrl: details.externalUrl
                        });
                    });
                }
            });
        }
    }

    /** @ngInject */
    function msNewsAttachmentDirective($compile) {
        return {
            restrict: 'E',
            scope: {
                value: '@'
            },
            controller: 'MsNewsAttachmentController',
            controllerAs: 'vm',
            templateUrl: 'app/core/directives/ms-news/ms-news-attachment/ms-news-attachment.html',
            transclude: true
        };
    }

})();