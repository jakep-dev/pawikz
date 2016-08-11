(function ()
{
    'use strict';

    angular
        .module('app.core')
        .directive('msProposed', msProposedDirective);

    /** @ngInject */
    function msProposedDirective($compile, $filter, commonBusiness, templateBusiness, DTOptionsBuilder, toast)
    {
        return {
            restrict: 'E',
            scope   : {
                tearsheet: '=',
                copyexpiring: '@',
                isnoneditable: '=?'
            },
            templateUrl: 'app/core/directives/ms-template/templates/ms-program/proposed/ms-proposed.html',
            link: function(scope, el, attrs)
            {
                console.log('Proposed Program');
                console.log(scope);
                defineAction(scope);
                initializeMsg(scope);
                defineLayout(scope, el);
            }
        };

        function defineAction($scope)
        {
            if($scope.copyexpiring)
            {
                $scope.$parent.$parent.actions.push({
                    id: 1,
                    callback: "ProposedProgram",
                    icon: 'icon-content-copy',
                    isclicked: null,
                    tooltip: 'Copy from Expiring',
                    type: 'button'
                });

                $scope.$parent.$parent.actions.push({
                    id: 2,
                    callback: "PP-Upload",
                    icon: 'icon-upload',
                    isclicked: null,
                    tooltip: 'Upload From Spreadsheet',
                    type: 'button'
                });

                $scope.$parent.$parent.actions.push({
                    id: 3,
                    callback: "PP-Download",
                    icon: 'icon-download',
                    isclicked: null,
                    tooltip: 'Download to Spreadsheet',
                    type: 'button'
                });

                $scope.$parent.$parent.actions.push({
                    id: 4,
                    callback: "PP-Eraser",
                    icon: 'icon-eraser',
                    isclicked: null,
                    tooltip: 'Clear data',
                    type: 'button'
                });
            }
        }

        function defineLayout($scope, el)
        {
            var html = '<table id="proposed" width="100%" dt-options="dtOptions" class="row-border hover highlight cell-border" datatable="ng" cellpadding="1" cellspacing="0">';

            $scope.dtOptions = DTOptionsBuilder
                .newOptions()
                .withOption('processing', false)
                .withOption('paging', false)
                .withOption('filter', false)
                .withOption('autoWidth', true)
                .withOption('info', false)
                .withOption('ordering', false)
                .withOption('responsive', false);

            //Header Details
            html += '<thead>';
            html += '<tr class="row">';
            angular.forEach($scope.tearsheet.row[0].col, function(eachCol)
            {
                var tearSheetItem = eachCol.TearSheetItem;
                html += '<th>';
                html += tearSheetItem.Label;
                html += '</th>';
            });
            html += '</tr>';
            html += '</thead>';


            $scope.uploadFileName = '';
            $scope.rows = [];
            $scope.headerItems = [];

            defineUpload($scope);

            $scope.updateCarrier = function (value, rowId)
            {
                var rowNumber = parseInt(rowId);

                var findRow = _.filter($scope.rows, function (row) {
                    if (row.rowid === rowNumber) {
                        return row;
                    }
                });

                if (findRow &&
                   findRow.length === 1) {
                    if (value === '') {
                        value = '""';
                    }
                    else {
                        value = '"' + value + '"';
                    }
                    var rowExp = 'findRow[0].CARRIER.tearsheet.selectedValue = ' + value + ';';
                    eval(rowExp);
                }
            };

            $scope.calculate = function (currentRow, value, rowId, columnName)
            {
                if(columnName.indexOf('LIMIT') > -1 ||
                    columnName.indexOf('PREMIUM') > -1 ||
                    columnName.indexOf('RET') > -1)
                {
                    var rowNumber = parseInt(rowId);

                    var findRow = _.filter($scope.rows, function(row)
                    {
                        if(row.rowid === rowNumber)
                        {
                            return row;
                        }
                    });

                    if(findRow &&
                        findRow.length === 1)
                    {
                        if(value === '')
                        {
                            value = '""';
                        }
                        else 
                        {
                            value = '"' + value + '"';
                        }
                        var rowExp = 'findRow[0].' + columnName + '.value = ' + value + ';';
                        eval(rowExp);

                        //Based on column Name & Row Number - Calculate the fields.
                        //No Calculations for Row 1.
                        if(rowNumber === 1)
                        {
                            //Calculate Rate and Role
                            computeRate(findRow[0]);
                        }
                        else {
                            var prevRowNum = rowNumber - 1;
                            var prevRow = _.filter($scope.rows, function(row)
                            {
                                if(row.rowid === prevRowNum)
                                {
                                    return row;
                                }
                            });

                            //Calculate Att
                            computeAtt(findRow[0], prevRow[0]);
                            computeRate(findRow[0]);
                            computeRol(findRow[0], prevRow[0]);
                        }

                        computeOthers($scope.rows, rowId);
                    }
                }
            };

            $scope.upload = function()
            {
                console.log('Upload Firing Only one time');
                console.log($scope);
                //Get the element and files.
                var element = el.find('#proposed-upload');
                if(element && element.length > 0)
                {
                    var files = element[0].files;

                    if(files && files.length > 0)
                    {
                        console.log('Files - ');
                        console.log(files);
                        var data = [];
                        templateBusiness.parseCsvToJson(files[0], updateRows, $scope);
                    }
                }
            };



            html += '<tbody>';
            html += '<tr ng-repeat="row in rows">';
            angular.forEach($scope.tearsheet.row[1].col, function(eachCol)
            {
                var tearSheetItem = eachCol.TearSheetItem;
                var itemId = tearSheetItem.ItemId;
                var mnemonicId = tearSheetItem.Mnemonic;
                var newItemId = templateBusiness.getNewItemId(itemId);
                html += '<td>';

                $scope.headerItems.push( {name:newItemId, type: tearSheetItem.id} );

                switch(tearSheetItem.id)
                {
                    case 'GenericTextItem':
                        html += '<ms-program-text columnname="'+ newItemId +'" rowid="{{row.rowid}}" ' +
                            'row="row.'+ newItemId + '" compute="calculate(currentRow, value, rowId, columnName)" ' +
                            'itemid="{{row.'+ newItemId +'.itemid}}" ' +
                            'mnemonicid="{{row.'+ newItemId +'.mnemonicid}}" ' +
                            'value="{{row.'+ newItemId +'.value}}" isdisabled="{{row.'+ newItemId +'.isdisabled}}"></ms-program-text>';
                        break;

                    case 'SingleDropDownItem':
                        html += '<ms-program-dropdown tearsheet="{{row.'+ newItemId +'.tearsheet}}" ' +
                            'mnemonicid="{{row.' + newItemId + '.mnemonicid}}" ' +
                            'rowid="{{row.rowid}}" ' +
                            'compute="updateCarrier(value, rowId)" ' +
                            'itemid="{{row.' + newItemId + '.itemid}}"></ms-program-dropdown>';
                        break;

                    default:break;
                }

                html += '</td>';
            });

            html += '</tr>';
            html += '</tbody>';
            html += '</table>';


            var rowCount = 0;
            var makeColDef = '';
            angular.forEach($scope.tearsheet.row, function(eachRow)
            {
                if(rowCount !== 0 && eachRow.col &&
                    eachRow.col.length)
                {
                    makeColDef = '{';

                    var colCount = 1;
                    var totalCount = eachRow.col.length;
                    var isRowComputed = false;
                    angular.forEach(eachRow.col, function(eachCol)
                    {

                        var tearSheetItem = eachCol.TearSheetItem;
                        var itemId = tearSheetItem.ItemId;
                        var mnemonicId = tearSheetItem.Mnemonic;
                        var newCopyItemId = templateBusiness.getCopyItemId(tearSheetItem.CopyItemId);
                        var value = templateBusiness.getMnemonicValue(itemId, mnemonicId);
                        var newItemId = templateBusiness.getNewItemId(itemId);
                        var isDisabled = (itemId.indexOf('RATE') !== -1) ||
                                         (itemId.indexOf('ROL') !== -1) ||
                                         (rowCount !== 1 && itemId.indexOf('RET') !== -1);

                        if(!isRowComputed)
                        {
                            isRowComputed = (value !== 'undefined' && value !== '');
                        }


                        makeColDef +=  '"' + newItemId + '":';

                        //Set values from web service data
                        makeColDef += '{ "value":';
                        if ((itemId.indexOf('LIMIT') !== -1) || (itemId.indexOf('PREMIUM') !== -1) || (itemId.indexOf('RET') > -1))
                        {
                            if (value)
                            {
                                makeColDef += '"' + $filter("currency")(value, '', 0) + '",';
                            }
                            else
                            {
                                makeColDef += '"",';
                            }
                        }
                        else if (itemId.indexOf('RATE') !== - 1)
                        {
                            if (value)
                            {
                                makeColDef += '"' +$filter("currency") (value, '', 2) + '",';
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
                                makeColDef += '"' + removeCommaValue($filter("number")(value, 2)) + '",';
                            }
                            else
                            {
                                makeColDef += '"",';
                            }
                        }
                        else if (itemId.indexOf('CARRIER') > -1)
                        {
                            makeColDef += '"' + value + '",';
                        }
                        else
                        {
                            makeColDef += '"' + value + '",';
                        }

                        makeColDef += '"itemid":';
                        makeColDef += '"' + itemId + '",';
                        makeColDef += '"mnemonicid":';
                        makeColDef += '"' + mnemonicId + '",';
                        makeColDef += '"copyitemid":';
                        makeColDef += '"' + newCopyItemId + '",';
                        makeColDef += '"id":';
                        makeColDef += '"' + tearSheetItem.id + '",';
                        makeColDef += '"isdisabled":';
                        makeColDef += '"' + isDisabled + '"';


                        if(tearSheetItem.id === 'SingleDropDownItem')
                        {
                            var values = [];
                            var selectedValue = '';
                            angular.forEach(tearSheetItem.param, function(each)
                            {
                                if(each.checked === 'yes')
                                {
                                    selectedValue = each.content;
                                }

                                values.push({
                                    value: each.content,
                                    name: each.content
                                });
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

                    makeColDef += ',"rowid":';
                    makeColDef += ''+ rowCount +'';
                    makeColDef += ',"iscompute":';
                    makeColDef += ''+ isRowComputed +'';
                    makeColDef += '}';
                    $scope.rows.push(angular.fromJson(makeColDef));
                }
                rowCount++;
            });

            el.find('#proposed-layout').append($compile(html)($scope));
        }

        function defineUpload($scope)
        {
            //$scope.$watch(
            //    "uploadFileName",
            //    function handleAutoSave(newValue, oldValue) {
            //        if(newValue !== oldValue)
            //        {
            //            templateBusiness.getReadyForAutoSave($scope.itemid, $scope.mnemonicid, newValue);
            //            templateBusiness.updateMnemonicValue($scope.itemid, $scope.mnemonicid, newValue);
            //        }
            //    }
            //);
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
        function computeOthers(rows, rowNum)
        {
            for(var count = (rowNum - 1); count < rows.length; count++)
            {
                if(rows[count].iscompute)
                {
                    //Compute Att
                    computeAtt(rows[count], rows[count - 1]);
                    computeRate(rows[count]);
                    computeRol(rows[count], rows[count - 1]);
                }
            }
        }

        function computeAtt(currentRow, previousRow)
        {
            if(previousRow &&
                currentRow)
            {
                var limit;
                var att;

                if ((previousRow.rowid == 1) && (previousRow.LIMIT.value === '')) {
                    limit = "0";
                }
                else {
                    limit = removeCommaValue(previousRow.LIMIT.value);
                }

                if ((previousRow.rowid == 1) && (previousRow.RET.value === '')) {
                    att = "0";
                }
                else {
                    att = removeCommaValue(previousRow.RET.value);
                }

                var computedAtt = templateBusiness.calculateProgramAtt(limit, att);

                if ((currentRow.LIMIT.value != '') && (currentRow.PREMIUM.value != '') && !isNaN(computedAtt) && isFinite(computedAtt))
                {
                    currentRow.RET.value = $filter("currency")(computedAtt, '', 0);
                }
                else 
                {
                    currentRow.RET.value = '';
                }
                currentRow.iscompute = true;
            }
        }

        function computeRate(currentRow)
        {
            if(currentRow)
            {
                var premium = removeCommaValue(currentRow.PREMIUM.value);
                var limit;
                
                if ((currentRow.rowid == 1) && (currentRow.LIMIT.value === ''))
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
                    console.log('RATE is invalid [' + rate + ']');
                    rate = '';
                }
                else
                {
                    rate = $filter("currency") (rate, '', 2);
                }

                currentRow.RATEMM.value = rate || '';
                currentRow.iscompute = true;
            }
        }

        function computeRol(currentRow, previousRow)
        {
            if (currentRow.rowid == 1)
            {
                currentRow.ROL.value = 'N/A';
                currentRow.iscompute = true;
            }
            else if (previousRow && currentRow)
            {
                var currentRate = removeCommaValue(currentRow.RATEMM.value);
                var previousRate = removeCommaValue(previousRow.RATEMM.value);

                var rol = templateBusiness.calculateProgramRol(currentRate, previousRate);

                if (isNaN(rol) || !isFinite(rol)) 
                {
                    console.log('ROL is invalid [' + rol + ']');
                    rol = '';
                }

                currentRow.ROL.value = rol || '';
                currentRow.iscompute = true;
            }
        }


        function initializeMsg($scope)
        {
            commonBusiness.onMsg('ProposedProgram', $scope, function() {
                copyProgram($scope);
            });

            commonBusiness.onMsg('PP-Upload', $scope, function() {
                uploadExcel();
            });

            commonBusiness.onMsg('PP-Download', $scope, function() {
                downloadToCSV($scope);
            });

            commonBusiness.onMsg('PP-Eraser', $scope, function() {
                clearProgram($scope);
            });
        }

        function downloadToCSV($scope)
        {
            var linkElement = $('#link-proposed-download');
            var dataInfo = [];
            var data = null;

            angular.forEach($scope.rows, function(row)
            {
                var data = '';
                data += '{';
                var colCount = 1;
                angular.forEach($scope.headerItems, function(header)
                {
                    var value = getValueById(row, header.name, header.type);
                    var headerName = header.name;

                    if(headerName === 'RET')
                    {
                        headerName = 'ATT';
                    }
                    else if(headerName === 'RATEMM')
                    {
                        headerName = 'RATE';
                    }

                    data +=  '"'+ headerName +'":';


                    if(colCount === $scope.headerItems.length)
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

            if(data && linkElement && linkElement.length > 0)
            {
                var fileName = 'ProposedProgram_' + commonBusiness.projectName.trim() + '.csv';
                console.log(fileName);
                linkElement[0].download = fileName;
                linkElement[0].href = 'data:application/csv,' + escape(data);
                linkElement[0].click();
                toast.simpleToast('Finished downloading - ' + fileName);
            }
        }

        function getValueById(row, headerName, id)
        {
            var exp = null;
            var value = '';

            switch (id)
            {
                case 'SingleDropDownItem':
                    exp = 'row.' + headerName + '.tearsheet.selectedValue';
                    break;

                case 'GenericTextItem':
                    exp = 'row.' + headerName + '.value';
                    break;

                default:break;
            }

            if(exp)
            {
                value = eval(exp);
                if (angular.isUndefined(value) || value == null) {
                    value = '';
                }
            }

            return value;
        }

        function clearProgram($scope, message)
        {
            for(var count = 0; count < $scope.rows.length; count++)
            {
                angular.forEach($scope.headerItems, function(header) {

                    var exp = '$scope.rows[count].' + header.name + '.id';
                    var id = eval(exp);


                    if(id === 'SingleDropDownItem'){
                        exp = '$scope.rows[count].' + header.name + '.tearsheet.selectedValue = "";';
                        eval(exp);
                    }

                    exp = '$scope.rows[count].' + header.name + '.value = "";';
                    eval(exp);
                });
            }

            if(message)
            {
                toast.simpleToast(message);
            }

        }

        //Set values from proposed expiring table
        function copyProgram($scope){

            for(var count = 0; count < $scope.rows.length; count++)
            {
                angular.forEach($scope.headerItems, function(header) {

                    var exp = '$scope.rows[count].' + header.name + '.copyitemid';
                    var copyItemId =  eval(exp);

                    exp = '$scope.rows[count].' + header.name + '.mnemonicid';
                    var mnemonicId = eval(exp);

                    exp = '$scope.rows[count].' + header.name + '.id';
                    var id = eval(exp);

                    var value = templateBusiness.getMnemonicValue(copyItemId, mnemonicId);
                    if ((header.name.indexOf('LIMIT') > -1) || (header.name.indexOf('PREMIUM') > -1) || (header.name.indexOf('RET') > -1))
                    {
                        if (value)
                        {
                            value = $filter("currency")(value, '', 0);
                        }
                        else
                        {
                            value = '';
                        }
                    }
                    else if (header.name.indexOf('RATE') > - 1)
                    {
                        if (value)
                        {
                            value = $filter("currency") (value, '', 2);
                        }
                        else
                        {
                            value = '';
                        }
                    }
                    else if (header.name.indexOf('ROL') > -1)
                    {
                        if (value)
                        {
                            value = removeCommaValue($filter("number") (value, 2));
                        }
                        else
                        {
                            value = '';
                        }
                    }


                    if(id === 'SingleDropDownItem'){
                        if(value === 'undefined')
                        {
                            value = ' ';
                        }
                        exp = '$scope.rows[count].' + header.name + '.tearsheet.selectedValue = "' + value + '";';
                        eval(exp);
                    }
                    exp = '$scope.rows[count].' + header.name + '.value = "' + value  + '";';

                    eval(exp);
                });
            }

            //recompute formula for all rows
            computeRate($scope.rows[0]);
            computeOthers($scope.rows, 1);
            toast.simpleToast('Expiring program copied!');
        }

        function uploadExcel()
        {
            toast.simpleToast("Please choose file!");

            var uploadElement = $('#proposed-upload');

            if(uploadElement && uploadElement.length > 0)
            {
                uploadElement.change(function()
                {
                    $(this).off('change');
                    $('#btn-proposed-upload').click();
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

                angular.forEach($scope.headerItems, function(eachHeader)
                {
                    var headerName = eachHeader.name;

                    switch (headerName.toUpperCase())
                    {
                        case 'RET':
                            headerName = 'ATT';
                            break;

                        case 'RATEMM':
                            headerName = 'RATE';
                            break;

                        default: break;
                    }

                    var findHeader = _.find(csvHeaders, function(header)
                    {
                        if(headerName.toUpperCase() === header.toUpperCase())
                        {
                            return header;
                        }
                    });

                    headerStatus.push({
                        name: eachHeader.name,
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

                    clearProgram($scope, null);

                    angular.forEach(data.data, function(content)
                    {
                        if(rowCount === $scope.rows.length + 1)
                        {
                            message = "Only " + $scope.rows.length + ' rows are allowed. Uploaded successfully!';
                            return;
                        }

                        if(rowCount !== 0)
                        {
                            $scope.rows[rowCount - 1].iscompute = true;
                            angular.forEach($scope.headerItems, function(header)
                            {
                                var findHeader = _.find(headerStatus, function(head)
                                {
                                    if(head.name === header.name)
                                    {
                                        return head;
                                    }
                                });

                                if(findHeader)
                                {
                                    var value = content[findHeader.index];
                                    setValueById(value, $scope, rowCount, header.name, header.type);
                                }

                            });
                        }
                        rowCount++;
                        console.log(rowCount);
                    });

                    //recompute formula for all rows
                    computeRate($scope.rows[0]);
                    computeOthers($scope.rows, 1);
                    if (message == null)
                    {
                        message = 'Uploaded successfully!';
                    }

                    toast.simpleToast(message);
                }
            }

            resetUploadElement();
        }

        //Set values from csv file
        function setValueById(value, $scope, rowCount, headerName, id)
        {
            var exp = null;
            var count = rowCount - 1;

            switch (id)
            {
                case 'SingleDropDownItem':
                    if(value === 'undefined')
                    {
                        value = ' ';
                    }
                    var items;
                    exp = ' items = $scope.rows[' + count + '].' + headerName + '.tearsheet.values';
                    eval(exp);
                    var findItem = _.find(items, function (item) {
                        if (value === item.value) {
                            return item;
                        }
                    });
                    if (findItem)
                    {
                        exp = '$scope.rows[' + count + '].' + headerName + '.tearsheet.selectedValue = "' + value + '";';
                    }
                    break;

                case 'GenericTextItem':
                    if ((headerName.indexOf('LIMIT') > -1) || (headerName.indexOf('PREMIUM') > -1) || (headerName.indexOf('RET') > -1))
                    {
                        if (value)
                        {
                            value = $filter("currency")(removeCommaValue($.trim(value)), '', 0);
                        }
                        else
                        {
                            value = '';
                        }
                    }
                    else if (headerName.indexOf('RATE') > -1)
                    {
                        if (value)
                        {
                            value = $filter("currency")(removeCommaValue($.trim(value)), '', 2);
                        }
                        else
                        {
                            value = '';
                        }
                    }
                    else if (headerName.indexOf('ROL') > -1)
                    {
                        if (value)
                        {
                            value = removeCommaValue($filter("number")($.trim(value), 2));
                        }
                        else
                        {
                            value = '';
                        }
                    }
                    exp = '$scope.rows[' + count + '].' + headerName + '.value = "' + value + '";';
                    break;

                default:break;
            }

            if(exp)
            {
                eval(exp);
            }
        }

        function resetUploadElement()
        {
            var element = $('#proposed-upload');
            if(element && element.length > 0)
            {
                element[0].value = '';
            }

            console.log(element);
        }
    }

})();