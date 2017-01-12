(function ()
{
    'use strict';

    angular
        .module('app.core')
        .directive('msExpiringH', msExpiringDirectiveH);

    /** @ngInject */
    function msExpiringDirectiveH($compile, $filter, $window, 
                                    commonBusiness, templateBusiness, 
                                    templateBusinessFormat, templateBusinessSave,
                                    toast, deviceDetector, clientConfig,
                                    DTOptionsBuilder, DTColumnDefBuilder,
                                    templateService, dialog)
    {
        return {
            restrict: 'E',
            scope   : {
                mnemonic: '@',
                itemId: '@',
                tearsheet: '=',
                copyproposed: '@',
                copystepid: '@',
                isnoneditable: '=?'
            },
            templateUrl: 'app/core/directives/ms-template/templates/ms-program/hybrid/expiring/ms-expiring-h.html',
            link: defineExpiringLink
        };

        function defineExpiringLink($scope, el, attrs)
        {
            defineAction($scope);
            initializeMsg($scope);

            $scope.$parent.$parent.isprocesscomplete = false;
			$scope.subMnemonics = templateBusiness.getTableLayoutSubMnemonics($scope.itemId, $scope.mnemonic);

            var columns = '';
            if($scope.tearsheet.header && $scope.tearsheet.header.length > 0){
                columns = _.map($scope.tearsheet.header, function(mnemonic){
                    return mnemonic.HMnemonic;
                }).join(',');

                columns += ',TL_STATUS,SEQUENCE';
            }

            templateService.getDynamicTableData(commonBusiness.projectId, commonBusiness.stepId,
                    $scope.mnemonic, $scope.itemId, columns).then(function(response) {
                        $scope.$parent.$parent.isprocesscomplete = true;

                        $scope.rows = [];
                        _.each(response.dynamicTableDataResp, function(row, index){
                            $scope.rows.push(buildRow($scope, row, index == 0));
                        });

                        if($scope.rows.length < 6) {
                            addRow($scope, 5 - $scope.rows.length);
                            //create empty rows total of 5
                        }

                        templateBusiness.updateProgramTableMnemonics(commonBusiness.projectId, $scope.mnemonic, $scope.itemId, angular.copy($scope.rows));
                        defineLayout($scope, el);
                    }
            );
            
            $scope.updateDropdown = function(value, column, rowId)
            {
                var rowNumber = parseInt(rowId);

                if($scope.rows[rowNumber]) {
                    
                    value = (value === '') ? value = '' : value; 
                    $scope.rows[rowNumber][column].tearsheet.selectedValue = value;
                    $scope.rows[rowNumber][column].value = value;
                    
                    saveRow($scope, $scope.rows[rowNumber]);
                    templateBusiness.updateProgramTableMnemonics(commonBusiness.projectId, $scope.mnemonic, $scope.itemId, angular.copy($scope.rows));
                }
            };
            
            $scope.updateDate = function(value, column, rowId)
            {
                var rowNumber = parseInt(rowId);

                if($scope.rows[rowNumber]) {
                    
                    value = (value === '') ? value = '' : value; 
                    $scope.rows[rowNumber][column].value = value;
                    
                    saveRow($scope, $scope.rows[rowNumber]);
                }
            };

            $scope.calculate = function(currentRow, value, rowId, columnName)
            {
                if(columnName.indexOf('LIMIT') > -1 ||
                   columnName.indexOf('PREMIUM') > -1 ||
                   columnName.indexOf('RETAIN') > -1)
                {
                    var rowNumber = parseInt(rowId);

                    if($scope.rows[rowNumber])
                    {
                        value = (value === '') ? value = '' : value;
                        
                        $scope.rows[rowNumber][columnName].value = value;
                        saveRow($scope, $scope.rows[rowNumber]);

                        if(rowNumber === 0) {
                           
                            //Calculate Rate and Role
                            computeRate($scope.rows[rowNumber], rowNumber + 1);
                            saveRow($scope, $scope.rows[rowNumber]);
                        
                        } else {
                            
                            var prevRowNum = rowNumber - 1;

                            if($scope.rows[prevRowNum]) {
                                computeAtt($scope.rows[rowNumber], $scope.rows[prevRowNum], rowNumber + 1);
                                computeRate($scope.rows[rowNumber], rowNumber + 1);
                                computeRol($scope.rows[rowNumber], $scope.rows[prevRowNum], rowNumber + 1);
                                saveRow($scope, $scope.rows[rowNumber]);
                            }
                        }

                        computeOthers($scope, $scope.rows, rowId);
                    }
                } else {
                    var rowNumber = parseInt(rowId);

                    if($scope.rows[rowNumber])
                    {
                        value = (value === '') ? value = '' : value;
                        
                        $scope.rows[rowNumber][columnName].value = value;
                        saveRow($scope, $scope.rows[rowNumber]);
                    }
                }
                templateBusiness.updateProgramTableMnemonics(commonBusiness.projectId, $scope.mnemonic, $scope.itemId, angular.copy($scope.rows));
            };

            $scope.upload = function()
            {
               //Get the element and files.
               var element = el.find('#expiring-upload');
                if(element && element.length > 0)
                {
                    var files = element[0].files;

                    if(files && files.length > 0)
                    {
                        var data = [];
                       templateBusiness.parseCsvToJson(files[0], updateRows, $scope);
                    }
                }
            };

            $scope.makeSelections = function(currentScope)
            {
                makeSelections(currentScope);
            };

            $scope.rowMakeSelection = function()
            {
                calculateHeaderSelection($scope);
            };
        }

        function defineAction($scope)
        {
            if($scope.copyproposed)
            {
                $scope.$parent.$parent.actions.push({
                    id: 5,
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
                            max: 50,
                            setValue : function (number) {
                                $scope.rowNumber = number;
                            }
                        },
                        {
                            type: 'button',
                            icon: null,
                            name: 'Add',
                            callback: 'EPH-Add'
                        }],
                });
                
                $scope.$parent.$parent.actions.push({
                    id: 6,
                    callback: "EPH-Delete",
                    icon: 'icon-delete',
                    isclicked: null,
                    tooltip: 'Delete Row(s)',
                    type: 'button'
                });
                
                $scope.$parent.$parent.actions.push({
                    id: 1,
                    callback: "EPH-Copy",
                    icon: 'icon-content-copy',
                    isclicked: null,
                    tooltip: 'Copy from Proposed',
                    type: 'button'
                });

                $scope.$parent.$parent.actions.push({
                    id: 2,
                    callback: "EPH-Upload",
                    icon: 'icon-upload',
                    isclicked: null,
                    tooltip: 'Upload From Spreadsheet',
                    type: 'button'
                });

                $scope.$parent.$parent.actions.push({
                    id: 3,
                    callback: "EPH-Download",
                    icon: 'icon-download',
                    isclicked: null,
                    tooltip: 'Download to Spreadsheet',
                    type: 'button'
                });

                $scope.$parent.$parent.actions.push({
                    id: 4,
                    callback: "EPH-Eraser",
                    icon: 'icon-eraser',
                    isclicked: null,
                    tooltip: 'Clear data',
                    type: 'button'
                });
            }
        }

        function defineLayout($scope, el)
        {
            var html = '<table id="expiring" width="100%" dt-options="dtOptions" dt-column-defs="dtColumnDefs" class="row-border hover highlight cell-border" datatable="ng" cellpadding="1" cellspacing="0">';

            $scope.dtOptions = DTOptionsBuilder
                .newOptions()
                .withOption('processing', false)
                .withOption('paging', true)
                .withOption('filter', false)
                .withOption('autoWidth', true)
                .withOption('info', true)
                .withOption('ordering', false)
                .withOption('responsive', false)
                .withPaginationType('full')
                .withDOM('<"top padding-10" <"left"<"length"l>><"right"f>>rt<"top padding-10"<"left"<"info text-bold"i>><"right"<"pagination"p>>>');

            $scope.dtColumnDefs = [
                DTColumnDefBuilder.newColumnDef(0).notSortable()
            ];

            $scope.uploadFileName = '';
            //$scope.rows = $scope.initialRows;
            //$scope.headerItems = [];

            html += defineHeaderLayout($scope);
            html += defineBodyLayout($scope);
            html += '</table>';

            el.find('#expiring-layout').append($compile(html)($scope));
        }

        function defineHeaderLayout($scope)
        {
            var html = '';
            html += '<thead>';
            html += '<tr class="row">';
            html += '<th><md-checkbox ng-model="IsAllChecked" ng-change="makeSelections(this)" aria-label="select all" class="no-padding-margin"></md-checkbox></th>';
            if($scope.tearsheet.header && $scope.tearsheet.header.length > 0) 
            {
                _.each($scope.tearsheet.header, function(header)
                {
                    html += '<th>';
                    html += header.HLabel;
                    html += '</th>';
                });
            }
            html += '</tr>';
            html += '</thead>';

            return html;
        }

        function defineBodyLayout($scope)
        {
            var html = '';
            var columnWidth = '';

            html += '<tbody>';
            html += '<tr ng-repeat="row in rows">';
            html += '<td class="checkbox-column"><md-checkbox class="no-margin-padding" aria-label="Select All" ng-model="row.IsChecked" ng-change="rowMakeSelection();"></md-checkbox></td>';
            
            _.each($scope.tearsheet.rows.col, function(eachCol)
            {
                var tearSheetItem = eachCol.TearSheetItem;
                var itemId = tearSheetItem.ItemId;
                var mnemonicId = tearSheetItem.Mnemonic;
                
                    
                
                if(mnemonicId && mnemonicId === 'ACTION'){
				    return;
                }

                columnWidth = templateBusinessFormat.getAlignmentWidthColumForTableLayout(eachCol, columnWidth);
                html += '<td width='+columnWidth+'>';
                itemId += '';

                switch(tearSheetItem.id)
                {
                    case 'GenericTextItem':
                        var formats = templateBusinessFormat.getProgramTableFormatObject(tearSheetItem, _.find($scope.subMnemonics, {mnemonic: mnemonicId}));
                        html += '<ms-program-text columnname="'+ itemId +'" rowid="{{$index}}" ' +
                            'row="row.'+ itemId + '" compute="calculate(currentRow, value, rowId, columnName)" ' +
                            'itemid="{{row.'+ itemId +'.itemid}}" ' +
                            'mnemonicid="{{row.'+ itemId +'.mnemonicid}}" ' +
                            'value="{{row.'+ itemId +'.value}}" isdisabled="{{row.'+ itemId +'.isdisabled}}" ' +
                            'formats="' + _.escape(angular.toJson(formats)) + '"></ms-program-text>';
                        break;

                    case 'SingleDropDownItem':
                        html += '<ms-program-dropdown tearsheet="{{row.'+ itemId +'.tearsheet}}" ' +
                            'mnemonicid="{{row.' + itemId + '.mnemonicid}}" ' +
                            'rowid="{{$index}}" ' +
                            'compute="updateDropdown(value, \'' + itemId + '\', rowId)" ' +
                            'itemid="{{row.' + itemId + '.itemid}}"></ms-program-dropdown>';
                        break;
                    case 'DateItem':
                            html += '<ms-program-calendar row="row" rowid="{{$index}}" ' +
                            'compute="updateDate(value, \'' + itemId + '\', rowId)" ' +
                            'value="{{row.'+ itemId +'.value}}" ' + 
                            'columnname="'+itemId+'"></ms-program-calendar>';
                        break;

                    default:break;
                }

                html += '</td>';
            });

            html += '</tr>';
            html += '</tbody>';

            return html;
        }

        function buildRow($scope, row, isFirst)
        {
            var makeColDef = '';
            var colCount = 1;
            var totalCount = $scope.tearsheet.rows.col.length;
            var isRowComputed = false;
            makeColDef = '{'
            _.each($scope.tearsheet.rows.col, function(eachCol)
            {
                var tearSheetItem = eachCol.TearSheetItem;
                var itemId = tearSheetItem.ItemId;
                var mnemonicId = tearSheetItem.Mnemonic;

                if(mnemonicId && mnemonicId === 'ACTION'){
                    return;
                }
                
                var value = row[itemId];
                var isDisabled = (itemId.indexOf('RATE') !== -1) ||
                                    (itemId.indexOf('ROL') !== -1) ||
                                    (itemId.indexOf('RETAIN') !== -1 && !(isFirst));

                if(!isRowComputed)
                {
                    isRowComputed = (value !== 'undefined' && value !== '');
                }

                makeColDef +=  '"' + itemId + '":';

                makeColDef += '{ "value":';
                if ((itemId.indexOf('LIMIT') !== -1) ||
                    (itemId.indexOf('PREMIUM') !== -1) ||
                    (itemId.indexOf('RETAIN') > -1))
                {
                    if (value)
                    {
                        makeColDef += '"' + $filter("currency")(value, '') + '",';
                    }
                    else
                    {
                        makeColDef += '"",';
                    }
                }
                else if (itemId.indexOf('RATE') !== -1)
                {
                    if (value)
                    {
                        makeColDef += '"' + $filter("currency")(value, '') + '",';
                    }
                    else
                    {
                        makeColDef += '"",';
                    }
                }
                else if (itemId.indexOf('ROL') !== -1)
                {
                    if (value)
                    {
                        makeColDef += '"' + removeCommaValue($filter("number")(value)) + '",';
                    }
                    else
                    {
                        makeColDef += '"",';
                    }
                }
                else if (itemId.indexOf('CARRIER') > -1 || 
                            itemId.indexOf('COVERAGE') > -1)
                {
                    makeColDef += '"' + value.trim() + '",';
                }
                else
                {
                    makeColDef += '"' + value + '",';
                }
                
                makeColDef += '"itemid":';
                makeColDef += '"' + itemId + '",';
                makeColDef += '"mnemonicid":';
                makeColDef += '"' + mnemonicId + '",';
                makeColDef += '"id":';
                makeColDef += '"' + tearSheetItem.id + '",';
                makeColDef += '"isdisabled":';
                makeColDef += '"' + isDisabled + '"';


                if(tearSheetItem.id === 'SingleDropDownItem')
                {
                    var values = [];
                    var selectedValue = '';
                    _.each(tearSheetItem.param, function(each)
                    {
                        if(each.checked === 'yes')
                        {
                            selectedValue = each.content;
                        }

                        //fix Duplicate value flashes on screen on dropdown
                        values.push(each.content || ' ');
                    });

                    var tearsheet = {
                        label: '',
                        values: values,
                        isdisabled: false,
                        selectedValue: value || selectedValue
                    };

                    makeColDef += ',"tearsheet":';
                    makeColDef += '' + angular.toJson(tearsheet) + '';
                }

                if(colCount === totalCount) {
                    makeColDef += '}'
                }else {
                    makeColDef += '},'
                }
                colCount++;
            });
            makeColDef += '"iscompute":';
            makeColDef += ''+ isRowComputed +'';
            makeColDef += ',"isChecked":';
            makeColDef += 'false';
            makeColDef += ',"SEQUENCE":';
            makeColDef += row.SEQUENCE;
            makeColDef += ',"TL_STATUS":';
            makeColDef += '"' + row.TL_STATUS + '"';
            makeColDef += '}';

            return angular.fromJson(makeColDef);
        }

        function makeSelections($scope)
        {
			_.each($scope.rows, function(eachRow)
            {
				if(eachRow.IsChecked !== $scope.IsAllChecked)
				{
					eachRow.IsChecked = $scope.IsAllChecked;
				}
            });
        }

        function removeCommaValue(inputValue) {
            var outputValue;

            if (inputValue) {
                outputValue = String(inputValue).replace(/\,/g, '');
                return outputValue;
            }
            else {
                return inputValue;
            }
        }

        /*
        * Compute all rows after middle row changes
        * And other rows are filled.
        * */
        function computeOthers($scope, rows, rowNum)
        {
            for(var count = (rowNum); count < rows.length; count++)
            {
                //enable RETAIN/ATT field if first row
                if(rows[count] && rows[count].RETAIN && rows[count].RETAIN.isdisabled){
                    rows[count].RETAIN.isdisabled = count > 0;
                }

                if(rows[count] && rows[count].iscompute)
                {
                    computeAtt(rows[count], rows[count - 1], count + 1);
                    computeRate(rows[count], count + 1);
                    computeRol(rows[count], rows[count - 1], count + 1);
                    saveRow($scope, rows[count]);
                }
            }
        }

        function computeAtt(currentRow, previousRow, rowNumber)
        {
            if(previousRow &&
               currentRow)
            {
                var limit;
                var att;

                if ((rowNumber == 1) && (previousRow.LIMIT.value === '')) {
                    limit = "0";
                }
                else {
                    limit = removeCommaValue(previousRow.LIMIT.value);
                }

                if ((rowNumber == 1) && (previousRow.RETAIN.value === '')) {
                    att = "0";
                }
                else {
                    att = removeCommaValue(previousRow.RETAIN.value);
                }

                var computedAtt = templateBusiness.calculateProgramAtt(limit, att);

                if ((currentRow.LIMIT.value != '') && (currentRow.PREMIUM.value != '') && !isNaN(computedAtt) && isFinite(computedAtt))
                {
                    currentRow.RETAIN.value = $filter("currency")(computedAtt, '', 0);
                }
                else
                {
                    currentRow.RETAIN.value = '';
                }
                currentRow.iscompute = true;
            }
        }

        function computeRate(currentRow, rowNUmber)
        {
            if(currentRow)
            {
                var premium = removeCommaValue(currentRow.PREMIUM.value);
                var limit;
                
                if ((rowNUmber == 1) && (currentRow.LIMIT.value === ''))
                {
                    limit = "0";
                }
                else
                {
                    limit = removeCommaValue(currentRow.LIMIT.value);
                }

                var rate = templateBusiness.calculateProgramRate(premium, limit);

                if (isNaN(rate) || !isFinite(rate)) 
                {
                    rate = '';
                }
                else
                {
                    rate = $filter("currency")(rate, '', 2);
                }

                currentRow.RATEMM.value = rate || '';
                currentRow.iscompute = true;
            }
        }

        function computeRol(currentRow, previousRow, rowNumber)
        {
            if (rowNumber == 1)
            {
                currentRow.ROL.value = 'N/A';
                currentRow.iscompute = true;
            }
            else if(previousRow && currentRow)
            {
                var currentRate = removeCommaValue(currentRow.RATEMM.value);
                var previousRate = removeCommaValue(previousRow.RATEMM.value);

                var rol = templateBusiness.calculateProgramRol(currentRate, previousRate);

                if (isNaN(rol) || !isFinite(rol)) 
                {
                    rol = '';
                }

                currentRow.ROL.value = rol || '';
                currentRow.iscompute = true;
            }
        }

        function initializeMsg($scope)
        {
            commonBusiness.onMsg('EPH-Copy', $scope, function() {

               copyProgram($scope);
            });

            commonBusiness.onMsg('EPH-Upload', $scope, function() {
                uploadExcel();
            });

            commonBusiness.onMsg('EPH-Download', $scope, function() {
                downloadToCSV($scope);
            });

            commonBusiness.onMsg('EPH-Eraser', $scope, function() {
                clearProgram($scope, 'Expiring program cleared!');
            });

            commonBusiness.onMsg('EPH-Add', $scope, function() {
                addRow($scope, $scope.rowNumber);
            });

            commonBusiness.onMsg('EPH-Delete', $scope, function() {
                deleteRows($scope);
            });
        }

        function addRow($scope, rowNumber)
        {
            var maxSequence = getMaxSequence($scope);

			if(!angular.isUndefined(rowNumber))
			{
                if(rowNumber + $scope.rows.length > 50) {
                    rowNumber = 50 - $scope.rows.length;
                    console.log('Reach max row to add, only allowed to add ' + rowNumber + ' row(s).');
                    toast.simpleToast('Reach max row to add, only allowed to add ' + rowNumber + ' row(s).');
                } else {
                    for( var i = 0; i < rowNumber; i ++){
                        
                        var sequence = (maxSequence + i + 1);                        
                        var makeColDef = '{';
                        _.each($scope.tearsheet.header, function(header)
                        {
                            makeColDef += '"'+header.HMnemonic + '":"",';
                        });
                        
                        makeColDef += '"SEQUENCE":';
                        makeColDef += sequence;
                        makeColDef += ',"TL_STATUS":';
                        makeColDef += '"N"';
                        makeColDef += '}';
                        
                        var row = buildRow($scope, angular.fromJson(makeColDef), sequence === 0);
                        insertRow($scope, row, sequence);
                        
                        $scope.rows.push(row);
                    }
                    templateBusiness.updateProgramTableMnemonics(commonBusiness.projectId, $scope.mnemonic, $scope.itemId, angular.copy($scope.rows));
                }
			}
			else
			{
				toast.simpleToast("Invalid input");
			}
        }        
		
		function deleteRows($scope)
		{
             //to get the starting index for recalculation
            var minIndex = $scope.rows.length - 1;

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
                        value: $scope.itemId
                    });

                    if(index < minIndex) {
                        minIndex = index;
                    }
					
					$scope.rows.splice(index, 1);
					autoSave($scope, deleteRow);
					
					calculateHeaderSelection($scope);
				}
			}

            //recalculate based on minimum deleted index
            if($scope.rows.length > 0) {
                computeOthers($scope, $scope.rows, minIndex);
            }
            templateBusiness.updateProgramTableMnemonics(commonBusiness.projectId, $scope.mnemonic, $scope.itemId, angular.copy($scope.rows));
		}

        function downloadToCSV($scope)
        {
            var linkElement = $('#link-expiring-hybrid-download');
            var dataInfo = [];
            var data = null;

            _.each($scope.rows, function(row)
            {
                var data = '';
                data += '{';
                var colCount = 1;
               _.each($scope.tearsheet.header, function(header)
               {
                   var value = row[header.HMnemonic].value;
                   var headerName = header.HLabel;

                   data +=  '"'+ headerName +'":';


                   if(colCount === $scope.tearsheet.header.length)
                   {
                       data +=  '"'+ value +'"';
                   }
                   else {
                       data +=  '"'+ value +'",';
                   }

                   colCount++;
               });
                data += '}';

                dataInfo.push(angular.fromJson(data));
            });

            data = templateBusiness.unParseJsonToCsv(dataInfo);

            // IE 10+ 
            if (deviceDetector.browser === 'ie')
            { 
                console.log('IE 10 +'); 
                var fileName = 'ExpiringProgram_' + commonBusiness.projectName.trim() + '.csv';
                window.navigator.msSaveOrOpenBlob(new Blob([data], {type:  "text/plain;charset=utf-8;"}), fileName);
                toast.simpleToast('Finished downloading - ' + fileName); 
            }else if(data && linkElement && linkElement.length > 0)
            {
                var fileName = 'ExpiringProgram_' + commonBusiness.projectName.trim() + '.csv';
                linkElement[0].download = fileName;
                linkElement[0].href = 'data:application/csv,' + escape(data);
                linkElement[0].click();
                toast.simpleToast('Finished downloading - ' + fileName);
            }
        }

        function clearProgram($scope, message)
        {
            _.each($scope.rows, function(row){
                _.each($scope.tearsheet.header, function(header){
                    if(row[header.HMnemonic].id === 'SingleDropDownItem'){
                        row[header.HMnemonic].tearsheet.selectedValue = '';
                    }
                    row[header.HMnemonic].value = '';
                });
            });

            if(message)
            {
                toast.simpleToast(message);
            }

        }

        //Set values from proposed program table
        //call webservice to ensure get the data whether the copied program table in separate step or not
        function copyProgram($scope){

            var maxSequence = getMaxSequence($scope);
            var tableMnemonic = _.find(templateBusiness.programTableMnemonics, {projectId: commonBusiness.projectId, mnemonic: $scope.mnemonic, itemId: $scope.copyproposed});

             //if no found in programTableMnemonics, call webservice to get data
            if(angular.isUndefined(tableMnemonic)) {

                //used dialog custom to have no buttons to close the dialog
                dialog.custom('Copy Program', 'Please be patient. Copy in-progress.', null, null, null, false);

                var columns = '';
                var stepId = ($scope.copystepid && $scope.copystepid.length > 0)? $scope.copystepid : commonBusiness.stepId;

                if($scope.tearsheet.header && $scope.tearsheet.header.length > 0){
                    columns = _.map($scope.tearsheet.header, function(mnemonic){
                        return mnemonic.HMnemonic;
                    }).join(',');

                    columns += ',TL_STATUS,SEQUENCE';
                }

                templateService.getDynamicTableData(commonBusiness.projectId, stepId,
                        $scope.mnemonic, $scope.copyproposed, columns).then(function(response) {
                           
                            removeAllRows($scope);
                            _.each(response.dynamicTableDataResp, function(row, index){
                                
                                //sets sequence to its previous max sequence so that no conflict on delete condition  
                                row.SEQUENCE = maxSequence + index + 1;
                                
                                var copyRow = buildRow($scope, row, index == 0);
                                insertRow($scope, copyRow, row.SEQUENCE);
                            
                                $scope.rows.push(copyRow);
                            });
                            dialog.close();
                            toast.simpleToast('Proposed program copied!');

                            templateBusiness.updateProgramTableMnemonics(commonBusiness.projectId, $scope.mnemonic, $scope.itemId, angular.copy($scope.rows));
                            templateBusiness.updateProgramTableMnemonics(commonBusiness.projectId, $scope.mnemonic, $scope.copyproposed, angular.copy($scope.rows));
                        }
                );
            } else {
                removeAllRows($scope);
                _.each(tableMnemonic.rows, function(row, index){
                    
                    //sets sequence to its previous max sequence so that no conflict on delete condition  
                    row.SEQUENCE = maxSequence + index + 1;
                    row.IsChecked = false;
                    
                    insertRow($scope, row, row.SEQUENCE);
                
                    $scope.rows.push(row);
                });
                
                toast.simpleToast('Proposed program copied!');
                templateBusiness.updateProgramTableMnemonics(commonBusiness.projectId, $scope.mnemonic, $scope.itemId, angular.copy($scope.rows));
            }
            
        }

        function uploadExcel()
        {
            toast.simpleToast("Please choose file!");

            var uploadElement = $('#expiring-upload');

            if(uploadElement && uploadElement.length > 0)
            {
                    setTimeout(function () {
                        uploadElement.change(function(e)
                        {
                            setTimeout(function () {
                                $(this).off('change');
                                angular.element('#btn-expiring-upload').trigger('click');
                                // $('#btn-expiring-upload').click();
                            }, 500);
                        });

                        uploadElement.click();
                    }, 500);
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

                _.each($scope.tearsheet.header, function(eachHeader)
                {
                    var headerName = eachHeader.HLabel;
                    var headerMnemonic = eachHeader.HMnemonic;

                    var findHeader = _.find(csvHeaders, function(header)
                    {
                        if(headerName.toUpperCase() === header.toUpperCase())
                        {
                            return header;
                        }
                    });

                    headerStatus.push({
                        name: headerName,
                        mnemonic: headerMnemonic,
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
                    var message = null;
                    var maxSequence = getMaxSequence($scope);

                    removeAllRows($scope);

                    _.each(data.data, function(content, rowCount)
                    {
                        if(rowCount === 50)
                        {
                            message = "Only " + $scope.rows.length + ' rows are allowed. Uploaded successfully!';
                            return;
                        }

                        if(rowCount !== 0)
                        {
                            var makeColDef = '{';
                            _.each($scope.tearsheet.header, function(header)
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
                                    var value = (_.find($scope.subMnemonics, {mnemonic: findHeader.mnemonic}).dataType === 'NUMBER') ? removeCommaValue(content[findHeader.index]): content[findHeader.index]; //;
                                    makeColDef += '"'+header.HMnemonic + '":"' + value + '",';
                                }
                            });
                            
                            makeColDef += '"SEQUENCE":';
                            makeColDef += maxSequence + rowCount;
                            makeColDef += ',"TL_STATUS":';
                            makeColDef += '"N"';
                            makeColDef += '}';

                            var row = buildRow($scope, angular.fromJson(makeColDef), rowCount === 1);
                            insertRow($scope, row, maxSequence + rowCount);
                            $scope.rows.push(row);
                        }
                        
                        rowCount++;
                    });

                    computeRate($scope.rows[0], 0);
                    computeOthers($scope, $scope.rows, 1);
                    if(message == null)
                    {
                        message = 'Uploaded successfully!';
                    }
                    templateBusiness.updateProgramTableMnemonics(commonBusiness.projectId, $scope.mnemonic, $scope.itemId, angular.copy($scope.rows));
                    toast.simpleToast(message);
                }
            }

            resetUploadElement();
        }

		function removeAllRows($scope){
			
			//clearFilter($scope);
			_.each($scope.rows, function(row){
				row.IsChecked = true;
			});
			
			deleteRows($scope);
		}

        function resetUploadElement()
        {
            var element = $('#expiring-upload');
            if(element && element.length > 0)
            {
                element[0].value = '';
            }
        }

        function getMaxSequence($scope)
		{
			var maxObj =_.max(_.map($scope.rows, function(row){ return parseInt(row.SEQUENCE); }));
			return (_.isUndefined(maxObj))? -1 : maxObj;
		}

        function insertRow($scope, row, sequence)
		{
			var insert = {
                action: 'added', 
                sequence: sequence,
				row : []
			};
			
			setTLStatus(row);
			_.each(_.omit(row, '$$hashKey', 'ROW_SEQ', 'isChecked', 'iscompute'), function(value, key)
			{
                if(angular.isObject(value)) {
                    if(value.value && value.itemid){
                        insert.row.push({
                            columnName: value.itemid,
                            value: (_.find($scope.subMnemonics, {mnemonic: key}).dataType === 'NUMBER') ? removeCommaValue(value.value): value.value
                        });
                    }
                }else {
                    insert.row.push({
                        columnName: key,
                        value: value
                    });
                }
			});
			
			if(insert.row.length > 0)
			{
				autoSave($scope, insert);

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
			
			_.each(_.omit(row, '$$hashKey', 'ROW_SEQ', 'isChecked', 'iscompute'), function(value, key){
                if(angular.isObject(value)) {
                    if(value.value && value.itemid){
                        save.row.push({
                            columnName: value.itemid,
                            value: (_.find($scope.subMnemonics, {mnemonic: key}).dataType === 'NUMBER') ? removeCommaValue(value.value): value.value
                        });
                    }
                }else {
                    save.row.push({
                        columnName: key,
                        value: value
                    });
                }
			});
			
			save.condition.push({
				columnName: 'SEQUENCE',
				value: row.SEQUENCE
			});
			save.condition.push({
				columnName: 'ITEM_ID',
				value: $scope.itemId
			});
			
			autoSave($scope, save);
		}

        function setTLStatus(row)
		{
			row.TL_STATUS = (row.IsChecked && row.IsChecked === true)? 'Y' : 'N';
		}

        function calculateHeaderSelection($scope)
        {
			$scope.IsAllChecked = _.every($scope.rows, function(row) { return row.IsChecked; });
        }

		function autoSave($scope, rowObject)
		{
			templateBusinessSave.getReadyForAutoSave($scope.itemId, $scope.mnemonic, rowObject, clientConfig.uiType.tableLayout);
		}
    }

})();