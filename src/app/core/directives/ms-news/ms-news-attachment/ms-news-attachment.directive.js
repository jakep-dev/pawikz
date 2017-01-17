(function() {
    'use strict';

    angular
        .module('app.core')
        .controller('MsNewsAttachmentController', MsNewsAttachmentController)
        .directive('msNewsAttachment', msNewsAttachmentDirective);

    /** @ngInject */
    function MsNewsAttachmentController($scope, $sce, newsService, newsBusiness, commonBusiness, templateBusiness, $compile, $element) {
        var vm = this;

        vm.bookmarkedItems = [];
        vm.showArticleContent = showArticleContent;

        loadAttachments();

        commonBusiness.onMsg('news-bookmark', $scope, function() {
            vm.bookmarkedItems = newsBusiness.selectedNews;
        });

        function showArticleContent(article) {
            newsService.showArticleContent(article.externalUrl).then(function(response) {
                // article.htmlArticle = response.htmlContent;
                article.htmlArticle = $sce.trustAsHtml(response.htmlContent);
                article.isLoaded = true;
            });
        }

        function loadAttachments() {
            newsService.getAttachedArticles(commonBusiness.projectId, commonBusiness.stepId).then(function(response) {

                vm.bookmarkedItems = [];
                if (response.bookmarks) {
                    _.each(response.bookmarks, function(details, index) {
                        var article = {
                            rowId: index,
                            isOpen: false,
                            title: details.title,
                            resourceId: details.resourceId,
                            externalUrl: details.externalUrl,
                            htmlArticle: '', //showArticleContent(details.externalUrl),
                            isLoaded: false
                        }
                        article.htmlArticle = showArticleContent(article)
                        vm.bookmarkedItems.push(article);
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
            scope: {},
            controller: 'MsNewsAttachmentController',
            controllerAs: 'vm',
            templateUrl: 'app/core/directives/ms-news/ms-news-attachment/ms-news-attachment.html',
            transclude: true
        };
    }

})();