(function() {
    'use strict';

    angular
        .module('app.core')
        .controller('msAnalystReportsController', msAnalystReportsController)
        .directive('msAnalystReports', msAnalystReportsDirective);

    function msAnalystReportsController($scope, $compile, $window, $timeout,
                                        dialog, clientConfig, reportsService,
                                        templateBusinessFormat, commonBusiness,
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
            var table = vm.dtInstance.DataTable;
            vm.loadData = true;
            if (!vm.reloadValue) {
                vm.reloadValue = true;
                vm.isProcessing = true;
                reportsService.get(commonBusiness.companyId, commonBusiness.userId).then(function(response) {
                            
                    vm.analystReportsList = [];
                    vm.identifierId = response.identifier_id;
                    vm.identifierType = response.identifier_type;
                    if(response && response.reports) {
                        _.each(response.reports, function(report, index){
                            if(report) {
                                report.index = index;
                                report.isFree = report.price && report.price.length > 0  && report.price.toUpperCase() === 'FREE';
                                report.priceSort = (report.isFree)? 0 : parseInt(report.price);
                                report.storyDateSort = templateBusinessFormat.parseDate(report.storyDate, 'MM-DD-YYYY');
                                vm.analystReportsList.push(report);
                            }
                        });
                    }

                    console.log(vm.analystReportsList);

                    if(response && response.summary) {
                        vm.company = response.summary.company || '';
                        vm.reportsFound = response.summary.found || '';
                        vm.date = response.summary.dateTime || '';
                        vm.reportsShown = response.summary.articlesShown || '';
                    }

                    vm.isProcessing = false;

                    if (vm.getListComplete) {
                        vm.getListComplete();
                    }
                });
            } else {
                if (vm.getListComplete) {
                    vm.getListComplete();
                }
            }
        }

        function dataTableConfiguration() {
            vm.dtInstance = null;            
            
            vm.dtOptions = DTOptionsBuilder
                .newOptions()
                .withOption('processing', true)
                .withOption('paging', true)
                .withOption('autoWidth', true)
                .withOption('responsive', true)
                .withOption('stateSave', true)
                .withOption('filter', false)
                .withOption('createdRow', recompileHtml)
                .withOption('drawCallback', function() {
                    getReportsShown(vm)
                })
                .withPaginationType('full')
                .withDOM('<"top padding-10" <"left"<"length"l>><"right"f>>rt<"top padding-10"<"left"<"info text-bold"i>><"right"<"pagination"p>>>');
        }

        function redrawDataTable() {
            vm.dtInstance.dataTable._fnDraw();
        }

        function getReportsShown(vm) {
            $timeout(function(){
                var table = vm.dtInstance.DataTable;
                var tableInfo = table && table.page && table.page.info();
                if(tableInfo && vm.isProcessing === false) {
                    vm.reportsShown = (tableInfo.start + 1) + '-' + tableInfo.end;
                }
            }, 500);
        }

        function recompileHtml(row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
        }

        function previewReport(report) {
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

        function downloadLink(report) {
            if(report) {
                if(!report.isFree) {
                    dialog.confirm(clientConfig.messages.analystReports.title, 
                                    clientConfig.messages.analystReports.content.replace('@price', '$' + report.price) , null, {
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