(function() {
    'use strict';

    angular
        .module('app.core')
        .controller('msNewsController', msNewsController)
        .directive('msNews', msNewsDirective);

    function msNewsController($scope,
                              commonBusiness, newsBusiness) {
        var vm = this;
        vm.actions = [];
        vm.resultDetails = [];
        vm.newsSearchTableId = $scope.mnemonicid + '_' +  $scope.itemid;
        vm.title = $scope.title;
        vm.searchName = $scope.searchName;
        vm.itemId = $scope.itemid;
        vm.mnemonicId = $scope.mnemonicid;

        function defineAction() {

            vm.actions.push({
                id: 1,
                callback: vm.clearSelection,
                icon: 'icon-eraser',
                isclicked: null,
                tooltip: 'Clear Selected Article',
                disabled: false,
                type: 'button'
            });
            vm.bookmarkButton = {
                id: 2,
                callback: vm.bookmarkNews,
                icon: 'icon-bookmark',
                isclicked: null,
                disabled: true,
                tooltip: 'Attach Checked Article',
                type: 'button'
            };
            vm.actions.push(vm.bookmarkButton);
        }

        function setBookmarkButtonDisableStatus(value) {
            vm.bookmarkButton.disabled = value;
        }
        vm.setBookmarkButtonDisableStatus = setBookmarkButtonDisableStatus;

        vm.initiateNewSearch = null;
        function registerNewsSearchCallback(callback) {
            vm.initiateNewSearch = callback;
        }
        vm.registerNewsSearchCallback = registerNewsSearchCallback;

        function onExpand() {
            if (vm.initiateNewSearch && (typeof (vm.initiateNewSearch) === 'function')) {
                vm.initiateNewSearch();
            }
        }
        vm.onExpand = onExpand;

        vm.newsSearchComplete = null;
        function registerExpandCompleteCallback(callback) {
            vm.newsSearchComplete = callback;
        }
        vm.registerExpandCompleteCallback = registerExpandCompleteCallback;

        function onSearchComplete() {
            if (vm.newsSearchComplete && (typeof (vm.newsSearchComplete) === 'function')) {
                vm.newsSearchComplete();
            }
        }
        vm.onSearchComplete = onSearchComplete

        vm.collapseAccordian = null;
        function registerCollapseAccordionCallback(callback) {
            vm.collapseAccordian = callback;
        }
        vm.registerCollapseAccordionCallback = registerCollapseAccordionCallback;

        function onBookmarkNewsArticleStart() {
            if (vm.collapseAccordian && (typeof (vm.collapseAccordian) === 'function')) {
                vm.collapseAccordian();
            }
        }
        vm.onBookmarkNewsArticleStart = onBookmarkNewsArticleStart;

        function onBookmarkNewsArticleComplete(selectAttachment) {
            commonBusiness.emitMsg('reload-attachments');
        }
        vm.onBookmarkNewsArticleComplete = onBookmarkNewsArticleComplete;

        function bookmarkNews() {
            newsBusiness.bookmarkNewsArticle(newsBusiness.selectedArticles, vm.onBookmarkNewsArticleStart, vm.onBookmarkNewsArticleComplete, vm.itemId, vm.mnemonicId);
        }
        vm.bookmarkNews = bookmarkNews;

        function clearSelection() {
                var item = _.find(newsBusiness.selectedArticles, {itemid: vm.itemId, mnemonicid: vm.mnemonicId, step_id: commonBusiness.stepId}); 
                if(item){
                     _.each(item.news_items, function (item) {
                         if (item.isSelected) {
                            item.isSelected = false;
                            setBookmarkButtonDisableStatus(true);
                        }   
                     });
                }
        }
        vm.clearSelection = clearSelection;

        defineAction();
    }

    /** @ngInject */
    function msNewsDirective($compile) {
        return {
            restrict: 'E',
            scope: {
                name: '@',
                mnemonicid: '@',
                itemid: '@',
                title: '@',
                searchName: '@',
                action: '@'
            },
            controller: 'msNewsController',
            controllerAs: 'vm',
            templateUrl: 'app/core/directives/ms-news/ms-news.html'
        };
    }
})();