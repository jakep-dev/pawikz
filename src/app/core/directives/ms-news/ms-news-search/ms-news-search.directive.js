(function() {
    'use strict';

    angular
        .module('app.core')
        .controller('MsNewsSearchController', MsNewsSearchController)
        .directive('msNewsSearch', msNewsSearchDirective);

    /** @ngInject */
    function MsNewsSearchController($scope, $element, $compile, $mdDialog, $interval,
                                    DTColumnDefBuilder, DTOptionsBuilder, 
                                    commonBusiness, newsBusiness, newsService) {
        var vm = this;
        var validate = false;

        vm.resultDetails = $scope.resultDetails;
        vm.company = '';
        vm.articlesFound = '';
        vm.articlesShown = '';
        vm.date = '';
        vm.period = '';
        vm.sortVal = 'D';
        vm.loadData = null;
        vm.loadingValue = null;
        vm.reloadValue = false;
        vm.newsSearchTableId = '_' + $scope.newsSearchTableId;
        vm.attachments = [];

        vm.showArticleDetails = showArticleDetails;
        vm.onSortChange = onSortChange;
        vm.newsSelection = newsSelection;
        vm.initialize = initialize;

        vm.registerNewsSearchCallback = $scope.registerNewsSearchCallback;
        vm.onSearchComplete = $scope.onSearchComplete;
        vm.setBookmarkButtonDisableStatus = $scope.setBookmarkButtonDisableStatus;

        //Make initial call
        initialize();

        function initialize()
        {
            vm.setBookmarkButtonDisableStatus(true);
            dataTableConfiguration();
        }

        commonBusiness.onMsg('load-news-search', $scope, function(){
            startSearch();
        });

        function startSearch() {
            vm.loadData = true;
            if (!vm.reloadValue) {
                vm.reloadValue = true;
                redrawDataTable();
                initialize();
            } else {
                if (vm.onSearchComplete) {
                    vm.onSearchComplete();
                }
            }
        }
        vm.startSearch = startSearch;
        if (vm.registerNewsSearchCallback) {
            vm.registerNewsSearchCallback(vm.startSearch);
        }

        function toggleCollapse() {
            vm.collapsed = !vm.collapsed;
        }

        function newsSelection() {
            var selected = false;

            vm.setBookmarkButtonDisableStatus(true);

            _.each(vm.resultDetails, function(item) {
                if (item.isSelected) {
                    vm.attachments.push(item);
                    selected = true;
                }
                newsBusiness.selectedArticles.push.apply(newsBusiness.selectedArticles, vm.attachments);
            }); 
            if (selected) {
                vm.setBookmarkButtonDisableStatus(false);
            }
        }

        function closeDialog() {
            $mdDialog.hide();
        };

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
            var oTable = $element.find('#' + 'T_' + $scope.newsSearchTableId).dataTable();
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
                .withDOM('<"top padding-10" <"left"<"length"l<"#' + vm.newsSearchTableId + '_sort">>><"right"f>>rt<"top"<"left"<"info text-bold"i>><"right"<"pagination"p>>>');
        }

        function sort() {
            var html = '<label style="padding-left: 15px;">Sort by:</label>' +
                '<select data-ng-options="o.name for o in options" ng-model="selectedOption" ng-change="vm.onSortChange(selectedOption)"></select>';
            $element.find('#' + vm.newsSearchTableId + '_sort').append($compile(html)($scope));
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
                newsService.search(commonBusiness.companyId, commonBusiness.userId, pageNo, vm.sortVal, searchFilter, length, $scope.searchName).then(function(response) {

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

                    vm.resultDetails.length = 0;
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
                    if (vm.onSearchComplete) {
                        vm.onSearchComplete();
                    }
                    fnCallback(records);
                });
            }
        }

        function showArticleDetails(ev, title, exUrl) {
            newsBusiness.showArticleContent(title, exUrl);
        }

        function insertTable() {
            var element = $element.find('#newsPageDetails #ms-accordion-content');
            if (element[0]) {
                var html;
                var id = 'T_' + $scope.newsSearchTableId;
                html = '<table class="row-border cell-border table-bordered" ms-export width="100%" id="' + id + '" layout-padding datatable="" dt-options="vm.dtOptions" dt-column-defs="vm.dtColumnDefs"></table>';
                element.append($compile(html)($scope));
                //var e = $('#' + id);
                //console.log(e[0]);
            }
        }

        var promise = $interval(
            function () {
                var element = $element.find('#newsPageDetails #ms-accordion-content');
                if (element[0]) {
                    insertTable();
                    $interval.cancel(promise);
                } else {
                    console.log('waiting for new-search-accordian to be created.');
                }
            },
            50
        );
    }

    /** @ngInject */
    function msNewsSearchDirective() {
        return {
            restrict: 'E',
            scope: {
                resultDetails: '=',
                registerNewsSearchCallback: '=',
                onSearchComplete: '=',
                setBookmarkButtonDisableStatus: '=',
                newsSearchTableId: '=',
                searchName: '@'
            },
            controller: 'MsNewsSearchController',
            controllerAs: 'vm',
            templateUrl: 'app/core/directives/ms-news/ms-news-search/ms-news-search.html'
        };
    }
})();