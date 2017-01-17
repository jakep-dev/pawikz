(function() {
    'use strict';

    angular
        .module('app.core')
        .controller('MsNewsAttachmentController', MsNewsAttachmentController)
        .directive('msNewsAttachment', msNewsAttachmentDirective);

    /** @ngInject */
    function MsNewsAttachmentController($scope, newsService, newsBusiness, commonBusiness, templateBusiness, $compile, $element) {
        var vm = this;

        vm.bookmarkedItems = [];
        
        loadAttachments();

        commonBusiness.onMsg('news-bookmark', $scope, function() {
            vm.bookmarkedItems = newsBusiness.selectedNews;
        });

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

                    newsBusiness.selectedNews = vm.bookmarkedItems;
                }
            });
        }
    }

    /** @ngInject */
    function msNewsAttachmentDirective($compile) {
        return {
            restrict: 'E',
            scope: {
            },
            controller: 'MsNewsAttachmentController',
            controllerAs: 'vm',
            templateUrl: 'app/core/directives/ms-news/ms-news-attachment/ms-news-attachment.html',
            transclude: true
        };
    }

})();