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
                DTColumnBuilder.newColumn('title', 'Report Title'),
                DTColumnBuilder.newColumn('date', 'Date'),
                DTColumnBuilder.newColumn('contributor', 'Contributor'),
                DTColumnBuilder.newColumn('author', 'Author'),
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
                .withOption('createdRow', recompileHtml)
                .withPaginationType('full')
                .withDOM('<"top padding-10" <"left"<"length"l>><"right"f>>rt<"top"<"left"<"info text-bold"i>><"right"<"pagination"p>>>');
        }

        function redrawDataTable() {
            vm.dtInstance.dataTable._fnDraw();
        }

        function recompileHtml(row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
        }

        function titleHtml(data, type, full, meta) {
            return '<span>' +
                        '<a href="#"  target="_blank"> ' +
                            '<i class="fa fa-search s16"></i> ' +
                        '</a> ' +
                        '<a href="#" ng-click="vm.downloadLink(\'' + full.price + '\', \'' + full.downloadURL+ '\')"> ' +
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

                    vm.company = response.summary.company || '';
                    vm.reportsFound = response.summary.found || '';
                    vm.date = response.summary.dateTime || '';
                    vm.articlesShown = response.summary.articlesShown || '';

                    var blankData = {
                        price: '',
                        previewURL: '', 
                        title: '',
                        downloadURL: '', 
                        date: '', 
                        contributor: '', 
                        author: '', 
                        pages: '', 
                        language: '' 
                    };

                    var records = {
                        draw: draw,
                        recordsTotal: angular.isDefined(response) && angular.isDefined(response.summary) &&
                            (response.summary.found) ? response.summary.found : 0,
                        recordsFiltered: angular.isDefined(response) && angular.isDefined(response.summary) &&
                            (response.summary.found) ? response.summary.found : 0,
                        data: angular.isDefined(response.reports) && angular.isDefined(response.reports) &&
                            response.reports !== null ? response.reports : blankData
                    };

                    if (vm.getListComplete) {
                        vm.getListComplete();
                    }
                    fnCallback(records);
                });
            }
        }

        function downloadLink(price, link) {

            if(price.length > 0  && price.toUpperCase() !== 'FREE') {
                dialog.confirm(clientConfig.messages.analystReports.title, 
                                clientConfig.messages.analystReports.content.replace('@price', price) , null, {
                    ok: {
                        name: 'yes',
                        callBack: function() {
                            goToLink(link);
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
                goToLink(link);
            }
            
        }

        function goToLink(link) {
            console.log(link);
            var win = $window.open(link, '_blank');
            win.focus();
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