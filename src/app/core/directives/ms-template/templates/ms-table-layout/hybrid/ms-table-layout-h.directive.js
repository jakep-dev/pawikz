(function ()
{
    'use strict';

    angular
        .module('app.core')
        .directive('msTablelayoutH', msTablelayoutHDirective);

    /** @ngInject */
    function msTablelayoutHDirective($compile, $timeout, templateService, 
									 commonBusiness, templateBusiness,
                                     DTOptionsBuilder, DTColumnDefBuilder, 
									 toast, deviceDetector, clientConfig,
									 templateBusinessFormat, templateBusinessSave)
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
            var html = '<table id="tablelayout-hybrid-'+$scope.itemid+'" ng-show="isTableShow" width="100%" dt-instance="dtInstance" dt-options="dtOptions" ' +
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
				.withOption('initComplete', function(){
					onSearch($scope);
				})
                .withPaginationType('full')
                .withDOM('<"top bottom padding-10 topTableLayout"<"left"<"length"l>><"right"f>>rt<"bottom padding-10 bottomTableLayout"<"left"<"info text-bold"i>><"right"<"pagination"p>>>');


            $scope.dtColumnDefs = [
                DTColumnDefBuilder.newColumnDef(0).notSortable()
            ];

            //Defining the header here.
            html += defineHeaderLayout($scope);
            html += defineBodyLayout($scope);
			html += defineFooterLayout($scope);
            html += '</table>';

            el.find('#ms-table-layout-hybrid').append($compile(html)($scope));
        }

		function onSearch($scope) {
			$('#tablelayout-hybrid-' + $scope.itemid + '_filter input').unbind();
			$('#tablelayout-hybrid-' + $scope.itemid + '_filter input').bind('keyup input propertychange', function(e) {
				
				var search = this.value;				
				var dataTabale = $scope.dtInstance.dataTable;
				var oTable = $scope.dtInstance.DataTable;
				oTable.search(search);
				 
				if(e.keyCode == 13 || search.length == 0) {

					if(dataTabale) {
						
						var cells = angular.element(dataTabale).find('td');
						_.each(cells, function(cell){
							if(oTable) {
								oTable.cell(cell).invalidate().draw();
							}
						});

						oTable.search(search);
					}
				}
			 });
		}

        function buildRows($scope, data)
        {
            $scope.data = [];

            angular.forEach(data, function(eachData)
            {
               eachData.IsChecked = (eachData.TL_STATUS === 'N');
            });

            $scope.data.push.apply($scope.data, data);
            $scope.rows.push.apply($scope.rows, data);
			
			calculateHeaderSelection($scope);
        }

        function defineBodyLayout($scope)
        {
           $scope.rows = [];
		   $scope.footerMnemonics = [];

           var html = '<tbody>';
           html += '<tr ng-repeat="row in rows">';
		   
           if($scope.columns.length > 0)
           {
				html += '<td style="width:1%"><md-checkbox class="no-margin-padding" aria-label="Select All" ng-model="row.IsChecked" ng-change="rowMakeSelection();saveRow(row)"></md-checkbox></td>';
                angular.forEach($scope.columns, function(eachCol)
                {
                    var tearSheetItem = eachCol.TearSheetItem;
                    if(tearSheetItem)
                    {

						var itemId = tearSheetItem.ItemId;
						var mnemonicId = tearSheetItem.Mnemonic;
						var onChange = tearSheetItem.onChange;
						var computationSearchStr = 'javascript:computeTotal(';
						var computation = '';
						
						if(onChange && onChange.indexOf(computationSearchStr) > -1) {
							computation = onChange.substring(onChange.indexOf(computationSearchStr) + computationSearchStr.length);
							computation = computation.substring(0, computation.indexOf(')'));
							var tempArr = computation.split(',');
							var addtemId = tempArr[0].replace(/'/g,"").trim() || '';
							var totalItemId = tempArr[1].replace(/'/g,"").trim() || '';
							
							$scope.footerMnemonics.push({
								mnemonic: null,
								itemId: totalItemId,
								value: 0,
								summation: itemId,
								header: ''
							});
						}
						
						if(mnemonicId && mnemonicId === 'ACTION'){
							return;
						}
                        
                        html += '<td>';
						switch (tearSheetItem.id)
                        {
                            case 'GenericSelectItem':
								html += '<span style="display:none">{{row.' + itemId + '}}</span>'; // for easy sorting & searching
								html += '<ms-hybrid-checkbox row="row" save="saveRow(row)" ' +
												'text="'+tearSheetItem.param.content+'" columnname="'+itemId+'"></ms-hybrid-checkbox>';
                                break;
							case 'GenericTextItem':
								var formats = templateBusinessFormat.getHybridTableFormatObject(tearSheetItem, _.find($scope.subMnemonics, {mnemonic: mnemonicId}));
								html += '<span style="display:none">{{removeFormatData(row.'+ itemId + ', "'+ itemId + '")}} {{row.' + itemId + '}}</span>'; // remove formats for easy sorting & searching								
								html += '<ms-hybrid-text row="row" save="saveRow(row)" columnname="'+itemId+'" formats="' + _.escape(angular.toJson(formats)) + '"></ms-hybrid-text>';
								break;
							case 'DateItem':
								html += '<span style="display:none">{{row.'+ itemId + '}} {{formatDate(row.'+ itemId + ', "M/D/YYYY")}}</span>'; // remove formats for easy sorting & searching
								html += '<ms-hybrid-calendar row="row" save="saveRow(row)" columnname="'+itemId+'"></ms-hybrid-calendar>';
								break;
							case 'SingleDropDownItem':
								var defaultValue = '';
								
								$scope.selections = [];
								
								angular.forEach(tearSheetItem.param, function(each)
								{
									if(angular.lowercase(each.checked) === 'yes')
									{
										defaultValue = each.content;
									}
									
									$scope.selections.push(
										each.content
									);
								});
								
								html += '<span style="display:none">{{row.' + itemId + '}}</span>'; // for easy sorting & searching
								html += '<ms-hybrid-dropdown ' +
									'row="row" ' +
									'save="saveRow(row)" ' +
									'itemid="'+ itemId +'" ' +
									'mnemonicid="'+ mnemonicId +'" ' +
									'columnname="'+itemId+'" ' +
									'selections="selections" '+
									'defaultvalue="' + defaultValue + '" ></ms-hybrid-dropdown>';
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
                html += '<th style="width:1%"><md-checkbox ng-model="IsAllChecked" ng-change="makeSelections(this)" aria-label="select all" ' +
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
		
		function defineFooterLayout($scope)
		{
			var html = '';
			var label = '';
			var rows = [];
			
			if($scope.tearsheet && $scope.tearsheet.footer)
			{	
				if($scope.tearsheet.footer.length) {
					rows = $scope.tearsheet.footer;
				}else {
					rows.push($scope.tearsheet.footer);
				}

				html += '<tfoot>';
				
				angular.forEach(rows, function(row) 
				{
					html += '<tr>';
					angular.forEach(row.col, function(eachCol)
					{
						var colspan = eachCol.colspan || 1;
						var tearSheetItem = eachCol.TearSheetItem;
						var classValue = 'align-left';
                        classValue = templateBusinessFormat.getAlignmentForTableLayoutGenericTextItem(eachCol, classValue);
						
						if(tearSheetItem)
						{
							html += '<td class="' + classValue + '" colspan="' + colspan + '">';
							
							var itemId = tearSheetItem.ItemId;
							var mnemonicId = tearSheetItem.Mnemonic;
							
							switch (tearSheetItem.id)
							{
								case 'GenericTextItem':
									var value = templateBusiness.getMnemonicValue(itemId, mnemonicId);
									var footerIndex = _.findIndex($scope.footerMnemonics, {itemId : itemId});
									
									
									$scope.footerMnemonics[footerIndex].mnemonic = mnemonicId;
									$scope.footerMnemonics[footerIndex].value = value;
									$scope.footerMnemonics[footerIndex].header = label;
									label = '';
									
									html += '<span>{{numberWithCommas(footerMnemonics[' + footerIndex + '].value)}}</span>';
									break;
								case 'LabelItem':
									html += '<span>' + tearSheetItem.Label + '</span>';
									label = tearSheetItem.Label;
									break;
								default:
									html += '<span>Under Construction</span>';
									break;
							}
							
							html += '</td>';
						}
					});
					html += '</tr>';
				});
				
				html += '</tfoot>';
			}
			
			return html;
		}

        function defineActions($scope)
        {			
			$scope.$parent.$parent.actions.push({
				id: 1,
				callback: null,
				icon: 'icon-plus',
				isclicked: null,
				tooltip: 'Add Rows',
				type: 'menu',
                scope: $scope,
                menus:[
					{
						type: 'button',
						icon: null,
						name: '1 row',
						callback: $scope.itemid + '-Add',
						callbackParam: 1
					},
					{
						type: 'button',
						icon: null,
						name: '5 rows',
						callback: $scope.itemid + '-Add',
						callbackParam: 5
					},
					{
						type: 'button',
						icon: null,
						name: '10 rows',
						callback: $scope.itemid + '-Add',
						callbackParam: 10
					},
					{
						type: 'button',
						icon: null,
						name: '15 rows',
						callback: $scope.itemid + '-Add',
						callbackParam: 15
					},
					{
						type: 'button',
						icon: null,
						name: '20 rows',
						callback: $scope.itemid + '-Add',
						callbackParam: 20
					}
				],
			});
			
			$scope.$parent.$parent.actions.push({
				id: 2,
				callback: $scope.itemid + '-Delete',
				icon: 'icon-delete',
				isclicked: null,
				tooltip: 'Delete Rows',
				type: 'button'
			});
			
			$scope.$parent.$parent.actions.push({
				id: 3,
				callback: $scope.itemid + '-Copy',
				icon: 'icon-content-copy',
				isclicked: null,
				tooltip: 'Copy Row',
				type: 'button'
			});

            $scope.$parent.$parent.actions.push({
                id: 4,
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
				id: 5,
				callback: $scope.itemid + '-Download',
				icon: 'icon-download',
				isclicked: null,
				tooltip: 'Excel Download',
				type: 'button'
			});
			
			$scope.$parent.$parent.actions.push({
				id: 6,
				callback: $scope.itemid + '-Upload',
				icon: 'icon-upload',
				isclicked: null,
				tooltip: 'Excel Upload',
				type: 'button'
			});
        }

        function calculateHeaderSelection($scope)
        {
			$scope.IsAllChecked = _.every($scope.rows, function(row) { return row.IsChecked; });

			//get Header checkbox scope
			//header scope is recreated when data table is redrawn
			if($scope.dtInstance.DataTable){
				var checkbox = angular.element($scope.dtInstance.DataTable.column(0).header()).find('md-checkbox').scope();
				if(checkbox) {
					checkbox.IsAllChecked = $scope.IsAllChecked;
				}
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

            commonBusiness.onMsg($scope.itemid + '-Copy', $scope, function() {

                copyRows($scope);
            });		

            commonBusiness.onMsg($scope.itemid + '-Download', $scope, function() {

                excelDownload($scope);
            });	

            commonBusiness.onMsg($scope.itemid + '-Upload', $scope, function() {
				toast.simpleToast("Please choose file!", 300);
				if (deviceDetector.browser === 'ie') {
                    $timeout(function () {
                        excelUpload($scope);
                    }, 1000);
                } else {
                    excelUpload($scope);
                }
                
            });

            commonBusiness.onMsg($scope.itemid + '-Delete', $scope, function() {

                deleteRows($scope);
            });

            commonBusiness.onMsg($scope.itemid + '-Add', $scope, function(ev, data) {
                $timeout(function(){
                    addRows($scope, data);
                }, 0);
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

			if($scope.isExcelUpload === false) {
				toast.simpleToast("Cleared filter!");
			}
        }
		
		function addRows($scope, rowNumber)
		{
			var maxSequence = getMaxSequence($scope);
			for( var i = 0; i < rowNumber; i ++){
				
				var sequence = (maxSequence + i + 1) + '';
				var rowObj = {
					SEQUENCE : sequence,
					IsChecked: true
				};
				
				insertRow($scope, rowObj, sequence);				
			}
			
		}
		
		function deleteRows($scope)
		{
			for(var index = $scope.rows.length - 1; index >= 0; index--)
			{
				var row = $scope.rows[index];
				if(row.IsChecked)
				{
					var deleteRow = {
						action: 'deleted',
                		sequence: row.SEQUENCE,
						condition: []
					};
					
					deleteRow.condition.push({
						columnName: 'SEQUENCE',
						value: row.SEQUENCE
					});

                    deleteRow.condition.push({
                        columnName: 'ITEM_ID',
                        value: $scope.itemid
                    });
					
					$scope.rows.splice(index, 1);
					$scope.data.splice(getRowIndexBySequence($scope.data, row.SEQUENCE), 1);
					autoSave($scope, deleteRow);
					
					calculateHeaderSelection($scope);
				}
			}
		}
		
		function copyRows($scope)
		{
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
				action: 'added',
                sequence: sequence,
				row : []
			};
			
			setTLStatus(row);
			angular.forEach(_.omit(row, '$$hashKey', 'ROW_SEQ', 'IsChecked'), function(value, key)
			{
				insert.row.push({
					columnName: key,
					value: (angular.isDate(value)) ?  templateBusiness.formatDate(value, 'DD-MMM-YY') : templateBusiness.removeFormatData(value, _.find($scope.subMnemonics, {mnemonic: key}))
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
				action: 'updated',
                sequence: parseInt(row.SEQUENCE),
				row: [],
				condition: []
			};
			
			angular.forEach(_.omit(row, '$$hashKey', 'ROW_SEQ', 'IsChecked'), function(value, key){
				save.row.push({
					columnName: key,
					value: (angular.isDate(row[key])) ?  templateBusiness.formatDate(row[key], 'DD-MMM-YY') : templateBusiness.removeFormatData(row[key], _.find($scope.subMnemonics, {mnemonic: key}))
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
			
			autoSave($scope, save);
		}

		function autoSave($scope, rowObject)
		{
			angular.forEach($scope.footerMnemonics, function(mnemonic)
			{
				computeTotal($scope, mnemonic.summation, mnemonic.itemId);
			});
			templateBusinessSave.getReadyForAutoSave($scope.itemid, $scope.mnemonicid, rowObject, clientConfig.uiType.tableLayout);
		}
		
		function computeTotal($scope, summation, total)
		{
			var totalValue = 0;
			angular.forEach($scope.rows, function(eachRow)
			{
				if(eachRow[summation]) 
				{
					totalValue += Number(templateBusiness.removeFormatData(eachRow[summation], _.find($scope.subMnemonics, {mnemonic: summation})));
				}
			});
			
			var footerIndex = _.findIndex($scope.footerMnemonics, {itemId : total});
			
			$scope.footerMnemonics[footerIndex].value = totalValue;
			templateBusinessSave.getReadyForAutoSave($scope.footerMnemonics[footerIndex].itemId, $scope.footerMnemonics[footerIndex].mnemonic, totalValue, clientConfig.uiType.general);
			
		}
		
		function excelUpload($scope)
		{
            var uploadElement = angular.element('#hybrid-upload');

            if(uploadElement && uploadElement.length > 0)
            {
				$timeout(function(){
					uploadElement.off('change');
					uploadElement.change(function()
					{
						$timeout(function(){
							angular.element('#btn-hybrid-upload').trigger('click');
						}, 0);
					});

					uploadElement.click();
				}, 0);
            }
		}
		
		function updateRows(data, $scope)
        {
            if(data.data && data.data.length > 0)
            {
				//Header Rows
                var csvHeaders = data.data[0];
                var headerStatus = [];
                var rowIndex = 0;

                angular.forEach($scope.header, function(eachHeader, headerIndex)
                {
					var headerName = eachHeader.HLabel;

					var findHeader = _.find(csvHeaders, function(header, columnIndex)
					{
						if(headerName.toUpperCase() === header.toUpperCase() &&
								headerIndex === columnIndex)
						{
							return header;
						}
					});

                    headerStatus.push({
                        name: eachHeader.HLabel,
						mnemonic: eachHeader.HMnemonic,
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
                                   if(head.mnemonic === header.HMnemonic)
                                   {
                                       return head;
                                   }
                               });

                                if(findHeader)
                                {
                                  var value = (_.find($scope.subMnemonics, {mnemonic: header.HMnemonic}).dataType === 'DATE')? templateBusiness.parseDate(content[findHeader.index], 'M/D/YYYY') : content[findHeader.index];
								  objRow[header.HMnemonic] = value;
                                }

                            });
							
							objRow.SEQUENCE = (rowCount + maxSequence) + ''; //add max sequence so it doesn't conflict on delete
							objRow.IsChecked = true;
							insertRow($scope, objRow, (rowCount + maxSequence) + '');
                        }
						
                        rowCount++;
                        message = 'Uploaded successfully!';
                    });

                    if(message)
                    {
                    	toast.simpleToast(message);
                    }
                }
            }

            resetUploadElement();
        }
		
		function setTLStatus(row)
		{
			row.TL_STATUS = (row.IsChecked && row.IsChecked === true)? 'N' : 'C';
		}
		
		function removeAllRows($scope){
			
			$scope.isExcelUpload = true;
			clearFilter($scope);
			$scope.isExcelUpload = false;

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
        }
		
		function excelDownload($scope)
		{
			var linkElement = $('#link-hybrid-download');
			var dataInfo = [];
			var data = null;

			//Insert Header
			data = [];
			angular.forEach($scope.header, function(header) {
				data.push(header.HLabel);
			});
			dataInfo.push(angular.fromJson(data));

			//Insert Row Data
			angular.forEach($scope.rows, function(row)
			{
				data = [];
				angular.forEach($scope.header, function(header)
				{
					var columnValue = '';
					if(row[header.HMnemonic])
					{
						columnValue = (_.find($scope.subMnemonics, {mnemonic: header.HMnemonic}).dataType === 'DATE')? templateBusiness.formatDate(row[header.HMnemonic], 'M/D/YYYY') : row[header.HMnemonic]; + '"';
					}

					data.push(columnValue)
				});
				dataInfo.push(angular.fromJson(data));
			});
			
			//insert footer data
			if($scope.footerMnemonics && $scope.footerMnemonics.length > 0)
			{
				angular.forEach($scope.footerMnemonics, function(footer)
				{
					data = [];
					data.push(footer.header);
					data.push(footer.value);
					
					dataInfo.push(angular.fromJson(data));
				});
			}
			
			data = templateBusiness.unParseJsonToCsv(dataInfo);

			if (deviceDetector.browser === 'ie')
            {
				var fileName = 'hybrid_table_' + commonBusiness.projectName.trim() + '.csv';
                window.navigator.msSaveOrOpenBlob(new Blob([data], {type:  "text/plain;charset=utf-8;"}), fileName);
                toast.simpleToast('Finished downloading - ' + fileName); 
			} else if(data && linkElement && linkElement.length > 0)
			{
				var fileName = 'hybrid_table_' + commonBusiness.projectName.trim() + '.csv';
				linkElement[0].download = fileName;
				linkElement[0].href = 'data:application/csv,' + escape(data);
				linkElement[0].click();
				toast.simpleToast('Finished downloading - ' + fileName);
			}
		}

        function makeSelections($scope)
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
		
		function getMaxSequence($scope)
		{
			var maxObj =_.max(_.map($scope.data, function(row){ return parseInt(row.SEQUENCE); }));
			return (_.isUndefined(maxObj))? -1 : maxObj;
		}
		
		function getRowIndexBySequence(rows, sequence)
		{
			return _.findIndex(rows, {SEQUENCE: sequence});
		}

        function defineHybridLink(scope, el, attrs)
        {
			//disable excel download in ms-componenet
        	scope.$parent.$parent.vm.isExcelDownloadable = false;
            
			var dataTableId = scope.itemid;
            /*if(scope.tearsheet.columns.length > 0)
            {*/
                scope.$parent.$parent.isprocesscomplete = false;
				scope.subMnemonics = templateBusiness.getTableLayoutSubMnemonics(scope.itemid, scope.mnemonicid);

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

                    var data = null; 
					if(response.dynamicTableDataResp) {
						data =  _.sortBy(response.dynamicTableDataResp, function(row){
							return (row.SEQUENCE && parseInt(row.SEQUENCE) ) ? parseInt(row.SEQUENCE) : 0; 
						});
					}
					
					defineLayout(scope, el);
					defineActions(scope);
					initializeMsg(scope);
					buildRows(scope, data);

					scope.makeSelections = function(currentScope)
					{
						makeSelections(currentScope);
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
					
					scope.formatDate = function(value, format)
					{
						if(!angular.isDate(value))
						{
							value = templateBusiness.parseDate(value, 'DD-MMM-YY');
						}
						return templateBusiness.formatDate(value, format);
					};
					
					scope.numberWithCommas = function(value)
					{
						return templateBusiness.numberWithCommas(value);
					};
					
					scope.removeFormatData = function(value, subMnemonic)
					{
						return templateBusiness.removeFormatData(value, _.find(scope.subMnemonics, {mnemonic: subMnemonic}));
					};
					
					scope.upload = function(){
						var element = el.find('#hybrid-upload');
						if(element && element.length > 0)
						{
							var files = element[0].files;

							if(files && files.length > 0)
							{
								var data = [];
								templateBusiness.parseCsvToJson(files[0], updateRows, scope);
							}
						}
					};

                    scope.$parent.$parent.isprocesscomplete = true;
                });
        }
    }

})();