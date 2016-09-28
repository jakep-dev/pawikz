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
    function msGenericTableDirective($compile, $filter, templateBusiness, $document)
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
                var newScope = null;
                var html = '';

                console.log('Generic Table Item Scope');
                console.log(scope);

                html += '<table id="generic-table" cellspacing="0" cellpadding="0" width="100%">';

                //Creating Rows for Generic-Table
                _.each(scope.tearsheet.rows, function(row)
                {
                    if(!row.id || row.id !== 'toolbar_links') {
                        newScope = null;

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
                            html += '<td colspan="'+ colspan +'">';


                            if (tearSheetItem &&
                                typeof(tearSheetItem.Label) !== 'object') {

                                switch (tearSheetItem.id) {
                                    case 'LabelItem':
                                        newScope = scope.$new();
                                        html += '<ms-label style="font-weight: bold" value="' + tearSheetItem.Label + '"></ms-label>';
                                        break;
                                    case 'LinkItemNoWord':
                                        newScope = scope.$new();
                                        html += '<ms-link value="' + tearSheetItem.Label + '" href="'+ tearSheetItem.url +'"></ms-link>';
                                        break;
                                    case 'LinkItem':
                                        newScope = scope.$new();
                                        var value = '';
                                        var link = '';
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
                                        html += '<ms-link value="'+value+'" href="//'+link+'" isdisabled="false"></ms-link>';
                                        break;
                                    case 'GenericTextItem':

                                        newScope = scope.$new();
                                        var itemId = tearSheetItem.ItemId;
                                        var mnemonicId = tearSheetItem.Mnemonic;
                                        var value = templateBusiness.getMnemonicValue(itemId, mnemonicId);
                                        var prefix = templateBusiness.getMnemonicPrefix(tearSheetItem); 
										var postfix = templateBusiness.getMnemonicPostfix(tearSheetItem); 
                                        var precision = templateBusiness.getMnemonicPrecision(tearSheetItem);
                                        var iskmb = ((tearSheetItem.onBlur && (tearSheetItem.onBlur.indexOf('transformKMB(this)') > -1 )) ||
                                                    (tearSheetItem.onkeyup && (tearSheetItem.onkeyup.indexOf('transformKMB(this)') > -1 )) ||
                                                    (tearSheetItem.onChange && (tearSheetItem.onChange.indexOf('transformKMB(this)') > -1 ))) || false;


                                        if(iskmb && value && value.length > 0)
                                        {
                                           value = $filter("currency")(value, '', 0);
                                        }
										if(value && value.length > 0)
										{
											if(precision)
											{
												value = templateBusiness.removeParenthesis(value);
												value = templateBusiness.numberWithCommas(parseFloat(templateBusiness.removeCommaValue(value)).toFixed(precision));
												value = templateBusiness.parenthesisForNegative(value);
											}
											value = prefix + value + postfix;
										}
                                        html += '<ms-text value="'+ value +'" ' +
                                            'itemid="'+ itemId +'" ' +
                                            'mnemonicid="'+ mnemonicId +'"  ' +
                                            'precision="'+ precision +'"  ' +
                                            'prefix="'+ prefix +'" postfix="' + postfix +'" ' +
                                            'isdisabled="'+ scope.isnoneditable +'" ' +
                                            'iskmb="' + iskmb + '"></ms-text>';
                                        break;
                                    case 'SingleDropDownItem':
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
                                        var value = templateBusiness.getMnemonicValue(itemId, mnemonicId, false);
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