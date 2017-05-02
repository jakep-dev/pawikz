(function() {
    'use strict';

    angular
        .module('app.core')
        .controller('msAnalystReportsController', msAnalystReportsController)
        .directive('msAnalystReports', msAnalystReportsDirective);

    function msAnalystReportsController($scope, $compile, $window,
                                        dialog, clientConfig, commonBusiness, reportsService,
                                        DTColumnBuilder, DTColumnDefBuilder, DTOptionsBuilder) {
        var vm = this;

        vm.reloadValue = false;

        vm.downloadLink = downloadLink;
        vm.previewReport = previewReport;
        vm.startGetList = startGetList;
        vm.getListComplete = $scope.getListComplete;
        vm.registerGetListCallback = $scope.registerGetListCallback;
        

        initialize();

        if (vm.registerGetListCallback) {
            vm.registerGetListCallback(vm.startGetList);
        }

        function initialize(){
            dataTableConfiguration();
        }

        function startGetList() {
            vm.loadData = true;
            if (!vm.reloadValue) {
                vm.reloadValue = true;
                redrawDataTable();
                initialize();
            } else {
                if (vm.getListComplete) {
                    vm.getListComplete();
                }
            }
        }

        function dataTableConfiguration() {
            vm.dtInstance = null;            
            
            vm.dtColumnDefs = [
                DTColumnDefBuilder.newColumnDef(1).renderWith(titleHtml)
            ];
            
            vm.dtColumns = [    
                DTColumnBuilder.newColumn('price', 'Price'),
                DTColumnBuilder.newColumn('headline', 'Report Title'),
                DTColumnBuilder.newColumn('storyDate', 'Date'),
                DTColumnBuilder.newColumn('broker', 'Contributor'),
                DTColumnBuilder.newColumn('analyst', 'Author'),
                DTColumnBuilder.newColumn('pages', 'Pages'),
                DTColumnBuilder.newColumn('language', 'Language')
            ];
            
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
                .withOption('filter', false)
                .withOption('createdRow', recompileHtml)
                .withPaginationType('full')
                .withDOM('<"top padding-10" <"left"<"length"l>><"right"f>>rt<"top padding-10"<"left"<"info text-bold"i>><"right"<"pagination"p>>>');
        }

        function redrawDataTable() {
            vm.dtInstance.dataTable._fnDraw();
        }

        function recompileHtml(row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
        }

        function titleHtml(data, type, full, meta) {
            return '<span>' +
                        '<a href="#" ng-click="vm.previewReport(' + full.index + ')"> ' +
                            '<i class="fa fa-search s16"></i> ' +
                        '</a> ' +
                        '<a href="#" ng-click="vm.downloadLink(' + full.index + ')"> ' +
                            data  + 
                        '</a> ' +
                    '</span>';
        }

        // Server Data callback for pagination
        function serverData(sSource, aoData, fnCallback, oSettings) {

            var draw = aoData[0].value;
            //var columns = aoData[1].value;
            var start = aoData[3].value;
            var length = aoData[4].value;
            //var searchFilter = aoData[5].value.value;
            var pageNo = (start / length) + 1;

            if(vm.loadData){
                reportsService.get(commonBusiness.companyId, commonBusiness.userId, length, pageNo).then(function(response) {

                    var blankData = {
                        price: '',
                        previewURL: '', 
                        title: '',
                        docURL: '', 
                        date: '', 
                        contributor: '', 
                        author: '', 
                        pages: '', 
                        language: '' 
                    };

                    vm.analystReportsList = [];
                    vm.identifierId = response.identifier_id;
                    vm.identifierType = response.identifier_type;
                    if(response && response.reports) {
                        _.each(response.reports, function(report, index){
                            if(report) {
                                report.index = index;
                                vm.analystReportsList.push(report);
                            }
                        });
                    }

                    if(response && response.summary) {
                        vm.company = response.summary.company || '';
                        vm.reportsFound = response.summary.found || '';
                        vm.date = response.summary.dateTime || '';
                        vm.articlesShown = response.summary.articlesShown || '';
                    }

                    var records = {
                        draw: draw,
                        recordsTotal: angular.isDefined(response) && angular.isDefined(response.summary) &&
                            (response.summary.found) ? response.summary.found : 0,
                        recordsFiltered: angular.isDefined(response) && angular.isDefined(response.summary) &&
                            (response.summary.found) ? response.summary.found : 0,
                        data: angular.isDefined(response.reports) && angular.isDefined(response.reports) &&
                            response.reports !== null ? vm.analystReportsList : blankData
                    };

                    if (vm.getListComplete) {
                        vm.getListComplete();
                    }
                    fnCallback(records);
                });
            }
        }

        function previewReport(index) {
            var report = _.find(vm.analystReportsList, {index: index});
            if(report) {
                reportsService.getPreviewReport(report.previewURL, commonBusiness.userId).then(function(response) {

                    // error on direct insert of the html string
                    // get the main content and insert on the popup window
                    var html = response.html;
                    var search = 'fdsspan';
                    var content = html.substring(html.indexOf('<' + search), html.indexOf('</' + search) + search.length + 2);
                    dialog.notify('Preview', null,
                        content,
                        null,
                        null, null, false);
                });
            }
        }

        function downloadLink(index) {
            var report = _.find(vm.analystReportsList, {index: index});
            if(report) {
                if(report.price.length > 0  && report.price.toUpperCase() !== 'FREE') {
                    dialog.confirm(clientConfig.messages.analystReports.title, 
                                    clientConfig.messages.analystReports.content.replace('@price', report.price) , null, {
                        ok: {
                            name: 'yes',
                            callBack: function() {
                                getPDFLink(report);
                            }
                        },
                        cancel: {
                            name: 'no',
                            callBack: function() {
                                return false;
                            }
                        }
                    });
                } else {
                    getPDFLink(report);
                }
            }
            
            
        }

        function getPDFLink(report) {
            reportsService.getPDFLink(commonBusiness.userId, commonBusiness.companyId,
                vm.identifierId, vm.identifierType, report).then(function(response) {
                    var win = $window.open(response.url, '_blank');
            });
        }
    }

    /** @ngInject */
    function msAnalystReportsDirective() {
        return {
            restrict: 'E',
            scope: {
                getListComplete: '=',
                registerGetListCallback: '='
            },
            controller: 'msAnalystReportsController',
            controllerAs: 'vm',
            templateUrl: 'app/core/directives/ms-reports/ms-analyst-reports/ms-analyst-reports.html'
        };
    }
})();