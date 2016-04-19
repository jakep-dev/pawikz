(function ()
{
    'use strict';

    angular
        .module('app.core')
        .directive('msTablelayoutR', msTablelayoutRDirective);


    /** @ngInject */
    function msTablelayoutRDirective($compile, templateService, commonBusiness, DTOptionsBuilder)
    {
        function tableLayoutFirstVariation(scope, el, header, column)
        {
            var html = '';
            var columns = '';

            angular.forEach(column, function(col)
            {
                if(col.TearSheetItem &&
                    col.TearSheetItem.Mnemonic)
                {
                    columns += col.TearSheetItem.Mnemonic + ',';
                }
            });

           // el.find('#ms-table-layout').append($compile(html)(scope));

            templateService.getDynamicTableData(commonBusiness.projectId, commonBusiness.stepId,
                scope.mnemonicid, scope.itemid, columns).then(function(response)
            {
                html = '';
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

                    if(data.length <= 15)
                    {
                        scope.dtOptions = DTOptionsBuilder
                            .newOptions()
                            .withOption('paging', false)
                            .withOption('filter', false)
                            .withOption('autoWidth', true)
                            .withOption('responsive', true)
                            .withOption('info', false);
                    }
                    else {
                        scope.dtOptions = DTOptionsBuilder
                            .newOptions()
                            .withOption('processing', true)
                            .withOption('paging', true)
                            .withOption('filter', true)
                            .withOption('autoWidth', true)
                            .withOption('responsive', true)
                            .withPaginationType('full')
                            .withDOM('<"top bottom topTableLayout"<"left"<"length"l>><"right"f>>rt<"bottom bottomTableLayout"<"left"<"info text-bold"i>><"right"<"pagination"p>>>');
                    }


                    html += '<table id="table-layout" dt-options="dtOptions" class="row-border hover" datatable="" width="100%" cellpadding="4" cellspacing="0">';

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
                        html += '<tr style="min-height: 25px">';
                        angular.forEach(column, function(col)
                        {
                            if(col.TearSheetItem &&
                                col.TearSheetItem.Mnemonic) {
                                html += '<td>';
                                var tearSheetItem = col.TearSheetItem;
                                var mnemonic = tearSheetItem.Mnemonic;

                                switch (tearSheetItem.Id) {
                                    case 'LabelItem':

                                        break;

                                    case 'GenericTextItem':

                                        break;
                                }

                                var exp = "data[count]." + mnemonic;
                                var value = eval(exp);

                                if (value) {
                                    html += '<span style="font-weight: normal">' + value + '</span>';
                                }


                                html += '</td>';
                            }
                        });
                        html += '</tr>';
                    }

                }
                html += '</table>';
                scope.$parent.$parent.isprocesscomplete = true;
                el.find('#ms-table-layout').append($compile(html)(scope));

                scope.isfulloption = (data && data.length >= 10);
            });
        }

        return {
            restrict: 'E',
            scope   : {
                itemid: '@',
                mnemonicid: '@',
                tearsheet: '=',
                isfulloption: '=?'
            },
            templateUrl: 'app/core/directives/ms-template/templates/ms-table-layout/readonly/ms-table-layout-r.html',
            compile:function(el, attrs)
            {
                return function($scope) {
                    console.log('table layout');
                    console.log('First Compile');


                    if($scope.tearsheet.columns)
                    {
                        $scope.$parent.$parent.isprocesscomplete = false;
                    }

                    if($scope.tearsheet.columns.col)
                    {
                        var header = $scope.tearsheet.header.col || null;

                        tableLayoutFirstVariation($scope, el, header, $scope.tearsheet.columns.col);
                    }
                    else {
                        //scope.$parent.$parent.isprocesscomplete = true;
                        if(scope.tearsheet.columns.length === 2)
                        {
                            var column = scope.tearsheet.columns[0];
                            var secondVariation = scope.tearsheet.columns[1];

                            //column.col.push(secondVariation.col);

                            var header = scope.tearsheet.header.col || null;

                            console.log('header Column');
                            console.log(header);

                            tableLayoutFirstVariation(scope, el, header, column.col);
                            //First Column has the table layout
                            //Second Column has the Description.
                        }
                    }
                };
            }
            //controller: 'msTableLayoutController',
            //controllerAs: 'vm'
        };
    }

})();