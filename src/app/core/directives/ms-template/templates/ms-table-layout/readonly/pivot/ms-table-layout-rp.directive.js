(function ()
{
    'use strict';

    angular
        .module('app.core')
        .directive('msTablelayoutRP', msTablelayoutRPDirective);


    /** @ngInject */
    function msTablelayoutRPDirective($compile, templateService, clientConfig,
                                        commonBusiness, templateBusiness, templateBusinessFormat, templateBusinessSave)
    {
        return {
            restrict: 'E',
            scope   : {
                itemid: '@',
                mnemonicid: '@',
                tearsheet: '=',
                iseditable: '=?',
                isfulloption: '=?'
            },
            templateUrl: 'app/core/directives/ms-template/templates/ms-table-layout/readonly/pivot/ms-table-layout-rp.html',
            compile:function(el, attrs)
            {
                return function($scope) {
                    $scope.$parent.$parent.isprocesscomplete = false;
                    $scope.format = formatData;
                    $scope.saveRow = saveRow;

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

                    columns += 'SEQUENCE';

                    templateService.getDynamicTableData(commonBusiness.projectId, commonBusiness.stepId,
                        $scope.mnemonicid, $scope.itemid, columns).then(function(response) {
                        var data = response.dynamicTableDataResp;
                        if(!data) {
                            html += '<div layout="row" layout-align="center center" layout-padding>';
                            html += '<span>No data available</span>';
                            html += '</div>';
                        }
                        else {
                            $scope.subMnemonics = templateBusiness.getTableLayoutSubMnemonics($scope.itemid, $scope.mnemonicid);
                            templateBusiness.updateTableLayoutMnemonics(commonBusiness.projectId, $scope.mnemonicid, $scope.itemid, data, $scope.subMnemonics);
                            
                            $scope.data = data;
                            html += getBodyDetails($scope.tearsheet.columns, 'dataRow', $scope);

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
            html += '<table class="tb-v2-layout" width="100%" cellpadding="4" cellspacing="0" ng-repeat="table in data">';
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

                        if (scope.iseditable) {
                            var formats = templateBusinessFormat.getHybridTableFormatObject(col.TearSheetItem, _.find(scope.subMnemonics, {mnemonic: mnemonic}));
                            html += '<ms-pivot-text row="table" save="saveRow(table, mnemonicid, itemid, subMnemonics)" columnname="'+mnemonic+'" formats="' + _.escape(angular.toJson(formats)) + '"></ms-pivot-text>';
                        } else {
                            html += '<span style="font-weight: normal">{{ format(table.' + mnemonic + ',' + mnemonic + ', subMnemonics) }}</span>';
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

        function saveRow(row, mnemonic, itemid, subMnemonics)
		{
			var save = {
				action: 'updated',
                sequence: parseInt(row.SEQUENCE),
				row: [],
				condition: []
			};
			
			angular.forEach(_.omit(row, '$$hashKey', 'ROW_SEQ'), function(value, key){
				save.row.push({
					columnName: key,
					value: (angular.isDate(row[key])) ?  templateBusiness.formatDate(row[key], 'DD-MMM-YY') : templateBusiness.removeFormatData(row[key], _.find(subMnemonics, {mnemonic: key}))
				});
			});
			
			save.condition.push({
				columnName: 'SEQUENCE',
				value: row.SEQUENCE
			});
			save.condition.push({
				columnName: 'ITEM_ID',
				value: itemid
			});
			
			templateBusinessSave.getReadyForAutoSave(itemid, mnemonic, save, clientConfig.uiType.tableLayout);
		}
    }

})();