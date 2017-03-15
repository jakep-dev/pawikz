(function() {
    'use strict';

    angular
        .module('app.core')
        .controller('msNewsSearchController', msNewsSearchController)
        .directive('msNewsSearch', msNewsSearchDirective);

    function msNewsSearchController($scope, $attrs, DTColumnDefBuilder, DTColumnBuilder, $stateParams,
        DTOptionsBuilder, $mdDialog, commonBusiness, newsBusiness, templateService, newsService, dialog, templateBusiness, $http, $element, $compile) {

        var vm = this;
        var validate = false;

        vm.resultDetails = [];
        vm.company = '';
        vm.articlesFound = '';
        vm.articlesShown = '';
        vm.date = '';
        vm.period = '';
        vm.sortVal = 'D';
        vm.loadData = null;
        vm.loadingValue = null;
        vm.reloadValue = false;
        vm.collapseSearch = $scope.collapseSearch;

        vm.bookmarkNews = bookmarkNews;
        vm.showArticleDetails = showArticleDetails;
        vm.onSortChange = onSortChange;
        vm.newsSelection = newsSelection;
        vm.initialize = initialize;

        //Make initial call
        initialize();

        function initialize()
        {
            disabledBookmarkIcon();
            dataTableConfiguration();
            
        }

        commonBusiness.onMsg('search-result-expand', $scope, function(ev) {

            vm.loadData = true;
            if(!vm.reloadValue){
                redrawDataTable();
            }
            
            initialize();  
            
        });

        commonBusiness.onMsg('-Bookmark', $scope, function(ev) {
            bookmarkNews();
        });

        commonBusiness.onMsg('-Clear', $scope, function(ev) {
            clearSelection();   
        });

        function disabledBookmarkIcon(){
            angular.forEach($scope.$parent.$parent.actions, function(action){
                if(action.id == 2){ 
                    action.disabled = true;
                }
            });
        }

        function toggleCollapse() {
            vm.collapsed = !vm.collapsed;
        }

        function clearSelection() {
            _.each(vm.resultDetails, function(item) {
                if (item.isSelected) {
                    item.isSelected = false;
                    disabledBookmarkIcon();
                }
            });
        }

        function newsSelection() {
            
            disabledBookmarkIcon();
            
            _.each(vm.resultDetails, function(item) {
                if (item.isSelected) {
                    angular.forEach($scope.$parent.$parent.actions, function(action){
                        if(action.id == 2){ 
                            action.disabled = false;
                        }
                    });
                }
            });
        }

        function closeDialog() {
            $mdDialog.hide();
        };

        function bookmarkNews() {
            newsBusiness.bookmarkNewsArticle(vm.resultDetails, vm.collapseSearch);
        }

        function actionHtml(data, type, full, meta) {

            vm.isSelected = full.isSelected;
            var html = '<md-checkbox aria-label="select" ng-model="vm.resultDetails[' + full.rowId + '].isSelected" class="no-padding-margin" checked="selected" ng-change="vm.newsSelection(this)"></md-checkbox>';

            return html;
        }

        function detailHtml(data, type, full, meta) {

            var titleValue = _.escape((full.title).replace(/(['"])/g, "\\$1"));
            return '<span><a href="" ng-click="vm.showArticleDetails($event,\'' + titleValue + '\',\'' + full.externalUrl + '\')" value="{{full.title}}">' + full.title + '</a></span>' +
                '<span style="float:right;">' + full.pubDate + '</span><br>' +
                '<span><strong>' + full.resourceId + '</strong></span><br>' +
                '<span><strong>' + full.publisher + '</strong></span><br>' +
                '<span>' + full.summaryText + '</span>';
        }

        // Redraw datatable
        function redrawDataTable() {
            var oTable = $('#newsPageDetails').dataTable();
            oTable.fnDraw();
        }

        function recompileHtml(row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
        }

        function dataTableConfiguration() {
            //Defining column definitions
            vm.dtColumnDefs = [
                DTColumnDefBuilder.newColumnDef(0).renderWith(actionHtml).withClass('checkbox-column').notSortable(),
                DTColumnDefBuilder.newColumnDef(1).renderWith(detailHtml).notSortable(),
            ];

            //News DataTable Configuration
            vm.dtOptions = DTOptionsBuilder
                .newOptions()
                .withFnServerData(serverData)
                .withDataProp('data')
                .withOption('processing', true)
                .withOption('serverSide', true)
                .withOption('paging', true)
                .withOption('autoWidth', true)
                .withOption('responsive', true)
                .withOption('stateSave', true)
                .withOption('order', false)
                .withOption('createdRow', recompileHtml)
                .withOption('initComplete', sort)
                .withPaginationType('full')
                .withDOM('<"top padding-10" <"left"<"length"l<"#newsPageDetails_sort">>><"right"f>>rt<"top"<"left"<"info text-bold"i>><"right"<"pagination"p>>>');
        }

        function sort() {
            var html = '<label style="padding-left: 15px;">Sort by:</label>' +
                '<select data-ng-options="o.name for o in options" ng-model="selectedOption" ng-change="vm.onSortChange(selectedOption)"></select>';
            $element.find('#newsPageDetails_sort').append($compile(html)($scope));

            $scope.options = [{
                    name: "Newest",
                    value: 'D',
                    id: 1
                },
                {
                    name: "Relevance",
                    value: 'R',
                    id: 2
                }
            ];

            $scope.selectedOption = $scope.options[0];
        }

        function onSortChange(selectedOption) {
            vm.sortVal = selectedOption.value;
            redrawDataTable();
        }

        // Server Data callback for pagination
        function serverData(sSource, aoData, fnCallback, oSettings) {

            var draw = aoData[0].value;
            var columns = aoData[1].value;
            var start = aoData[3].value;
            var length = aoData[4].value;
            var searchFilter = aoData[5].value.value;
            var pageNo = (start / length) + 1;

            if(vm.loadData){
                newsService.search(commonBusiness.companyId, commonBusiness.userId, pageNo, vm.sortVal, searchFilter, length, vm.searchName).then(function(response) {

                    var blankData = {
                        rowId: '',
                        isSelected: '',
                        title: '',
                        resourceId: '',
                        publisher: '',
                        summaryText: '',
                        externalUrl: '',
                        pubDate: ''
                    };

                    vm.company = response.summary.company;
                    vm.articlesFound = response.summary.articlesFound;
                    vm.articlesShown = response.summary.articlesShown;
                    vm.date = response.summary.dateTime;
                    vm.period = response.summary.searchPeriod;

                    vm.resultDetails = [];
                    angular.forEach(response.results, function(details, index) {

                        vm.resultDetails.push({
                            rowId: index,
                            isSelected: false,
                            title: details.title,
                            resourceId: details.resourceId,
                            publisher: details.publisher,
                            summaryText: details.summaryText,
                            externalUrl: details.externalUrl,
                            pubDate: details.pubDate
                        });
                    });

                    var records = {
                        draw: draw,
                        recordsTotal: angular.isDefined(response) && angular.isDefined(response.summary) &&
                            (response.summary !== null) ? response.summary.articlesFound : 0,
                        recordsFiltered: angular.isDefined(response) && angular.isDefined(response.summary) &&
                            (response.summary !== null) ? response.summary.articlesFound : 0,
                        data: angular.isDefined(response) && angular.isDefined(response.results) &&
                            vm.resultDetails !== null ? vm.resultDetails : blankData
                    };

                    commonBusiness.emitMsg('load-search-result');

                    fnCallback(records);
                });
            }
        }

        function showArticleDetails(ev, title, exUrl) {

            newsBusiness.showArticleContent(title, exUrl);
        }
    }

    /** @ngInject */
    function msNewsSearchDirective($compile) {
        return {
            restrict: 'E',
            scope: {
                searchName: '@',
                collapseSearch : '@'
            },
            controller: 'msNewsSearchController',
            controllerAs: 'vm',
            templateUrl: 'app/core/directives/ms-news/ms-news-search/ms-news-search.html',
            bindToController: true 
        };
    }
})();