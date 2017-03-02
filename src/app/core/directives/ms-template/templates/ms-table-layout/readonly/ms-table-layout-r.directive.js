(function ()
{
    'use strict';

    angular
        .module('app.core')
        .directive('msTablelayoutR', msTablelayoutRDirective);


    /** @ngInject */
    function msTablelayoutRDirective($compile, templateService, commonBusiness, templateBusiness, DTOptionsBuilder, templateBusinessFormat)
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
                    scope.dtOptions = DTOptionsBuilder
                        .newOptions()
                        .withOption('processing', true)
                        .withOption('paging', true)
                        .withOption('filter', true)
                        .withOption('autoWidth', true)
                        .withOption('sorting', [])
                        .withOption('responsive', true)
                        .withPaginationType('full')
                        .withDOM('<"top padding-10" <"left"<"length"l>><"right"f>>rt<"top padding-10"<"left"<"info text-bold"i>><"right"<"pagination"p>>>');

                    html += '<table id="'+ scope.itemid +'" dt-options="dtOptions" ' +
                        'class="row-border hover" datatable="" width="100%" cellpadding="4" cellspacing="0">';

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
                                        var classValue = 'align-left-for-label';
                                        classValue = templateBusinessFormat.getAlignmentForLabelItem(tearSheetItem, classValue);
                                    
                                        html += '<th>';
                                        html += '<span class="'+ classValue +'"><strong>' + tearSheetItem.Label  +'</strong></span>';
                                        html += '</th>';
                                        break;
                                }
                            }


                        });
                        html += '</tr>';
                        html += '</thead>';
                    }

                    for(var count = 0; count < data.length; count++)
                    {
                        html += '<tr style="min-height: 25px">';
                        _.each(column, function(col)
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
                                var classValue = 'align-left-tablelayout-r';
                                classValue = templateBusinessFormat.getAlignmentForTableLayoutR(col, classValue);

                                if (value) {

                                    var mnemonicVal = _.find(scope.subMnemonics, function(mnemonic) {
                                        if (mnemonic.dataType === 'DATE') {
                                            return mnemonic.dataType;
                                        }
                                    });

                                    if (mnemonicVal &&
                                        mnemonicVal.dataType === 'DATE') {

                                        html += '<span style="display:none">' + templateBusinessFormat.formatDate(templateBusinessFormat.parseDate(value, "DD-MMM-YY"), "YYYY-MM-DD") + '</span>'; // for easy sorting order
                                    }

                                    if(mnemonic == 'URL' && classValue === 'align-right-tablelayout-r') {
                                        html += '<span class="'+ classValue +'" style="font-weight: normal"><ms-link value="URL" href="http://' + value + '"></ms-link></span>';
                                    }else if(classValue === 'align-right-tablelayout-r'){
                                        html += '<span class="'+ classValue +'" style="font-weight: normal">' +formatData(value, mnemonic, scope.subMnemonics) + '</span>';
                                    }
                                    else {
                                        html += '<span style="font-weight: normal">' + formatData(value, mnemonic, scope.subMnemonics) + '</span>';
                                    }
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

        function tableLayoutSecondVariation(scope, el, row, column)
        {
            var html = '';
            var columns = '';

            _.each(column, function(col)
            {
                if(col.TearSheetItem &&
                    col.TearSheetItem.Mnemonic)
                {
                    columns += col.TearSheetItem.Mnemonic + ',';
                }
            });

            templateService.getDynamicTableData(commonBusiness.projectId, commonBusiness.stepId,
                scope.mnemonicid, scope.itemid, columns).then(function(response)
            {
                var data = response.dynamicTableDataResp;

                if(!data)
                {
                    html += '<div flex>';
                    html += '<ms-message message="No data available"></ms-message>';
                    html += '</div>';
                }
                else if(data.length >= 1) {
                    html += '<table class="tb-v2-layout" width="100%" cellpadding="4" cellspacing="0">';
                    html += '<tbody>';
                    angular.forEach(row, function(eachRow)
                    {
                        html += '<tr class="row">';
                       angular.forEach(eachRow.col, function(col)
                       {
                           if(!col.TearSheetItem)
                           {
                               return;
                           }

                           if(col.TearSheetItem.Label)
                           {
                               html += '<td>';
                               html += '<span style="font-weight: normal">' + col.TearSheetItem.Label + '</span>';
                               html += '</td>';
                           }
                           else if(col.TearSheetItem.Mnemonic) {
                               html += '<td>';
                               var mnemonic = col.TearSheetItem.Mnemonic;
                               var exp = "data[0]." + mnemonic;
                               var value = eval(exp);

                               if (value) {
                                   html += formatData(value, mnemonic, scope.subMnemonics);
                               }
                               html += '</td>';
                           }
                       }) ;
                        html += '</tr>';
                    });
                    html += '</tbody>';
                    html += '</table>';

                    scope.$parent.$parent.isprocesscomplete = true;
                    el.find('#ms-table-layout').append($compile(html)(scope));
                }

            });
        }
		
		function formatData(value, subMnemonic, subMnemonics)
		{
			return templateBusiness.formatData(value, _.find(subMnemonics, {mnemonic: subMnemonic}));
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
                    if($scope.tearsheet.columns)
                    {
                        $scope.$parent.$parent.isprocesscomplete = false;
						$scope.subMnemonics = templateBusiness.getTableLayoutSubMnemonics($scope.itemid, $scope.mnemonicid);
                    }

                    var header = null;
                    var columns = null;

                    if($scope.tearsheet.columns.col)
                    {
                        columns = $scope.tearsheet.columns.col;

                        if($scope.tearsheet.header &&
                           $scope.tearsheet.header.col)
                        {
                            header = $scope.tearsheet.header.col;
                        }

                        tableLayoutFirstVariation($scope, el, header, columns);
                    }
                    else if($scope.tearsheet.columns.length)
                    {
                        columns = [];
                        var rows = [];
                        angular.forEach($scope.tearsheet.columns, function(eachCol)
                        {
                           var row = [];
                           angular.forEach(eachCol.col, function(col)
                           {

                               var tearSheetItem = col.TearSheetItem;

                               if(!tearSheetItem.id)
                               {
                                   return;
                               }

                               if(tearSheetItem.id !== 'LabelItem')
                               {
                                 columns.push(col);
                               }
                               else if(tearSheetItem.id === 'LabelItem') {
                                row.push(col);
                               }
                           });

                           if(row.length > 0)
                           {
                               rows.push(row);
                           }
                        });
                        tableLayoutSecondVariation($scope, el, $scope.tearsheet.columns, columns);
                    }
                };
            }
        };
    }

})();