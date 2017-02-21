(function ()
{
    'use strict';

    angular
        .module('app.core')
        .directive('msTablelayoutF', msTablelayoutFDirective);

    /** @ngInject */
    function msTablelayoutFDirective($compile, $timeout, templateService, 
									 commonBusiness, templateBusiness,
                                     DTOptionsBuilder,
                                     DTColumnDefBuilder, toast,
                                     templateBusinessFormat, 
                                     clientConfig, templateBusinessSave)
    {
        return {
            restrict: 'E',
            scope   : {
                itemid: '@',
                mnemonicid: '@',
                tearsheet: '='
            },
            templateUrl: 'app/core/directives/ms-template/templates/ms-table-layout/filter/ms-table-layout-f.html',
            link: defineFilterLink
        };

        function defineLayout($scope, el, header)
        {
            $scope.dtInstance = {};
            $scope.isTableShow = true;
            $scope.IsAllChecked = false;
            var html = '<table id="tablelayout-filter" ng-show="isTableShow" width="100%" dt-instance="dtInstance" dt-options="dtOptions" ' +
                'class="row-border hover highlight cell-border" dt-column-defs="dtColumnDefs" datatable="ng" cellpadding="1" cellspacing="0">';

            $scope.dtOptions = DTOptionsBuilder
                .newOptions()
                .withOption('processing', false)
                .withOption('paging', true)
                .withOption('filter', true)
                .withOption('autoWidth', true)
                .withOption('info', true)
                .withOption('sorting', [])
                .withOption('responsive', true)
                .withPaginationType('full')
                .withOption('drawCallback', function(){
                    $timeout(function(){
                        expandedDescription($scope, $scope.dtInstance.DataTable, el);
                    }, 1000);
                })
                .withDOM('<"top padding-10" <"left"<"length"l>><"right"f>>rt<"top padding-10"<"left"<"info text-bold"i>><"right"<"pagination"p>>>');


            $scope.dtColumnDefs = [
                DTColumnDefBuilder.newColumnDef(0).notSortable()
            ];

            //Defining the header here.
            html += defineHeaderLayout(header);
            html += defineBodyLayout($scope);
            html += '</table>';

            el.find('#ms-table-layout').append($compile(html)($scope));
        }

        function expandedDescription($scope, table, element) {
            if(table) {
                var tableRows = element.find('tbody').find('tr');
                _.each(tableRows, function(row){
                    var rowSeq = (row && row.attributes && row.attributes['sequence'] && row.attributes['sequence'].value)? row.attributes['sequence'].value : null;
                    if(rowSeq) {
                        var newScope = $scope.$new(true);  
                        var isExpanded = false; 

                        var rowDetail = _.find($scope.data, function(detail)
                        {
                            return (detail.ROW_SEQ === parseInt(rowSeq));
                        });

                        newScope.data = {};
                        if(rowDetail)
                        {
                            isExpanded = rowDetail.IsExpanded;
                            newScope.data.description  = rowDetail.DESCRIPTION || rowDetail.SIGDEVDESC;
                        }
                        else {
                            newScope.data.description = "No Data Available";
                        }

                        var tr = table.row(row);
                        if ((!tr.child.isShown()) && isExpanded) {
                            tr.child($compile('<ms-tablelayout-f-ci></ms-tablelayout-f-ci>')(newScope)).show();
                        }
                    }
                });
            }
        }

        function buildRows($scope, data)
        {
            $scope.data = [];

            angular.forEach(data, function(eachData)
            {
                eachData.IsChecked = false;
                eachData.IsExpanded = false;

                if(eachData.TL_STATUS === 'N' || eachData.TL_STATUS === 'Y'){
                    eachData.IsChecked = true;
                }

                if(eachData.TL_STATUS === 'Y' || eachData.TL_STATUS === 'E'){
                    eachData.IsExpanded = true;
                }
            });

            $scope.data.push.apply($scope.data, data);
            $scope.rows.push.apply($scope.rows, data);
			
			calculateHeaderSelection($scope);
        }

        function defineBodyLayout($scope)
        {
           $scope.rows = [];

           var html = '<tbody>';
               html += '<tr ng-repeat="row in rows" sequence={{row.ROW_SEQ}}>';
            if($scope.tearsheet.columns.length > 0)
            {
                angular.forEach($scope.tearsheet.columns[0].col, function(eachCol)
                {
                    var tearSheetItem = eachCol.TearSheetItem;
                    if(tearSheetItem)
                    {
                        var classValue = 'align-left';
                        classValue = templateBusinessFormat.getAlignmentForTableLayoutGenericTextItem(eachCol, classValue);
                        switch (tearSheetItem.id)
                        {
                            case 'GenericSelectItem':
                                html += '<td>';
                                html += '<md-checkbox aria-label="select" ng-change="rowMakeSelection();saveRow(row);" ng-model="row.IsChecked"' +
                                    'class="no-padding-margin"></md-checkbox>';
                                break;
                            case 'DateItem':
                                html += '<td ng-click="showChildInfo(row.ROW_SEQ,$event)" class="'+ classValue +'">';
								html += '<span style="display:none">{{formatDate(row.'+ tearSheetItem.ItemId + ', "YYYY-MM-DD")}}</span>'; //for easy sorting
								var calRow = '{{formatSubMnemonic(row.'+ tearSheetItem.ItemId + ', "'+ tearSheetItem.ItemId + '")}}';
                                html += '<span>' + calRow + '</span>';

                                break;
                            default:
                                html += '<td ng-click="showChildInfo(row.ROW_SEQ,$event)" class="'+ classValue +'">';
                                var calRow = '{{formatSubMnemonic(row.'+ tearSheetItem.ItemId + ', "'+ tearSheetItem.ItemId + '")}}';
                                html += '<span>' + calRow + '</span>';

                                break;
                        }
                        html += '</td>';
                    }
                });
            }

            html += '</tr>';
            html += '</tbody>';

            return html;
        }

        function defineHeaderLayout(header)
        {
            var html = '';
            if(header)
            {
                html += '<thead>';
                html += '<tr class="row">';
                html += '<th><md-checkbox ng-change="headerSelectAll(this)" ng-model="IsAllChecked" aria-label="select all" ' +
                    'class="no-padding-margin"></md-checkbox></th>';
                angular.forEach(header, function (col) {
                    html += '<th>';
                    html += '<span class="'+ col.alignment +'"><strong>' + col .label +'</strong></span>';
                    html += '</th>';
                });
                html += '</tr>';
                html += '</thead>';
            }
            return html;
        }

        function defineActions($scope)
        {
            $scope.$parent.$parent.actions.push({
                id: 1,
                callback: null,
                icon: 'icon-filter',
                isclicked: null,
                type: 'menu',
                tooltip: null,
                scope: $scope,
                menus:[{
					   type: 'button',
                       icon: 'icon-checkbox-marked',
                       name: 'Selected',
                       callback: $scope.itemid + '-Selected'
                    },
                    {
						type: 'button',
                        icon: 'icon-checkbox-blank-outline',
                        name: 'UnSelected',
                        callback: $scope.itemid + '-UnSelected'
                    },
                    {
						type: 'button',
                        icon: 'icon-eraser',
                        name: 'Clear Filter',
                        callback: $scope.itemid + '-ClearFilter'
                    }]
            });
        }

        ///Get the child details for the specific row
        function showChildInfo($scope, rowSeq, event)
        {
            var newScope = $scope.$new(true);

            var rowDetail = _.find($scope.data, function(detail)
            {
                return (detail.ROW_SEQ === rowSeq);
            });

            newScope.data = {};
            if(rowDetail)
            {
                newScope.data.description  = rowDetail.DESCRIPTION || rowDetail.SIGDEVDESC;
                rowDetail.IsExpanded = !rowDetail.IsExpanded;
                saveRow($scope, rowDetail);
            }
            else {
                newScope.data.description = "No Data Available";
            }

            var link = angular.element(event.currentTarget),
                tr = link.parent(),
                table = $scope.dtInstance.DataTable,
                row = table.row(tr);

            if (row.child.isShown()) {
                row.child.hide();
            }
            else {
                row.child($compile('<ms-tablelayout-f-ci></ms-tablelayout-f-ci>')(newScope)).show();
            }
        }

        function calculateHeaderSelection($scope)
        {
            $scope.IsAllChecked = false;
            var unSelected = _.filter($scope.rows, function(eachRow)
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

        function initializeMsg($scope)
        {
            commonBusiness.onMsg($scope.itemid + '-Selected', $scope, function() {

                showSelected($scope);
            });

            commonBusiness.onMsg($scope.itemid + '-UnSelected', $scope, function() {

                showUnSelected($scope);
            });

            commonBusiness.onMsg($scope.itemid + '-ClearFilter', $scope, function() {

                clearFilter($scope);
            });
        }

        function showSelected($scope)
        {
           resetDataCheck($scope);
           var selectedRows = _.filter($scope.data, function(row)
           {
               if(row.IsChecked === true)
               {
                   return row;
               }
           });

            if(selectedRows && selectedRows.length > 0)
            {
                $scope.rows = [];
                $scope.rows.push.apply($scope.rows, selectedRows);
                toast.simpleToast("Showing only selected");
				
				calculateHeaderSelection($scope);
            }
            else {
                toast.simpleToast("Nothing to filter!");
            }
        }

        function showUnSelected($scope)
        {
            resetDataCheck($scope);
            var selectedRows = _.filter($scope.data, function(row)
            {
                if(row.IsChecked === false)
                {
                    return row;
                }
            });

            if(selectedRows && selectedRows.length > 0)
            {
                $scope.rows = [];
                $scope.rows.push.apply($scope.rows, selectedRows);
                toast.simpleToast("Showing only unselected");
				
				calculateHeaderSelection($scope);
            }
            else {
                toast.simpleToast("Nothing to filter!");
            }
        }

        function resetDataCheck($scope)
        {
            if($scope.data.length === $scope.rows.length)
            {
                $scope.data = [];
                $scope.data.push.apply($scope.data, $scope.rows);
            }
        }

        function clearFilter($scope)
        {
            $scope.rows = [];
            $scope.rows.push.apply($scope.rows, $scope.data);
            resetDataCheck($scope);
            toast.simpleToast("Cleared filter!");
				
			calculateHeaderSelection($scope);
        }

        function headerAllSelection($scope)
        {
            angular.forEach($scope.rows, function(eachRow)
                    {
						if(eachRow.IsChecked !== $scope.IsAllChecked)
						{
							eachRow.IsChecked = $scope.IsAllChecked;
							$scope.saveRow(eachRow);
						}
                    });
        }
		
		function saveRow($scope, row)
		{
			var save = {
                action: 'updated',
                sequence: parseInt(row.SEQUENCE),
				row: [],
				condition: []
			};
			
			save.row.push({
				columnName: 'TL_STATUS',
				value: getTLSTATUS(row)
			});
			
			save.condition.push({
				columnName: 'SEQUENCE',
				value: row.SEQUENCE
			});
			save.condition.push({
				columnName: 'ITEM_ID',
				value: $scope.itemid
			});
			
			templateBusinessSave.getReadyForAutoSave($scope.itemid, $scope.mnemonicid, save, clientConfig.uiType.tableLayout);
		}

        function getTLSTATUS(row) {
            if(row) {
                if(row.IsChecked === true && row.IsExpanded === true) {
                    return 'Y';
                } else if(row.IsChecked === true && row.IsExpanded === false) {
                    return 'N';
                } else if(row.IsChecked === false && row.IsExpanded === true) {
                    return 'E';
                } else{
                    return 'C';
                }
            }
            return 'C';
        }

        function defineFilterLink(scope, el, attrs)
        {
            var dataTableId = scope.itemid;
            if(scope.tearsheet.columns.length > 0)
            {
                scope.$parent.$parent.isprocesscomplete = false;
                var column = [];
                var columns = '';
                var header = null;
				
				scope.subMnemonics = templateBusiness.getTableLayoutSubMnemonics(scope.itemid, scope.mnemonicid);

                if(scope.tearsheet.header && scope.tearsheet.header.col)
                {
                    header = [];
                   
				   angular.forEach(scope.tearsheet.header.col, function (col) {
						var tearSheetItem = col.TearSheetItem;

						if (!angular.isUndefined(tearSheetItem) &&
							typeof(tearSheetItem.Label) !== 'object') {

							switch (tearSheetItem.id) {
								case 'LabelItem':
									// header.push(tearSheetItem.Label);
                                    var classValue = 'align-left-for-label';
                                    header.push({
                                        alignment : templateBusinessFormat.getAlignmentForLabelItem(tearSheetItem , classValue) ,
                                        label : tearSheetItem.Label
                                    });
								break;
							}
						}
					});
                }else if(scope.mnemonicid === 'SIG_DEV'){
					header = [];
					// header.push('Event Date');
					// header.push('Event Summary');
                    header.push({
                        alignment : 'align-left-for-label',
                        label : 'Event Date'
                    });

                    header.push({
                        alignment : 'align-left-for-label',
                        label : 'Event Summary'
                    });
				}

                if(scope.tearsheet.columns.length >=2 )
                {
                    column.push.apply(column, scope.tearsheet.columns[0].col);
                    column.push(scope.tearsheet.columns[1].col);
                }

                scope.columns = column;
                angular.forEach(column, function(col)
                {
                    if(col.TearSheetItem &&
                        col.TearSheetItem.Mnemonic)
                    {
                        columns += col.TearSheetItem.Mnemonic + ',';
                    }
                });
				
				columns += 'TL_STATUS,SEQUENCE';


                var html = '';
                templateService.getDynamicTableData(commonBusiness.projectId, commonBusiness.stepId,
                    scope.mnemonicid, scope.itemid, columns).then(function(response) {

                    var data = response.dynamicTableDataResp;

                    if(!data)
                    {
                        html += '<div flex>';
                        html += '<ms-message message="No data available"></ms-message>';
                        html += '</div>';

                        el.find('#ms-table-layout').append($compile(html)(scope));
                    }
                    else {

                        defineLayout(scope, el, header);
                        defineActions(scope);
                        initializeMsg(scope);
                        buildRows(scope, data);


                        scope.showChildInfo = function(id, event)
                        {
                            showChildInfo(scope, id, event);
                        };

                        scope.headerSelectAll = function(currentScope)
                        {
                            headerAllSelection(currentScope);
                        };

                        scope.rowMakeSelection = function()
                        {
                            calculateHeaderSelection(scope);
                        };

                        scope.saveRow = function(row)
                        {
                            saveRow(scope, row);
                        };
						
						scope.formatDate = function(dateStr, format)
						{
							var date = moment(dateStr, 'DD-MMM-YY', true);
							return date.isValid() ? date.format(format) : '';
						};
						
						scope.formatSubMnemonic = function(value, subMnemonic)
						{
							return templateBusiness.formatData(value, _.find(scope.subMnemonics, {mnemonic: subMnemonic}));
						}
                    }
                    scope.$parent.$parent.isprocesscomplete = true;
                });
            }
        }
    }

})();