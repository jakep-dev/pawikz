(function() {
    'use strict';

    angular
        .module('app.core')
        .controller('msNewsSearchController', msNewsSearchController)
        .directive('msNewsSearch', msNewsSearchDirective);

    function msNewsSearchController($scope, $attrs, DTColumnDefBuilder, DTColumnBuilder, $stateParams,
        DTOptionsBuilder, $mdDialog, commonBusiness, templateService, newsService, dialog, templateBusiness, $http, $element, $compile) {


        var vm = this;
        vm.tableDetails = [];
        vm.selectAttachment = [];
        vm.resultDetails = [];
        vm.value = $scope.value;
        vm.collapsed = false;
        vm.company = '';
        vm.articlesShown = '';
        vm.date = '';
        vm.period = '';
        vm.title = '';
        vm.summary = '';
        vm.sortVal = 'D';
        vm.isdisabled = false;
        vm.iscollapsible = $scope.iscollapsible;
        vm.isProcessComplete = $scope.isprocesscomplete;

        vm.toggleCollapse = toggleCollapse;
        vm.clearSelection = clearSelection;
        vm.closeDialog = closeDialog;
        vm.showInfo = showInfo;



        dataTableConfiguration();

        function toggleCollapse() {
            vm.collapsed = !vm.collapsed;
        }

        function clearSelection() {
            angular.forEach(vm.resultDetails, function(item) {
                if (item.isSelected) {
                    item.isSelected = false;
                }
            });
        }

        function closeDialog() {
            $mdDialog.hide();
        };

        function showInfo(event) {
            dialog.confirm('Are you sure you want to include the full text of the checked article(s) in your work-up?', '', event, {
                ok: {
                    name: 'yes',
                    callBack: function() {

                        toggleCollapse();

                        var selectAttachment = [];
                        _.each(vm.resultDetails, function(article) {

                            if (article.isSelected) {
                                //WS param requirement for articles
                                selectAttachment.push({
                                    step_id: commonBusiness.stepId,
                                    article_id: article.resourceId,
                                    title: article.title,
                                    article_url: article.externalUrl,
                                    dockey: angular.isUndefined(article.dockey) ? '' : article.dockey,
                                    collection: angular.isUndefined(article.collection) ? '' : article.collection,
                                });
                                // $scope.isdisabled = article.isSelected;
                            }

                        });

                        newsService.attachNewsArticles(commonBusiness.projectId, commonBusiness.userId, selectAttachment).then(
                            function(response) {
                                console.log(response);
                                commonBusiness.emitMsg('reload-news-attachments');
                            }
                        );

                        dialog.close();

                    }
                },
                cancel: {
                    name: 'no',
                    callBack: function() {
                        return false;
                    }
                }
            });
        }

        function actionHtml(data, type, full, meta) {

            vm.isSelected = full.isSelected;
            //var html = '<md-checkbox aria-label="select" value="\'' + vm.isSelected + '\'" ng-model="vm.tableDetails['+full.rowId+']" class="no-padding-margin" ng-change="newsSelection(vm.tableDetails)" checked="selected"></md-checkbox>';
            var html = '<md-checkbox aria-label="select" ng-model="vm.resultDetails[' + full.rowId + '].isSelected" class="no-padding-margin" ng-change="selectNews(this)" checked="selected"></md-checkbox>';

            return html;
        }

        function detailHtml(data, type, full, meta) {

            var titleValue = _.escape((full.title).replace(/(['"])/g, "\\$1"));
            return '<span><a href="" ng-click="open($event,\'' + titleValue + '\',\'' + full.externalUrl + '\')" value="{{full.title}}">' + full.title + '</a></span>' +
                '<span style="float:right;">' + full.pubDate + '</span><br>' +
                '<span><strong>' + full.resourceId + '</strong></span><br>' +
                '<span><strong>' + full.publisher + '</strong></span><br>' +
                '<span>' + full.summaryText + '</span>';
        }

        // Redraw datatable
        function redrawDataTable() {
            var oTable = $('#newsPageDetails').dataTable();
            // oTable.fnClearTable();
            oTable.fnDraw();
        }

        function recompileHtml(row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
        }

        function dataTableConfiguration() {
            //Defining column definitions
            console.log("checking table");
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
                //.withOption('order', [0, 'desc'])
                .withOption('initComplete', sort)
                .withPaginationType('full')
                // .withDOM('<"top"l<"#newsPageDetails_sort">f>rt<"bottom"ip><"clear">');
                .withDOM('<"top padding-10" <"left"<"length"l<"#newsPageDetails_sort">>><"right"f>>rt<"top"<"left"<"info text-bold"i>><"right"<"pagination"p>>>');


            // Defining columns for news
            vm.dtColumns = [
                // DTColumnBuilder.newColumn('', 'ssdsd'),
                // DTColumnBuilder.newColumn('Details', 'dsd')
            ];


        }

        $scope.selectNews = function() {
            var data = [];


            // _.each(vm.resultDetails, function(item) {
            //     if (item.isSelected) {
            //         $scope.isdisabled = item.isSelected;
            //     }
            // });

            angular.forEach(vm.resultDetails, function(item) {
                if (item.isSelected) {
                    $scope.isdisabled = item.isSelected;
                }
            });

            vm.selectAttachment = data;
        }

        function sort() {
            var html = '<label>Sort by:</label>' +
                '<select data-ng-options="o.name for o in options" ng-model="selectedOption" ng-change="onSortChange(selectedOption)"></select>';
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

        $scope.onSortChange = function(selectedOption) {
            vm.sortVal = selectedOption.value;
            redrawDataTable();
        }



        // Server Data callback for pagination
        function serverData(sSource, aoData, fnCallback, oSettings) {
            console.log("checking table serverData");
            var draw = aoData[0].value;
            var columns = aoData[1].value;
            // var sortOrder = aoData[2].value[0].dir;
            // var sortFilterIndex = aoData[2].value[0].column;
            // var sortFilter = columns[sortFilterIndex].data;
            var start = aoData[3].value;
            var length = aoData[4].value;
            // var searchFilter = aoData[5].value.value;
            var pageNo = (start / length) + 1;

            vm.isSelected = false;
            newsService.search(commonBusiness.companyId, commonBusiness.userId, pageNo, vm.sortVal, length).then(function(response) {
                //  newsService.search('1027378', '61973', '2', 'D').then(function(data){

                var blankData = {
                    //results: [{
                    rowId: '',
                    isSelected: '',
                    title: '',
                    resourceId: '',
                    publisher: '',
                    summaryText: '',
                    externalUrl: '',
                    pubDate: ''
                        //}]
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

                /*vm.tableDetails.push({
                    summary: {
                        company: vm.company,
                        articlesFound: vm.articlesFound,
                        articlesShown: vm.articlesShown,
                        date: vm.date,
                        period: vm.period
                    },
                    results: [vm.resultDetails]

                });*/

                var records = {
                    draw: draw,
                    recordsTotal: angular.isDefined(response) && angular.isDefined(response.summary) &&
                        (response.summary !== null) ? response.summary.articlesFound : 0,
                    recordsFiltered: angular.isDefined(response) && angular.isDefined(response.summary) &&
                        (response.summary !== null) ? response.summary.articlesFound : 0,
                    data: angular.isDefined(response) && angular.isDefined(response.results) &&
                        vm.resultDetails !== null ? vm.resultDetails : blankData
                };


                vm.isprocesscomplete = true;

                fnCallback(records);
            });
        }

        $scope.open = function(ev, title, exUrl) {
            dialog.notify(title, exUrl,
                null,
                null,
                null, null, false);
        };

        $scope.close = function() {
            $mdDialog.cancel();
        };
    }

    /** @ngInject */
    function msNewsSearchDirective($compile) {
        return {
            restrict: 'E',
            scope: {
                name: '@',
                isdisabled: '@'
            },
            controller: 'msNewsSearchController',
            controllerAs: 'vm',
            templateUrl: 'app/core/directives/ms-news/ms-news-search/ms-news-search.html'
        };
    }
})();