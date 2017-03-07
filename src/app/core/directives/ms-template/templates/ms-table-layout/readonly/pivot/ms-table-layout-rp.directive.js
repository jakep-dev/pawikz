(function ()
{
    'use strict';

    angular
        .module('app.core')
        .directive('msTablelayoutRP', msTablelayoutRPDirective);


    /** @ngInject */
    function msTablelayoutRPDirective($compile, templateService, commonBusiness, templateBusiness, templateBusinessFormat, DTOptionsBuilder)
    {
        return {
            restrict: 'E',
            scope   : {
                itemid: '@',
                mnemonicid: '@',
                tearsheet: '=',
                isfulloption: '=?'
            },
            templateUrl: 'app/core/directives/ms-template/templates/ms-table-layout/readonly/pivot/ms-table-layout-rp.html',
            compile:function(el, attrs)
            {
                return function($scope) {
                    $scope.$parent.$parent.isprocesscomplete = false;

                    var html = '';
                    var columns = '';

                    _.each($scope.tearsheet.columns, function(row) {
                        _.each(row.col, function (col) {
                            if (col.TearSheetItem &&
                                col.TearSheetItem.Mnemonic) {
                                columns += col.TearSheetItem.Mnemonic + ',';
                            }
                        });
                    });

                    templateService.getDynamicTableData(commonBusiness.projectId, commonBusiness.stepId,
                        $scope.mnemonicid, $scope.itemid, columns).then(function(response) {
                        var data = response.dynamicTableDataResp;
                        if(!data) {
                            html += '<div flex>';
                            html += '<ms-message message="No data available"></ms-message>';
                            html += '</div>';
                        }
                        else {
                            $scope.subMnemonics = templateBusiness.getTableLayoutSubMnemonics($scope.itemid, $scope.mnemonicid);
                            templateBusiness.updateTableLayoutMnemonics(commonBusiness.projectId, $scope.mnemonicid, $scope.itemid, data, $scope.subMnemonics);
                            
                            _.each(data, function(dataRow)
                            {
                                html += getBodyDetails($scope.tearsheet.columns, dataRow, $scope);
                            });

                            var footerHtml = getFooterDetails($scope.tearsheet.footer);
                            if(footerHtml) {
                                html += footerHtml;
                            }
                        }
                        $scope.$parent.$parent.isprocesscomplete = true;
                        el.find('#ms-table-layout-rp').append($compile(html)($scope));

                    });


                }
            }
        };

        function getBodyDetails(rows, data, scope) {
            var html = '';
            var columnWidth = '';
            html += '<table class="tb-v2-layout" width="100%" cellpadding="4" cellspacing="0">';
            html += '<tbody>';
            _.each(rows, function (eachRow) {
                html += '<tr class="row">';
                _.each(eachRow.col, function (col) {
                    if (!col.TearSheetItem) {
                        return;
                    }

                    if (col.TearSheetItem.Label) {
                        columnWidth = templateBusinessFormat.getAlignmentWidthColumForTableLayout(col, columnWidth);
                        html += '<td width='+columnWidth+'>';
                        html += '<span>' + col.TearSheetItem.Label + '</span>';
                        html += '</td>';
                    } else if (col.TearSheetItem.Mnemonic) {
                        columnWidth = templateBusinessFormat.getAlignmentWidthColumForTableLayout(col, columnWidth);
                        html += '<td width='+columnWidth+'>';
                        var mnemonic = col.TearSheetItem.Mnemonic;
                        var exp = "data." + mnemonic;
                        var value = eval(exp);

                        if (value) {
                            html += '<span style="font-weight: normal">' + formatData(value, mnemonic, scope.subMnemonics) + '</span>';
                        }
                        html += '</td>';
                    }
                });
                html += '</tr>';
            });

            html += '</tbody>';
            html += '</table> </br>';
            return html;
        }

        function getFooterDetails(footer) {
            var html;

            if(footer){
                html = '<div>';
                html += footer;
                html += '</div>';
            }
            return html;
        }

        function formatData(value, subMnemonic, subMnemonics)
        {
            return templateBusiness.formatData(value, _.find(subMnemonics, {mnemonic: subMnemonic}));
        }
    }

})();