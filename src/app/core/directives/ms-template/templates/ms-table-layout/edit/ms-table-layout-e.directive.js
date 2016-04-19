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
            link:function(scope, el, attrs)
            {
                console.log('Table Layout Edit');
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

                    console.log('Table Layout Edit Column-');
                    console.log(column);

                    var html = '';
                    templateService.getDynamicTableData(commonBusiness.projectId, commonBusiness.stepId,
                        scope.mnemonicid, scope.itemid, columns).then(function(response) {

                        var data = response.dynamicTableDataResp;
                        console.log('Table Layout Data-');
                        console.log(data);
                        if(!data)
                        {
                            html += '<div flex>';
                            html += '<ms-message message="No data available"></ms-message>';
                            html += '</div>';
                        }
                        else {

                            console.log('Table Layout Edit Length-');
                            console.log(data.length);
                            if(data.length >= 5)
                            {
                                console.log('Paging--');
                                scope.dtOptions = DTOptionsBuilder
                                    .newOptions()
                                    .withOption('paging', true)
                                    .withOption('filter', true)
                                    .withOption('autoWidth', true)
                                    .withOption('responsive', true)
                                    .withOption('sorting', false)
                                    .withOption('info', true)
                                    .withPaginationType('full')
                                    .withDOM('<"top bottom topTableLayout"<"left"<"length"l>><"right"f>>rt<"bottom bottomTableLayout"<"left"<"info text-bold"i>><"right"<"pagination"p>>>');

                            }
                            else
                            {
                                scope.dtOptions = DTOptionsBuilder
                                    .newOptions()
                                    .withOption('paging', false)
                                    .withOption('filter', false)
                                    .withOption('autoWidth', true)
                                    .withOption('responsive', true)
                                    .withOption('sorting', false)
                                    .withOption('info', false)
                            }

                            html += '<table dt-options="dtOptions" class="row-border hover" datatable="" width="100%" cellpadding="4" cellspacing="0">';
                            if(header)
                            {
                                html += '<thead>';
                                html += '<tr class="row">';
                                angular.forEach(header, function (col) {
                                    html += '<th>';
                                    var tearSheetItem = col.TearSheetItem;

                                    if (!angular.isUndefined(tearSheetItem) &&
                                        typeof(tearSheetItem.Label) !== 'object') {

                                        switch (tearSheetItem.id) {
                                            case 'LabelItem':
                                                html += '<span><strong>' + tearSheetItem.Label  +'</strong></span>';
                                                break;
                                        }
                                    }

                                    html += '</th>';
                                });
                                html += '</tr>';
                                html += '</thead>';
                            }


                            for(var count = 0; count < data.length; count++)
                            {
                                var descriptionHtml = null;

                                html += '<tr style="min-height: 25px">';
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

                                        if(desValue)
                                        {
                                            descriptionHtml = '';
                                            descriptionHtml += '<tr style="min-height: 25px">';
                                            descriptionHtml += '<td colspan="9"><span>'+ desValue +'</span> </td><td ng-hide="true"></td><td ng-hide="true"></td><td ng-hide="true"></td><td ng-hide="true"></td><td ng-hide="true"></td><td ng-hide="true"></td><td ng-hide="true"></td><td ng-hide="true"></td>'
                                            descriptionHtml += '</tr>';
                                        }

                                        return;
                                    }

                                    html += '<td>';
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
                                console.log('Description HTML -');

                                if(descriptionHtml && descriptionHtml !== '')
                                {
                                    console.log(descriptionHtml);
                                    html += descriptionHtml;
                                }
                            }
                        }
                        html += '</table>';
                        scope.$parent.$parent.isprocesscomplete = true;
                        el.find('#ms-table-layout').append($compile(html)(scope));

                    });
                }
            }
        };
    }

})();