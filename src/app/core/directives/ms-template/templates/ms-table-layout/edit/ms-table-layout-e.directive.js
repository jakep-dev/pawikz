(function ()
{
    'use strict';

    angular
        .module('app.core')
        .directive('msTablelayoutE', msTablelayoutEDirective);


    /** @ngInject */
    function msTablelayoutEDirective($compile, templateService, commonBusiness, DTOptionsBuilder)
    {
        return {
            restrict: 'E',
            scope   : {
                itemid: '@',
                mnemonicid: '@',
                tearsheet: '=',
                isfulloption: '=?'
            },
            templateUrl: 'app/core/directives/ms-template/templates/ms-table-layout/edit/ms-table-layout-e.html',
            link: tableLayoutEditLink
        };


        function tableLayoutEditLink(scope, el, attrs)
        {
            var dataTableId = scope.itemid;

            if(scope.tearsheet.columns && scope.tearsheet.columns.col)
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

                column.push.apply(column, scope.tearsheet.columns.col);

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

                        dtDefineOptions(scope);
                        dtDefineColumn(scope);

                        html += '<table id="'+ dataTableId +'" dt-options="dtOptions" dt-column-defs="dtColumnDefs" ' +
                            'dt-instance="dtInstance" class="row-border hover" datatable="" width="100%" cellpadding="1" cellspacing="0">';


                        if(header)
                        {
                            html += '<thead>';
                            html += '<tr class="row">';
                            angular.forEach(header, function (col) {

                                var tearSheetItem = col.TearSheetItem;

                                if (!angular.isUndefined(tearSheetItem) &&
                                    typeof(tearSheetItem.Label) !== 'object') {

                                    switch (tearSheetItem.id) {
                                        case 'LabelItem':
                                            html += '<th>';
                                            html += '<strong>' + tearSheetItem.Label  +'</strong>';
                                            html += '</th>';
                                            break;
                                    }
                                }

                            });
                            html += '</tr>';
                            html += '</thead>';
                        }


                        html += '<tbody>';

                        for(var count = 0; count < data.length; count++) {
                            html += '<tr style="min-height: 25px" class="row-cursor">';
                            angular.forEach(column, function(col)
                            {
                                html += '<td>';
                                var tearSheetItem = col.TearSheetItem;
                                var mnemonic = tearSheetItem.Mnemonic;

                                var exp = "data[count]." + mnemonic;
                                var value = eval(exp);

                                if (value) {
                                    html += '<textarea style="width: 100%">'+ value +'</textarea>';
                                }
                                else {
                                    html += '<textarea style="width: 100%"></textarea>';
                                }


                                html += '</td>';
                            });
                            html += '</tr>'
                        }

                        html += '</tbody>';
                        html += '</table>';
                    }

                    scope.$parent.$parent.isprocesscomplete = true;
                    el.find('#ms-table-layout-edit').append($compile(html)(scope));

                });
            }
        }

        //Define Data-Table Options
        function dtDefineOptions(scope)
        {
            scope.dtOptions = DTOptionsBuilder
                .newOptions()
                .withOption('paging', true)
                .withOption('filter', true)
                .withOption('autoWidth', true)
                .withOption('sorting', [])
                .withOption('responsive', false)
                .withOption('sorting', [])
                .withPaginationType('full')
                .withDOM('<"top padding-10" <"left"<"length"l>><"right"f>>rt<"top padding-10"<"left"<"info text-bold"i>><"right"<"pagination"p>>>');
        }

        function dtDefineColumn(scope)
        {
            scope.dtInstance = {};
        }
    }

})();