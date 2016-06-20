(function ()
{
    'use strict';

    angular
        .module('app.core')
        .directive('msTablelayoutH', msTablelayoutHDirective);

    /** @ngInject */
    function msTablelayoutHDirective($compile, $timeout, templateService, 
									 commonBusiness, templateBusiness,
                                     DTOptionsBuilder,
                                     DTColumnDefBuilder, toast)
    {
        return {
            restrict: 'E',
            scope   : {
                itemid: '@',
                mnemonicid: '@',
                tearsheet: '='
            },
            templateUrl: 'app/core/directives/ms-template/templates/ms-table-layout/hybrid/ms-table-layout-h.html',
            link: defineHybridLink
        };

        function defineLayout($scope, el)
        {
            $scope.dtInstance = {};
            $scope.isTableShow = true;
            $scope.IsAllChecked = false;
            var html = '<table id="tablelayout-hybrid" ng-show="isTableShow" width="100%" dt-instance="dtInstance" dt-options="dtOptions" ' +
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
                .withDOM('<"top bottom topTableLayout"<"left"<"length"l>><"right"f>>rt<"bottom bottomTableLayout"<"left"<"info text-bold"i>><"right"<"pagination"p>>>');


            $scope.dtColumnDefs = [
                DTColumnDefBuilder.newColumnDef(0).notSortable()
            ];

            //Defining the header here.
            html += defineHeaderLayout($scope);
            html += defineBodyLayout($scope);
            html += '</table>';

            el.find('#ms-table-layout-hybrid').append($compile(html)($scope));
        }

        function buildRows($scope, data)
        {
            $scope.data = [];

            angular.forEach(data, function(eachData)
            {
               eachData.IsChecked = (eachData.TL_STATUS === 'Y');
            });

            $scope.data.push.apply($scope.data, data);
            $scope.rows.push.apply($scope.rows, data);
			
			calculateHeaderSelection($scope);
        }

        function defineBodyLayout($scope)
        {
           $scope.rows = [];

		   var isDisabled = $scope.tearsheet.isNonEditable;
           var html = '<tbody>';
           html += '<tr ng-repeat="row in rows">';
		   
           if($scope.columns.length > 0)
           {
				html += '<td><md-checkbox class="no-margin-padding" aria-label="Select All" ng-model="row.IsChecked" ng-change="rowMakeSelection();saveRow(row)"></md-checkbox></td>';
                angular.forEach($scope.columns, function(eachCol)
                {
                    var tearSheetItem = eachCol.TearSheetItem;
                    if(tearSheetItem)
                    {

						var itemId = tearSheetItem.ItemId;
						var mnemonicId = tearSheetItem.Mnemonic;
						
						if(mnemonicId && mnemonicId === 'ACTION'){
							return;
						}
                        
                        html += '<td>';
						switch (tearSheetItem.id)
                        {
                            case 'GenericSelectItem':
								html += '<span style="display:none">{{row.' + itemId + '}}</span>'; // for easy sorting & searching
								html += '<ms-hybrid-checkbox row="row" isdisabled="'+isDisabled+'" save="saveRow(row)" ' +
												'text="'+tearSheetItem.param.content+'" columnname="'+itemId+'"></ms-hybrid-checkbox>';
                                break;
							case 'GenericTextItem':
								html += '<span style="display:none">{{row.' + itemId + '}}</span>'; // for easy sorting & searching
								html += '<ms-hybrid-text row="row" isdisabled="'+isDisabled+'" ' +
												'save="saveRow(row)" columnname="'+itemId+'"></ms-hybrid-text>';
								break;
                            default:
                                html += '<span>Under Construction</span>';
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

        function defineHeaderLayout($scope)
        {
            var html = '';
			if($scope.header.length < $scope.columns.length - 1){ //minus 1 to exclude ACTION mnemonic in columns
				for(var i = $scope.header.length + 1; i < $scope.columns.length; i++)
				{
					var tearSheetItem = $scope.columns[i].TearSheetItem;
					$scope.header.push({
						HLabel: ' ',
						HMnemonic: tearSheetItem.Mnemonic
					});
				}
			}
			
            if($scope.header)
            {
                html += '<thead>';
                html += '<tr class="row">';
                html += '<th><md-checkbox ng-model="IsAllChecked" ng-change="makeSelections(IsAllChecked)" aria-label="select all" ' +
                    'class="no-padding-margin"></md-checkbox></th>';
                angular.forEach($scope.header, function (header) {
                    html += '<th>';
                    html += '<strong>' + header.HLabel  +'</strong>';
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
				callback: $scope.itemid + '-Upload',
				icon: 'icon-upload',
				isclicked: null,
				tooltip: 'Excel Upload',
				type: 'button'
			});
			
			$scope.$parent.$parent.actions.push({
				id: 2,
				callback: $scope.itemid + '-Download',
				icon: 'icon-download',
				isclicked: null,
				tooltip: 'Excel Download',
				type: 'button'
			});

            $scope.$parent.$parent.actions.push({
                id: 3,
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
                    }],
            });
			
			$scope.$parent.$parent.actions.push({
				id: 4,
				callback: $scope.itemid + '-Copy',
				icon: 'icon-content-copy',
				isclicked: null,
				tooltip: 'Copy Row',
				type: 'button'
			});
			
			$scope.$parent.$parent.actions.push({
				id: 5,
				callback: $scope.itemid + '-Delete',
				icon: 'icon-delete',
				isclicked: null,
				tooltip: 'Delete Rows',
				type: 'button'
			});
			
			$scope.$parent.$parent.actions.push({
				id: 6,
				callback: null,
				icon: 'icon-plus',
				isclicked: null,
				tooltip: 'Add Rows',
				type: 'menu',
                scope: $scope,
                menus:[{
						type: 'input', 
						isNumeric: true, 
						model: $scope.rowNumber,
						min: 1,
						max: 100,
						setValue : function (number) {
							$scope.rowNumber = number;
						}
                    },
                    {
                        type: 'button',
                        icon: null,
                        name: 'Add',
                        callback: $scope.itemid + '-Add'
                    }],
			});
        }

        function calculateHeaderSelection($scope)
        {
			$scope.IsAllChecked = _.every($scope.rows, function(row) { return row.IsChecked; });
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

            commonBusiness.onMsg($scope.itemid + '-Copy', $scope, function() {

                copyRows($scope);
            });		

            commonBusiness.onMsg($scope.itemid + '-Download', $scope, function() {

                excelDownload($scope);
            });	

            commonBusiness.onMsg($scope.itemid + '-Upload', $scope, function() {

                excelUpload($scope);
            });

            commonBusiness.onMsg($scope.itemid + '-Delete', $scope, function() {

                deleteRows($scope);
            });

            commonBusiness.onMsg($scope.itemid + '-Add', $scope, function() {

                addRows($scope);
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
				calculateHeaderSelection($scope);
                
				toast.simpleToast("Showing only selected");
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
				calculateHeaderSelection($scope);
                
				toast.simpleToast("Showing only unselected");
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
			calculateHeaderSelection($scope);

		   toast.simpleToast("Cleared filter!");
        }
		
		function addRows($scope)
		{	
			console.log('ADDING ' + $scope.rowNumber + ' row(s)');
			var maxSequence = getMaxSequence($scope);
			if(!angular.isUndefined($scope.rowNumber))
			{
				for( var i = 0; i < $scope.rowNumber; i ++){
					
					var sequence = (maxSequence + i + 1) + '';
					var rowObj = {
						SEQUENCE : sequence,
						IsChecked: false
					};
					
					insertRow($scope, rowObj, sequence);				
				}
			}
			else
			{
				toast.simpleToast("Invalid input");
			}
			
		}
		
		function deleteRows($scope)
		{
			console.log('Deleting rows');
			for(var index = $scope.rows.length - 1; index >= 0; index--)
			{
				var row = $scope.rows[index];
				if(row.IsChecked)
				{
					var deleteRow = {
						condition: new Array()
					};
					
					deleteRow.condition.push({
						columnName: 'SEQUENCE',
						value: row.SEQUENCE
					});

					autoSave($scope, deleteRow, 'deleted', row.SEQUENCE);
					
					$scope.rows.splice(index, 1);
					$scope.data.splice(getRowIndexBySequence($scope.data, row.SEQUENCE), 1);
					
					calculateHeaderSelection($scope);
				}
			}
		}
		
		function copyRows($scope)
		{
			console.log('Copying rows');
			var maxSequence = getMaxSequence($scope);
			angular.forEach($scope.rows, function(row)
			{
				if(row.IsChecked)
				{
					var copyRow = {};
					maxSequence++;
					
					angular.copy(row, copyRow);
					copyRow.SEQUENCE = maxSequence + '';
					copyRow.IsChecked = false;
					
					insertRow($scope, copyRow, copyRow.SEQUENCE);
				}
			});
		}
		
		function insertRow($scope, row, sequence)
		{
			var insert = {
				row : []
			};
			
			setTLStatus(row);
			angular.forEach(_.omit(row, '$$hashKey', 'ROW_SEQ', 'IsChecked'), function(value, key)
			{
				insert.row.push({
					columnName: key,
					value: value
				});
			});
			
			if(row)
			{
				$scope.rows.push(row);
				$scope.data.push(row);
				autoSave($scope, insert, 'added', sequence);

				calculateHeaderSelection($scope);
			}
		}
		
		function saveRow($scope, row)
		{
			var save = {
				row: new Array(),
				condition: new Array()
			};
			
			angular.forEach(_.omit(row, '$$hashKey', 'ROW_SEQ', 'IsChecked'), function(value, key){
				save.row.push({
					columnName: key,
					value: value
				});
			});
			
			save.condition.push({
				columnName: 'SEQUENCE',
				value: row.SEQUENCE
			});
			save.condition.push({
				columnName: 'ITEM_ID',
				value: $scope.itemid
			});
			
			autoSave($scope, save, 'updated', parseInt(row.SEQUENCE))
		}

		function autoSave($scope, rowObject, action, sequence)
		{
			templateBusiness.getReayForAutoSaveHybridTable($scope.itemid, $scope.mnemonicid, rowObject, action, sequence);
		}
		
		function excelUpload($scope)
		{
			console.log('Uploading excel data');
			toast.simpleToast("Please choose file!");

            var uploadElement = $('#hybrid-upload');

            if(uploadElement && uploadElement.length > 0)
            {
                uploadElement.change(function()
                {
                    $(this).off('change');
                    $('#btn-hybrid-upload').click();
                });
                uploadElement.click();
            }
		}
		
		function updateRows(data, $scope)
        {
            console.log('Update Rows');
            console.log(data);
            if(data.data && data.data.length > 0)
            {
				//Header Rows
                var csvHeaders = data.data[0];
                var headerStatus = [];
                var rowIndex = 0;

                angular.forEach($scope.header, function(eachHeader)
                {
					var headerName = eachHeader.HLabel;

					var findHeader = _.find(csvHeaders, function(header)
					{
						if(headerName.toUpperCase() === header.toUpperCase())
						{
							return header;
						}
					});

                    headerStatus.push({
                        name: eachHeader.HLabel,
                        iscsv: !findHeader ? false : true,
                        index: rowIndex
                    });

                    rowIndex++;
                });

                var isAllHeaderAvailable = false;

                isAllHeaderAvailable = _.every(headerStatus, {iscsv: true});

                if(!isAllHeaderAvailable)
                {
                    toast.simpleToast('Program headers does not match. Please download csv or correct headers!');
                }
                else {
                    var rowCount = 0;
                    var message = null;
					var maxSequence = getMaxSequence($scope);

                    removeAllRows($scope);

                    angular.forEach(data.data, function(content)
                    {
                        if(rowCount !== 0)
                        {
							var objRow = {};
							
							angular.forEach($scope.header, function(header)
                            {
								var findHeader = _.find(headerStatus, function(head)
                               {
                                   if(head.name === header.HLabel)
                                   {
                                       return head;
                                   }
                               });

                                if(findHeader)
                                {
                                  var value = content[findHeader.index];
								  objRow[header.HMnemonic] = value;
                                }

                            });
							
							objRow['SEQUENCE'] = (rowCount + maxSequence) + ''; //add max sequence so it doesn't conflict on delete
							insertRow($scope, objRow, (rowCount + maxSequence) + '');
                        }
						
                        rowCount++;
                    });

                    if(message)
                    {
                        message = 'Uploaded successfully!';
                    }

                    toast.simpleToast(message);
                }
            }

            resetUploadElement();
        }
		
		function setTLStatus(row)
		{
			row.TL_STATUS = (row.IsChecked && row.IsChecked === true)? 'Y' : 'N';
		}
		
		function removeAllRows($scope){
			
			clearFilter($scope);
			angular.forEach($scope.rows, function(row){
				row.IsChecked = true;
			});
			
			deleteRows($scope);
		}

        function resetUploadElement()
        {
            var element = $('#hybrid-upload');
            if(element && element.length > 0)
            {
                element[0].value = '';
            }

            console.log(element);
        }
		
		function excelDownload($scope)
		{
			console.log('Downloading data to excel');
			var linkElement = $('#link-hybrid-download');
			var dataInfo = [];
			var data = null;
			
			angular.forEach($scope.rows, function(row)
			{
				var data = '';
				data += '{';
				var colCount = 1;
				angular.forEach($scope.header, function(header)
				{	
					var headerName = ' ';
					var columnValue = '';
					
					if(header.HLabel){
						headerName = header.HLabel;
					}
					
					data +=  '"'+ headerName +'":';
					
					if(row[header.HMnemonic])
					{
						columnValue = row[header.HMnemonic];
					}

					if(colCount == $scope.header.length)
					{
					   data +=  '"'+ columnValue +'"';
					}
					else {
					   data +=  '"'+ columnValue +'",';
					}

					colCount++;
				});
				data += '}';
				
				console.log('Data \n' + data);
				console.log(angular.fromJson(data));

				dataInfo.push(angular.fromJson(data));
			});
			
			data = templateBusiness.unParseJsonToCsv(dataInfo);
			
			console.log(data);

			if(data && linkElement && linkElement.length > 0)
			{
				var fileName = 'hybrid_table_' + commonBusiness.projectName.trim() + '.csv';
				linkElement[0].download = fileName;
				linkElement[0].href = 'data:application/csv,' + escape(data);
				linkElement[0].click();
				toast.simpleToast('Finished downloading - ' + fileName);
			}
		}

        function makeSelections($scope, value)
        {
			angular.forEach($scope.rows, function(eachRow)
            {
				if(eachRow.IsChecked !== value)
				{
					eachRow.IsChecked = value;
					$scope.saveRow(eachRow);
				}
            });
        }
		
		function getMaxSequence($scope)
		{
			var max = -1;
			var maxObj =_.max(_.map($scope.data, function(row){ return parseInt(row.SEQUENCE); }));
			return (maxObj)? maxObj : max;
		}
		
		function getRowIndexBySequence(rows, sequence)
		{
			return _.findIndex(rows, {SEQUENCE: sequence});
		}

        function defineHybridLink(scope, el, attrs)
        {
            var dataTableId = scope.itemid;
            /*if(scope.tearsheet.columns.length > 0)
            {*/
                scope.$parent.$parent.isprocesscomplete = false;
                var column = [];
                var columns = '';
                var header = null;

                if(scope.tearsheet.header && scope.tearsheet.header.Headers)
                {
                   scope.header = [];
				   scope.header.push.apply(scope.header,scope.tearsheet.header.Headers);
                }
				
                if(angular.isArray(scope.tearsheet.columns)){
					angular.forEach(scope.tearsheet.columns, function(col){
						column.push.apply(column, col.col);
					});
				}else{
					column.push.apply(column, scope.tearsheet.columns.col);
				}

				scope.columns = [];
                angular.forEach(column, function(col)
                {
                    if(col.TearSheetItem &&
                        col.TearSheetItem.Mnemonic)
                    {
                        columns += col.TearSheetItem.Mnemonic + ',';
						scope.columns.push(col);
                    }
                });
				
				columns += 'TL_STATUS,SEQUENCE';

                var html = '';
                templateService.getDynamicTableData(commonBusiness.projectId, commonBusiness.stepId,
                    scope.mnemonicid, scope.itemid, columns).then(function(response) {

                    var data = response.dynamicTableDataResp;
					
					defineLayout(scope, el);
					defineActions(scope);
					initializeMsg(scope);
					buildRows(scope, data);

					scope.makeSelections = function(value)
					{
						makeSelections(scope, value);
					};

					scope.rowMakeSelection = function()
					{
						calculateHeaderSelection(scope);
					};

					scope.saveRow = function(row)
					{
						setTLStatus(row);
						saveRow(scope, row);
					};
					
					scope.upload = function(){
						var element = el.find('#hybrid-upload');
						if(element && element.length > 0)
						{
							var files = element[0].files;

							if(files && files.length > 0)
							{
								console.log('Files - ');
								console.log(files);
								var data = [];
								templateBusiness.parseCsvToJson(files[0], updateRows, scope);
							}
						}
					};

                    scope.$parent.$parent.isprocesscomplete = true;

					console.log('TableLayout Hybrid Link');
					console.log(scope);
					console.log('TableLayout Hybrid Data');
					console.log(data);
                });
            //}
        }
    }

})();