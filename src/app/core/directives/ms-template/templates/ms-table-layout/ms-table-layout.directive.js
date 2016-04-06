(function ()
{
    'use strict';

    angular
        .module('app.core')
        //.controller('msTablelayoutController', msTablelayoutController)
        .directive('msTablelayout', msTablelayoutDirective);


    function msTablelayoutController($scope)
    {
        var vm = this;
    }

    /** @ngInject */
    function msTablelayoutDirective($compile, templateService, commonBusiness)
    {
        return {
            restrict: 'E',
            scope   : {
                itemid: '@',
                mnemonicid: '@',
                tearsheet: '='
            },
            templateUrl: 'app/core/directives/ms-template/templates/ms-table-layout/ms-table-layout.html',
            link:function(scope, el, attrs)
            {
                console.log('table layout');
                console.log(scope);

                if(scope.tearsheet.columns)
                {
                    scope.$parent.$parent.isprocesscomplete = false;
                }

               var html = '';
               var columns = '';
                angular.forEach(scope.tearsheet.columns.col, function(col)
                {
                    if(col.TearSheetItem &&
                        col.TearSheetItem.Mnemonic)
                    {
                        columns += col.TearSheetItem.Mnemonic + ',';
                    }
                });

                console.log('Table Layout Columns - ');
                console.log(columns);

               el.find('#ms-table-layout').append($compile(html)(scope));

                templateService.getDynamicTableData(commonBusiness.projectId, commonBusiness.stepId,
                    scope.mnemonicid, scope.itemid, columns).then(function(response)
                {
                    console.log('Table Layout Response - ');
                    console.log(response);

                    html = '';
                    var data = response.dynamicTableDataResp;

                    console.log('Table Data');
                    console.log(data);

                    if(!data)
                    {
                        html += '<div flex>';
                        html += '<ms-message message="No data available"></ms-message>';
                        html += '</div>';
                    }
                    else {
                        html += '<div class="row" layout-align="center center"  layout="row" flex>';

                        if(scope.tearsheet.header &&
                            scope.tearsheet.header.col)
                        {
                            angular.forEach(scope.tearsheet.header.col, function (col) {
                                html += '<div flex>';
                                var tearSheetItem = col.TearSheetItem;

                                if (!angular.isUndefined(tearSheetItem) &&
                                    typeof(tearSheetItem.Label) !== 'object') {

                                    switch (tearSheetItem.id) {
                                        case 'LabelItem':
                                            html += '<ms-label value="' + tearSheetItem.Label + '"></ms-label>';
                                            break;
                                    }
                                }

                                html += '</div>';
                            });
                        }

                        html += '</div>';
                       for(var count = 0; count < data.length; count++)
                       {
                           html += '<div style="min-height: 25px" class="row" layout-align="center center"  layout="row" flex>';
                           angular.forEach(scope.tearsheet.columns.col, function(col)
                           {
                               if(col.TearSheetItem &&
                                  col.TearSheetItem.Mnemonic) {
                                   html += '<div flex>';
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


                                   html += '</div>';
                               }
                           });
                           html += '</div>';
                       }

                    }
                    scope.$parent.$parent.isprocesscomplete = true;
                    el.find('#ms-table-layout').append($compile(html)(scope));
                });

            }
        };
    }

})();