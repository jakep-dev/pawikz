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
        function tableLayoutFirstVariation(scope, el)
        {
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

            el.find('#ms-table-layout').append($compile(html)(scope));

            templateService.getDynamicTableData(commonBusiness.projectId, commonBusiness.stepId,
                scope.mnemonicid, scope.itemid, columns).then(function(response)
            {
                html = '';
                var data = response.dynamicTableDataResp;

                if(!data)
                {
                    html += '<div flex>';
                    html += '<ms-message message="No data available"></ms-message>';
                    html += '</div>';
                }
                else {
                    html += '<table width="100%" cellpadding="4" cellspacing="0">';
                    html += '<thead>';
                    html += '<tr class="row">';
                    if(scope.tearsheet.header &&
                        scope.tearsheet.header.col)
                    {
                        angular.forEach(scope.tearsheet.header.col, function (col) {
                            html += '<td>';
                            var tearSheetItem = col.TearSheetItem;

                            if (!angular.isUndefined(tearSheetItem) &&
                                typeof(tearSheetItem.Label) !== 'object') {

                                switch (tearSheetItem.id) {
                                    case 'LabelItem':
                                        html += '<span><strong>' + tearSheetItem.Label  +'</strong></span>';
                                        break;
                                }
                            }

                            html += '</td>';
                        });
                    }

                    html += '</tr>';
                    html += '</thead>';



                    for(var count = 0; count < data.length; count++)
                    {
                        html += '<tbody class="row">';
                        html += '<tr style="min-height: 25px">';
                        angular.forEach(scope.tearsheet.columns.col, function(col)
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
                        html += '</tbody>';
                    }

                }
                html += '</table>';
                scope.$parent.$parent.isprocesscomplete = true;
                el.find('#ms-table-layout').append($compile(html)(scope));
            });
        }

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



                if(scope.tearsheet.columns.col)
                {
                    tableLayoutFirstVariation(scope, el);
                }
                else {

                    scope.$parent.$parent.isprocesscomplete = true;
                    if(scope.tearsheet.columns.length > 0)
                    {

                    }
                }

            }
        };
    }

})();