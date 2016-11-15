(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('msGenericTableController', msGenericTableController)
        .directive('msGenericTable', msGenericTableDirective);


    function msGenericTableController($scope)
    {
        var vm = this;
        vm.isnoneditable = $scope.isnoneditable;
    }

    /** @ngInject */
    function msGenericTableDirective($compile, $filter, templateBusiness, templateBusinessFormat, $document)
    {
        return {
            restrict: 'E',
            scope   : {
                tearsheet: '=',
                isnoneditable: '=?'
            },
            controller: 'msGenericTableController',
            controllerAs: 'vm',
            templateUrl: 'app/core/directives/ms-template/templates/ms-generic-table/ms-generic-table.html',
            link:function(scope, el, attrs)
            {
                var html = '';

                console.log('Generic Table Item Scope');
                console.log(scope);

                html += '<table id="generic-table" cellspacing="0" cellpadding="0" width="100%">';

                //Creating Rows for Generic-Table
                _.each(scope.tearsheet.rows, function(row)
                {
                    if(!row.id || row.id !== 'toolbar_links') {

                        html += '<tr class="row">';

                        var columns = null;

                        if(!row.col)
                        {
                            columns = row;
                        }
                        else if(row.col && row.col.length)  {
                            columns = row.col;
                        }
                        else if(row.col) {
                            columns = [];
                            columns.push(row.col);
                        }

                        //Creating Columns for Generic-Table
                        _.each(columns, function (col) {

                            var tearSheetItem = col.TearSheetItem,
                                colspan = col.colspan || 0;
                            html += '<td style="padding-left: 3px" colspan="'+ colspan +'">';


                            if (tearSheetItem &&
                                typeof(tearSheetItem.Label) !== 'object') {

                                switch (tearSheetItem.id) {
                                    case 'GenericSelectItem':
                                    var itemid = tearSheetItem.ItemId;
                                        var mnemonicId = tearSheetItem.Mnemonic;
                                        var value = templateBusiness.getMnemonicValue(itemid, mnemonicId);
                                        var tearsheet = {};
                                        var values = [];
                                        var selectedValue = '';

                                        angular.forEach(tearSheetItem.param, function(each)
                                        {
                                            
                                            if(each.checked === 'yes')
                                            {
                                                selectedValue = tearSheetItem.param.content;
                                            }

                                            values.push({
                                                value: tearSheetItem.param.content,
                                                name: tearSheetItem.param.content
                                            });
                                        });

                                        tearsheet = {
                                            label: '',
                                            values: values,
                                            isdisabled: false,
                                            selectedValue: value || selectedValue
                                        };
                                        
                                        html += '<ms-checkbox  style="overflow-y:hidden;" value ="'+value+'" row="row" ' +
                                                'text="'+tearSheetItem.param.content+'" tearsheet="'+ _.escape(angular.toJson(tearsheet))+'" itemid="'+itemid+'" mnemonicid="'+mnemonicId+'" ></ms-checkbox>';
                                        break;
                                    case 'LabelItem':
                                        var classValue = 'align-left-for-label';
                                        classValue = templateBusinessFormat.getAlignmentForLabelItem(tearSheetItem, classValue);
                                        html += '<ms-label style="font-weight: bold" value="' + tearSheetItem.Label + '" class="'+ classValue +'"></ms-label>';
                                        break;
                                    case 'LinkItemNoWord':
                                        html += '<ms-link value="' + tearSheetItem.Label + '" href="'+ tearSheetItem.url +'"></ms-link>';
                                        break;
                                    case 'LinkItem':
                                        var value = '';
                                        var link = '';
                                        var gotoStepValue = '';

                                        if(angular.isDefined(tearSheetItem.Label))
                                        {
                                            value = tearSheetItem.Label;
                                            link = tearSheetItem.Link;
                                        }
                                        else {
                                            var itemId = tearSheetItem.ItemId;
                                            var mnemonicId = tearSheetItem.Mnemonic;
                                            var value = templateBusiness.getMnemonicValue(itemId, mnemonicId);
                                            link = value;
                                        }

                                        if(tearSheetItem && typeof(tearSheetItem.GoBack) != 'object'){
                                            if(angular.isDefined(tearSheetItem.GoBack)){
                                                gotoStepValue = tearSheetItem.GoBack;    
                                            }
                                        }

                                        html += '<ms-link value="'+value+'" href="//'+link+'" isdisabled="false" gotostep="'+ gotoStepValue +'"></ms-link>';
                                        break;
                                    case 'GenericTextItem':
                                        var classValue;
                                        var itemId = tearSheetItem.ItemId;
                                        var mnemonicId = tearSheetItem.Mnemonic;
                                        //raw value from database
                                        var value = templateBusiness.getMnemonicValue(itemId, mnemonicId, false);
                                        var formats = templateBusinessFormat.getFormatObject(tearSheetItem);

                                        if (scope.isnoneditable)
                                        {
                                            //default label alignment
                                            classValue = "align-left-non-editable-table";
                                            classValue = templateBusinessFormat.getAlignmentForTableLayoutNonEditable(col, classValue);
                                            value = templateBusinessFormat.formatData(value, formats);
                                            html += '<ms-label class="'+ classValue +'" classtype="'+ classValue +'" style="font-weight: normal" value="' + value + '"></ms-label>';
                                        } else {
                                            //default text box alignment
                                            classValue = 'align-left';
                                            value = templateBusinessFormat.removeFixes(value, formats);
                                            classValue = templateBusinessFormat.getAlignmentForGenericTableItem(col, classValue);

                                            html += '<ms-text ' +
                                            'itemid="'+ itemId +'" ' +
                                            'mnemonicid="'+ mnemonicId +'"  ' +
                                            'isdisabled="'+ scope.isnoneditable +'" ' +
                                            'classtype="' + classValue + '" ' +
                                            'value="' + value + '"' +
                                            'formats="' + _.escape(angular.toJson(formats)) + '"></ms-text>';
                                        }
                                        break;
                                    case 'SingleDropDownItem':
                                        var itemId = tearSheetItem.ItemId;
                                        var mnemonicId = tearSheetItem.Mnemonic;
                                        var value = templateBusiness.getMnemonicValue(itemId, mnemonicId);

                                        var tearsheet = {};
                                        var values = [];
                                        var selectedValue = '';
                                        if(scope.isnoneditable)
                                        {
                                            html += '<ms-label style="font-weight: normal" value="' + value + '"></ms-label>';
                                            return;
                                        }
                                        _.each(tearSheetItem.param, function(each)
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

                                        tearsheet = {
                                            label: '',
                                            values: values,
                                            isdisabled: false,
                                            selectedValue: value || selectedValue
                                        };

                                        html += '<ms-dropdown tearsheet="'+ _.escape(angular.toJson(tearsheet)) +'"' +
                                            'itemid="'+ itemId +'" ' +
                                            'mnemonicid="'+ mnemonicId +'"  ></ms-dropdown>';
                                        break;

                                    case 'DateItem':
                                        var itemId = tearSheetItem.ItemId;
                                        var mnemonicId = tearSheetItem.Mnemonic;
                                        var value = templateBusiness.getMnemonicValue(itemId, mnemonicId);
                                        if(scope.isnoneditable)
                                        {
                                            html += '<ms-label style="font-weight: normal" value="' + value + '"></ms-label>';
                                            return;
                                        }
                                        html += '<ms-calendar itemid="'+ itemId +'" mnemonicid="'+ mnemonicId +'" value="'+ value +'" isdisabled="false"></ms-calendar>';
                                        break;
                                    case 'GenericRadioGroup':
                                        var itemId = tearSheetItem.ItemId;
                                        var mnemonicId = tearSheetItem.Mnemonic;
                                        var value = templateBusiness.getMnemonicValue(itemId, mnemonicId);

                                        var tearsheet = {};
                                        var values = [];
                                        var selectedValue = '';
                                        _.each(tearSheetItem.param, function(each)
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

                                        tearsheet = {
                                            values: values,
                                            isdisabled: false,
                                            value: value || selectedValue
                                        };

                                        html += '<ms-radio-button tearsheet="'+ _.escape(angular.toJson(tearsheet)) +'"' +
                                            'itemid="'+ itemId +'" ' +
                                            'mnemonicid="'+ mnemonicId +'"  ></ms-radio-button>';
                                        break;

                                    case 'RTFTextAreaItem':
                                        var itemId = tearSheetItem.ItemId;
                                        var mnemonicId = tearSheetItem.Mnemonic;
                                        var prompt = '';
                                        var answer = '';
                                        var value = templateBusiness.getMnemonicValue(itemId, mnemonicId);

                                        if(angular.isDefined(tearSheetItem.prompt) &&
                                            typeof(tearSheetItem.prompt) !== 'object')
                                        {
                                            prompt = tearSheetItem.prompt;
                                        }

                                        if(tearSheetItem.answer &&
                                            typeof(tearSheetItem.answer) !== 'object')
                                        {
                                            answer = tearSheetItem.answer;
                                        }

                                        html += '<ms-rich-text-editor itemid="'+itemId+'" ' +
                                            'mnemonicid="' + mnemonicId + '" prompt="' + prompt + '" value="' + _.escape(value) + '" isdisabled="false" answer="' + answer + '"></ms-rich-text-editor>';

                                        break;
                                    case 'GenericTableItem':
                                        var rows = tearSheetItem.row,
                                            isnoneditable = false;

                                        html += '<ms-generic-table-c tearsheet="'+ _.escape(angular.toJson(rows)) +'" isnoneditable="'+ isnoneditable +'"></ms-generic-table-c>';
                                        break;

                                    default:
                                        html += '<div>&nbsp;</div>';
                                        break;
                                }
                            }
                            html += '</td>';
                        });
                        html += '</tr>';
                    }
                });

                html += '</table>';

                el.find('#generic-table-layout').append($compile(html)(scope));
            }
        };
    }

})();