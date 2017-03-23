(function() {
    'use strict';

    angular
        .module('app.core')
        .controller('MsNewsAttachmentController', MsNewsAttachmentController)
        .directive('msNewsAttachment', msNewsAttachmentDirective);

    function MsNewsAttachmentController($scope, $sce,
                                        commonBusiness, newsBusiness,
                                        newsService) {

        var vm = this;
        vm.deleteActions = [];
        vm.bookmarkedItems = [];
        vm.removeSelectedNews = [];
        vm.collapseEvent = "collapse";

        function buildArticle(bookmark, index) {
            var article;
            var actions;
            article = {
                rowId: index,
                isOpen: false,
                title: bookmark.title,
                resourceId: bookmark.resourceId,
                externalUrl: bookmark.externalUrl,
                htmlArticle: '',
                isLoaded: false,
                bookmarkId: bookmark.bookmarkId,
                stepId: bookmark.stepId,
                isSelected: false,
                isRemoved: false
            }
            actions = new Array();
            actions.push({
                id: 1,
                callback: vm.selectBookmarkToRemove,
                icon: 'icon-radiobox-blank',
                isclicked: null,
                disabled: false,
                tooltip: 'Select',
                type: 'button'
            });
            article.actions = actions;
            article.htmlArticle = showArticleContent(article)
            return article;
        }

        function loadAttachments() {
            var article;
            var i;
            var n;
            var oldBookmark, newBookmark;

            newsService.getAttachedArticles(commonBusiness.projectId, commonBusiness.stepId).then(function (response) {
                if (response.bookmarks) {
                    n = vm.bookmarkedItems.length;
                    for (i = n - 1; i >= 0 ; i--) {
                        newBookmark = _.find(response.bookmarks,
                            function (bookmark) {
                                if ((bookmark.resourceId === vm.bookmarkedItems[i].resourceId) && (bookmark.bookmarkId === vm.bookmarkedItems[i].bookmarkId)) {
                                    return true;
                                }
                            }
                        );
                        if (!newBookmark) {
                            vm.bookmarkedItems.splice(i, 1);
                        }
                    }
                    n = response.bookmarks.length;
                    for (i = 0; i < n; i++) {
                        oldBookmark = _.find(vm.bookmarkedItems,
                            function (bookmark) {
                                if ((bookmark.resourceId === response.bookmarks[i].resourceId) && (bookmark.bookmarkId === response.bookmarks[i].bookmarkId)) {
                                    return true;
                                }
                            }
                        );
                        if (!oldBookmark) {
                            article = buildArticle(response.bookmarks[i], i);
                            vm.bookmarkedItems.push(article);
                        }
                    }
                }
            });
        }

        function showArticleContent(article) {
            newsService.showArticleContent(article.externalUrl).then(function (response) {
                article.htmlArticle = $sce.trustAsHtml(response.htmlContent);
                article.isLoaded = true;
            });
        }

        function selectBookmarkToRemove(row) {

            var i;
            var n;
            var isSelected = false;
            var item;
            var value;
            var action;

            vm.removeSelectedNews.length = 0;
            n = vm.bookmarkedItems.length;
            for (i = 0; i < n; i++) {
                item = vm.bookmarkedItems[i];
                if (row === item.rowId) {
                    value = item.isSelected;
                    action = item.actions[0];
                    if (value) {
                        action.icon = 'icon-radiobox-blank';
                        action.tooltip = 'Select';
                    } else {
                        action.icon = 'icon-radiobox-marked';
                        action.tooltip = 'Un-Select';
                    }
                    item.isSelected = !value;
                }
                if (item.isSelected) {
                    isSelected = true;
                    vm.removeSelectedNews.push(item);
                }
            }
            if (isSelected) {
                vm.setDeleteButtonDisableStatus(false);
            } else {
                vm.setDeleteButtonDisableStatus(true);
            }
        }
        vm.selectBookmarkToRemove = selectBookmarkToRemove;

        function setDeleteButtonDisableStatus(value) {
            vm.deleteButton.disabled = value;
        }
        vm.setDeleteButtonDisableStatus = setDeleteButtonDisableStatus;

        function deleteAction() {
            vm.deleteButton = {
                id: 1,
                callback: vm.deleteSelectedNews,
                icon: 'icon-delete',
                isclicked: null,
                disabled: true,
                tooltip: 'Remove Bookmark',
                type: 'button'
            };
            vm.deleteActions.push(vm.deleteButton);
        }

        function deleteSelectedNews() {
            newsBusiness.removeBookmark(vm.removeSelectedNews, function () {
                var i;
                var n;
                var index;
                n = vm.removeSelectedNews.length;
                for (i = 0; i < n; i++) {
                    index = vm.bookmarkedItems.indexOf(vm.removeSelectedNews[i]);
                    if (index > -1) {
                        vm.bookmarkedItems.splice(index, 1);
                    }
                }
                vm.removeSelectedNews.length = 0;
                vm.deleteButton.disabled = true;
            });
        }
        vm.deleteSelectedNews = deleteSelectedNews;

        commonBusiness.onMsg('reload-attachments', $scope, function () {
            loadAttachments();
        });

        deleteAction();
        loadAttachments();
    }

    /** @ngInject */
    function msNewsAttachmentDirective() {
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