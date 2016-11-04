(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('msStockTableController', msStockTableController)
        .directive('msStockTable', msStockTableDirective);


    function msStockTableController($scope)
    {
        
    }

    /** @ngInject */
    function msStockTableDirective($compile, stockService, commonBusiness, DTOptionsBuilder, DTColumnDefBuilder)
    {
        return {
            restrict : 'E',
            scope : {
                table: '='
            },
            templateUrl : 'app/core/directives/ms-chart/ms-stock-chart/table/ms-stock-table.html',
            controller : 'msStockTableController',
            link: defineStockTableLink
        };

        function defineStockTableLink($scope, el, header)
        {

            $scope.headerSelectAll = function(currentScope)
            {
                headerAllSelection(currentScope);
            };

            $scope.rowMakeSelection = function()
            {
                calculateHeaderSelection($scope);
            };

            $scope.showChildInfo = function(row, event)
            {
                showChildInfo($scope, row, event);
            };

            defineStockTable($scope, el, header);
        }

        function defineTableColumns($scope)
        {
            switch ($scope.table.source.value)
            {
                case 'SIGDEV' :
                    defineSigDevColumns($scope);
                    break;
                case 'MASCAD' :
                    defineMSCAdColumns($scope);
                    break;
                default:
                    break;
            }

        }

        function defineSigDevColumns($scope)
        {
            $scope.columns = [];

            $scope.columns.push({
                header : 'Event Date',
                key : 'dateAnncd'
            });

            $scope.columns.push({
                header : 'Event Summary',
                key : 'devhHeadline'
            });
        }



        function defineMSCAdColumns($scope)
        {
            $scope.columns = [];

            $scope.columns.push({
                header : 'Company Name',
                key : 'companyName'
            });

            $scope.columns.push({
                header : 'Filing/Accident Date',
                key : 'dateFiling'
            });

            $scope.columns.push({
                header : 'Start Date',
                key : 'classPeriodStart'
            });

            $scope.columns.push({
                header : 'End Date',
                key : 'classperiodEnd'
            });

            $scope.columns.push({
                header : 'Status',
                key : 'status'
            });

            $scope.columns.push({
                header : 'Disposition Date',
                key : 'dispositionDate'
            });

            $scope.columns.push({
                header : 'Total Amount',
                key : 'settlementAmount'
            });

            $scope.columns.push({
                header : 'MSCAd Id',
                key : 'mascadId'
            });

            $scope.columns.push({
                header : 'Type',
                key : 'caseType'
            });
        }

        function defineStockTable($scope, el, header)
        {
            
            $scope.dtInstance = {};
            $scope.isTableShow = true;
            $scope.IsAllChecked = false;
            var html = '<table id="stock-table" ng-show="isTableShow" width="100%" dt-instance="dtInstance" dt-options="dtOptions" ' +
                'class="row-border hover highlight cell-border" ' +
                'dt-column-defs="dtColumnDefs" ' +
                'datatable="ng" cellpadding="1" cellspacing="0">';

            $scope.dtColumnDefs = [];
            $scope.dtOptions = DTOptionsBuilder.newOptions();
                
            $scope.dtOptions.withOption('processing', false)
                            .withOption('paging', true)
                            .withOption('filter', false)
                            .withOption('autoWidth', true)
                            .withOption('info', true)
                            .withOption('responsive', true)
                            .withDOM('<"top padding-10" <"left"<"length"l>><"right"f>>rt<"top"<"left"<"info text-bold"i>><"right"<"pagination"p>>>');

            var sortedColumn = 0;
            switch($scope.table.source.value)
            {
                case 'SIGDEV' : 
                      sortedColumn = 0;
                      break;
                case 'MASCAD' :
                      sortedColumn = 1;
                      break;
                default : break; 
            }

            if($scope.table.isDefaultChart)
            {
                $scope.dtColumnDefs.push(DTColumnDefBuilder.newColumnDef(0).notSortable());
                sortedColumn = sortedColumn + 1;
            }

            $scope.dtOptions.withOption('sorting', [sortedColumn, 'desc']);

            //Defining the header here.
            defineTableColumns($scope);
            html += defineHeaderLayout($scope);
            html += defineBodyLayout($scope);
            html += '</table>';

            el.find('#ms-stock-table').append($compile(html)($scope));
        }

        function defineHeaderLayout($scope)
        {
            var html = '';

            html += '<thead>';
            html += '<tr class="md-light-blue-A100-bg">';
            
            if($scope.table.isDefaultChart)
            {
               html += '<th><md-checkbox ng-change="headerSelectAll(this)" ng-model="IsAllChecked" aria-label="select all" ' +
                    'class="no-padding-margin"></md-checkbox></th>';
            }

            angular.forEach($scope.columns, function(column)
            {
                html += '<th><span><strong>'+column.header+'</strong></span></th>';
            });

            html += '</tr>';
            html += '</thead>';

            return html;
        }

        function defineBodyLayout($scope)
        {
            var html = '';

            html += '<tbody>';
            html += '<tr ng-repeat="row in table.rows">';
            
            if($scope.table.isDefaultChart)
            {
                html += '<td><md-checkbox aria-label="select" ng-change="rowMakeSelection();" ng-model="row.IsChecked"' +
                                    'class="no-padding-margin"></md-checkbox></td>';
            }

            angular.forEach($scope.columns, function(column)
            {
                html += '<td ng-click="showChildInfo(row,$event)">{{row.' + column.key + '}}';
            });

            html += '</tr>';
            html += '</tbody>';

            return html;
        }

        ///Get the child details for the specific row
        function showChildInfo($scope, row, event)
        {
            var newScope = $scope.$new(true);
            newScope.data = {};

            switch($scope.table.source.value){
                case 'SIGDEV':

                    stockService.getSignificantDevelopmentDetail(row.sigDevId)
                    .then(function(response){

                        if(response.detail){
                            newScope.data.detail = response.detail;
                        }else{
                            newScope.data.detail = "No Data Available";
                        }
                    });

                break;

                case 'MASCAD':

                    stockService.getMascadLargeLosseDetail(row.mascadId)
                    .then(function(response){
                        
                        if(response.detail){
                            newScope.data.detail = response.detail;
                        }else{
                            newScope.data.detail = "No Data Available";
                        }
                    });
                break;

            }

            var link = angular.element(event.currentTarget),
            tr = link.parent(),
            table = $scope.dtInstance.DataTable,
            row = table.row(tr);

            if (row.child.isShown()) {
                row.child.hide();
            }
            else {
                row.child($compile('<ms-stock-table-ci></ms-stock-table-ci>')(newScope)).show();
            }
        }

        function calculateHeaderSelection($scope)
        {
            $scope.IsAllChecked = false;
            var unSelected = _.filter($scope.table.rows, function(eachRow)
            {
                if(eachRow.IsChecked === false)
                {
                    return eachRow;
                }
            })

            if(unSelected && unSelected.length > 0)
            {
                $scope.IsAllChecked = false;
            }
            else {
                $scope.IsAllChecked = true;
            }
        }

        function headerAllSelection($scope)
        {
            angular.forEach($scope.table.rows, function(eachRow)
            {
                if(eachRow.IsChecked !== $scope.IsAllChecked)
                {
                    eachRow.IsChecked = $scope.IsAllChecked;
                }
            });
        }
    }

})();