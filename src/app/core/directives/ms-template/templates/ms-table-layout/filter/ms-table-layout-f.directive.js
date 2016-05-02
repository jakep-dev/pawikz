(function ()
{
    'use strict';

    angular
        .module('app.core')
        .directive('msTablelayoutF', msTablelayoutFDirective);


    /** @ngInject */
    function msTablelayoutFDirective($compile, templateService, commonBusiness,
                                     DTOptionsBuilder,
                                     DTColumnDefBuilder)
    {
        return {
            restrict: 'E',
            scope   : {
                itemid: '@',
                mnemonicid: '@',
                tearsheet: '='
            },
            templateUrl: 'app/core/directives/ms-template/templates/ms-table-layout/filter/ms-table-layout-f.html',
            link: tableLayoutFilterLink
        };

        function tableLayoutFilterLink(scope, el, attrs)
        {
            var dataTableId = scope.itemid;
            console.log('TableLayout Filter Link');
            console.log(scope);

            if(scope.tearsheet.columns.length > 0)
            {
                scope.$parent.$parent.isprocesscomplete = false;
                var column = [];
                var columns = '';
                var header = null;

                if(scope.tearsheet.header && scope.tearsheet.header.col)
                {
                    header = [];
                    header.push.apply(header,scope.tearsheet.header.col);
                }

                column.push.apply(column, scope.tearsheet.columns[0].col);
                column.push(scope.tearsheet.columns[1].col);

                angular.forEach(column, function(col)
                {
                    if(col.TearSheetItem &&
                        col.TearSheetItem.Mnemonic)
                    {
                        columns += col.TearSheetItem.Mnemonic + ',';
                    }
                });

                var html = '';
                templateService.getDynamicTableData(commonBusiness.projectId, commonBusiness.stepId,
                    scope.mnemonicid, scope.itemid, columns).then(function(response) {

                    var data = response.dynamicTableDataResp;

                    if(!data)
                    {
                        html += '<div flex>';
                        html += '<ms-message message="No data available"></ms-message>';
                        html += '</div>';
                    }
                    else {
                        scope.tableData = data;

                        dtDefineOptions(scope);

                        var descriptionDetails = [];

                        dtDefineColumn(scope);

                        var filteredTL = 'FilteredTableLayout'.concat("-", dataTableId);
                        var unFilteredTL = 'UnFilteredTableLayout'.concat("-", dataTableId);

                        scope.$parent.$parent.actions.push({
                            id: 1,
                            callback:filteredTL,
                            icon: 'icon-filter',
                            isclicked: false
                        });

                        scope.$parent.$parent.actions.push({
                            id: 2,
                            callback:unFilteredTL,
                            icon: 'icon-filter-remove',
                            isclicked: false
                        });


                        commonBusiness.onMsg(filteredTL, scope, function() {
                            scope.filtered();
                        });

                        commonBusiness.onMsg(unFilteredTL, scope, function() {
                            scope.unFiltered();
                        });


                        scope.filtered = function()
                        {
                            $.fn.dataTableExt.afnFiltering.push(
                                function (oSettings, aData, iDataIndex) {

                                    if ( oSettings.nTable.id === dataTableId ) {
                                        var filterReturn = false;
                                        var checkbox = $('md-checkbox', oSettings.aoData[iDataIndex].nTr).each(function(){

                                            var filterSelection = new Array();
                                            filterSelection.push('Y');

                                            var checkboxValue = eval('scope.' + $(this).attr('ng-model'));
                                            if(checkboxValue){
                                                filterReturn = filterSelection.indexOf(checkboxValue) > -1;
                                            }
                                        });

                                        return filterReturn;
                                    }else{
                                        return true;
                                    }
                                }
                            );

                            scope.dtInstance.rerender();

                        };

                        scope.unFiltered = function()
                        {
                            $.fn.dataTableExt.afnFiltering.push(
                                function (oSettings, aData, iDataIndex) {

                                    if ( oSettings.nTable.id === dataTableId ) {
                                        var filterReturn = false;
                                        var checkbox = $('md-checkbox', oSettings.aoData[iDataIndex].nTr).each(function(){

                                            var UnFilterSelection = new Array();
                                            UnFilterSelection.push('Y');

                                            var checkboxValue = eval('scope.' + $(this).attr('ng-model'));
                                            if(!checkboxValue){
                                                filterReturn = UnFilterSelection.indexOf(checkboxValue) > -1;
                                            }
                                        });

                                        return filterReturn;
                                    }else{
                                        return true;
                                    }
                                }
                            );

                            scope.dtInstance.rerender();
                        };

                        scope.childInfo = function(id, event)
                        {
                            var newScope = scope.$new(true);

                            var descDetail = _.find(scope.descriptionDetails, function(detail)
                            {
                                return (detail.id === id);
                            })


                            newScope.data = {};
                            if(descDetail)
                            {
                                newScope.data.description  = descDetail.value;
                            }
                            else {
                                newScope.data.description = "No Data Available";
                            }


                            var link = angular.element(event.currentTarget),
                                tr = link.parent(),
                                table = scope.dtInstance.DataTable,
                                row = table.row(tr);

                            if (row.child.isShown()) {
                                row.child.hide();
                            }
                            else {
                                row.child($compile('<ms-tablelayout-f-ci></ms-tablelayout-f-ci>')(newScope)).show();
                            }
                        };

                        scope.selectAll = function(value)
                        {
                            var table = scope.dtInstance.DataTable;
                            var rows = table.rows({ page: 'current', search: 'applied' }).nodes();
                            $('md-checkbox', rows).each(function(){
                                var ngModel = $(this).attr('ng-model');
                                var ngChange = $(this).attr('ng-change');
                                var modelValue = $(this).attr('ng-'+value+'-value');
                                eval('scope.' + ngModel + ' = ' + modelValue);
                                eval('scope.' + ngChange.replace('tableData', 'scope.tableData'));
                            });
                        };

                        scope.indSelection = function()
                        {

                        };

                        scope.saveRow = function(row)
                        {

                        };

                        html += '<table id="'+ dataTableId +'" dt-options="dtOptions" dt-column-defs="dtColumnDefs" ' +
                            'dt-instance="dtInstance" class="row-border hover" datatable="" width="100%" cellpadding="1" cellspacing="0">';

                        if(header)
                        {
                            var footerHtml = '<tfoot>';
                            footerHtml += '<tr class="row">';

                            html += '<thead>';
                            html += '<tr class="row">';
                            html += '<th><md-checkbox aria-label="select all" ng-model="isAllSelected" ng-change="selectAll(isAllSelected)"></md-checkbox></th>';
                            angular.forEach(header, function (col) {
                                html += '<th>';
                                footerHtml += '<th>';
                                var tearSheetItem = col.TearSheetItem;

                                if (!angular.isUndefined(tearSheetItem) &&
                                    typeof(tearSheetItem.Label) !== 'object') {

                                    switch (tearSheetItem.id) {
                                        case 'LabelItem':
                                            html += '<strong>' + tearSheetItem.Label  +'</strong>';
                                            footerHtml += '<strong>' + tearSheetItem.Label  +'</strong>';
                                            break;
                                    }
                                }

                                footerHtml += '</th>';
                                html += '</th>';
                            });
                            html += '</tr>';
                            html += '</thead>';

                            footerHtml += '</tr>';
                            footerHtml += '</tfoot>';
                        }

                        html += '<tbody>';
                        for(var count = 0; count < data.length; count++)
                        {
                            var newDescId = descriptionDetails.length + 1;
                            html += '<tr style="min-height: 25px" class="row-cursor">';
                            html += '<td><md-checkbox aria-label="select" ng-model="tableData['+count+'].TL_STATUS" ng-change="saveRow(tableData['+count+'])" ng-true-value="\'N\'" ng-false-value="\'Y\'"></md-checkbox></td>';
                            angular.forEach(column, function(col)
                            {

                                if(!col.TearSheetItem ||
                                    !col.TearSheetItem.Mnemonic ||
                                    col.TearSheetItem.Mnemonic === 'ACTION')
                                {
                                    return;
                                }

                                if(col.TearSheetItem.Mnemonic === 'DESCRIPTION')
                                {
                                    var exp = "data[count]." + col.TearSheetItem.Mnemonic;
                                    var desValue = eval(exp);
                                    descriptionDetails.push({id: newDescId, value: desValue});

                                    return;
                                }

                                html += '<td ng-click="childInfo('+ newDescId +', $event)">';
                                var tearSheetItem = col.TearSheetItem;
                                var mnemonic = tearSheetItem.Mnemonic;

                                var exp = "data[count]." + mnemonic;
                                var value = eval(exp);

                                if (value) {
                                    html += '<span style="font-weight: normal">' + value + '</span>';
                                }

                                html += '</td>';
                            });
                            html += '</tr>';
                        }
                        html += '</tbody>';
                        html += '</table>';

                        scope.descriptionDetails = descriptionDetails;
                    }

                    scope.$parent.$parent.isprocesscomplete = true;
                    el.find('#ms-table-layout').append($compile(html)(scope));

                });
            }
        }

        function showFiltered()
        {

        }

        function showUnFiltered()
        {

        }

        //Define Data-Table Options
        function dtDefineOptions(scope)
        {
            scope.dtOptions = DTOptionsBuilder
                .newOptions()
                .withOption('paging', true)
                .withOption('filter', true)
                .withOption('autoWidth', true)
                .withOption('responsive', false)
                .withOption('sorting', [])
                .withPaginationType('full')
                .withDOM('<"top bottom topTableLayout"<"left"<"length"l>><"right"f>>rt<"bottom bottomTableLayout"<"left"<"info text-bold"i>><"right"<"pagination"p>>>');
        }

        function dtDefineColumn(scope)
        {
            scope.dtColumnDefs = [
                DTColumnDefBuilder.newColumnDef(0).notSortable()
            ];
            scope.dtInstance = {};
        }
    }

})();