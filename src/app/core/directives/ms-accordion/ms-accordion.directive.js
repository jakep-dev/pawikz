/**
 * Created by sherindharmarajan on 11/24/15.
 */
(function() {
    'use strict';

    angular
        .module('app.core')
        .controller('MsAccordionController', MsAccordionController)
        .directive('msAccordion', msAccordionDirective)


    function MsAccordionController($scope, $attrs, commonBusiness, newsBusiness) {
        var vm = this;

        vm.iscollapsed = $scope.initialCollapsed;
        vm.isExpandable = $scope.isExpandable;
        vm.actions = $scope.actions;
        vm.titleClass = $scope.titlebg || 'md-amber-A200-bg';
        vm.isProcessComplete = true;
        vm.showRadioButtonForBookmark = false;
        vm.isselectBookmark= false;
        vm.removeAttachment = [];

        vm.applyClickEvent = applyClickEvent;
        vm.loadSearchResult = loadSearchResult;
        vm.selectBookmarkToRemove = selectBookmarkToRemove;
        vm.removeSelectedBookmarkChk = removeSelectedBookmarkChk;

        init();

        if($scope.collapseSearchResult != null){
            
            commonBusiness.onMsg($scope.collapseSearchResult, $scope, function(ev) {
                toggleCollapse();
            });
        }

        commonBusiness.onMsg('remove-bookmark', $scope, function() {
            removeSelectedBookmarkChk();
        });

        commonBusiness.onMsg('load-search-result', $scope, function(ev) {
           vm.isProcessComplete = true;
        });

        //Toggle the collapse
        function loadSearchResult() {

            vm.iscollapsed  = !vm.iscollapsed ;

            if(!vm.iscollapsed  && $scope.expandSearchResult != null){
                
                vm.isProcessComplete = false;
                commonBusiness.emitMsg('search-result-expand');
            }

            doExpandOrCollapse();
        }

        function toggleCollapse(){
            vm.iscollapsed  = !vm.iscollapsed;
        }

        function doExpandOrCollapse(){
            $scope.expandSearchResult = null;
        }


        function init() {
            if (!vm.isExpandable) {
                vm.iscollapsed  = false;
            }

            if ($scope.collapseSearchResult != null) {   
                vm.isProcessComplete = true;
                toggleCollapse();
            }

            if ($scope.removeBookmarkEvent != null) {
                vm.showRadioButtonForBookmark = !vm.showRadioButtonForBookmark;
            } 
        }

        function removeSelectedBookmarkChk(){
            if(vm.isselectBookmark){
                _.each(newsBusiness.removeselectedNews, function(item) {

                    if ($scope.index === item.rowId && item.isSelected === vm.isselectBookmark) {
                        item.isSelected = false;
                        vm.articleIndex = $scope.index;
                        vm.removeAttachment[vm.articleIndex] = true;
                        disabledDeleteIcon();
                        commonBusiness.emitMsg('news-bookmark');
                    }
                });
            }
        }

        function selectBookmarkToRemove(){
            
            vm.isselectBookmark = !vm.isselectBookmark;

            disabledDeleteIcon();

                _.each(newsBusiness.selectedNews, function(item) {
                    
                    if ($scope.index === item.rowId) {
                        item.isSelected = vm.isselectBookmark;
                    }

                    if(item.isSelected){
                       var actions = $scope.$parent.$parent.$parent.$parent.$parent.actions;
                        angular.forEach(actions, function(action){
                            action.disabled = false;
                        });
                    }
                });

                vm.selectBookmark = newsBusiness.selectedNews;
                newsBusiness.removeselectedNews.push.apply(newsBusiness.removeselectedNews, newsBusiness.selectedNews);
        }

        function disabledDeleteIcon(){

            var actions = $scope.$parent.$parent.$parent.$parent.$parent.actions;
            angular.forEach(actions, function(action){
                action.disabled = true;
            });
        }



        function applyClickEvent(action, $mdOpenMenu, ev) {
            if (action) {
                if (action.type === 'button' && action.callback) {
                    commonBusiness.emitMsg(action.callback);
                } else if (action.type === 'menu') {
                    $mdOpenMenu(ev);
                }

                if (action.isclicked !== null) {
                    action.isclicked = !action.isclicked;
                }
            }
        }
    }

    /** @ngInject */
    function msAccordionDirective() {
        return {
            restrict: 'E',
            scope: {
                title: '@',
                initialCollapsed: '=?collapsed',
                titlebg: '@',
                isExpandable: '=?',
                actions: '=',
                index: '=',
                row: '=',
                removeBookmarkEvent: '@',
                collapseSearchResult: '@',
                expandSearchResult: '@'
            },
            controller: 'MsAccordionController',
            controllerAs: 'vm',
            templateUrl: 'app/core/directives/ms-accordion/ms-accordion.html',
            transclude: true
        };
    }

})();