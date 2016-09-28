(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('msGenericTableCController', msGenericTableCController)
        .directive('msGenericTableC', msGenericTableCDirective);


    function msGenericTableCController($scope)
    {
        var vm = this;
        vm.isnoneditable = $scope.isnoneditable;
    }

    /** @ngInject */
    function msGenericTableCDirective($compile, $filter, templateBusiness, $document)
    {
        return {
            restrict: 'E',
            scope   : {
                tearsheet: '@',
                isnoneditable: '=?'
            },
            controller: 'msGenericTableCController',
            controllerAs: 'vm',
            templateUrl: 'app/core/directives/ms-template/templates/ms-generic-table/child-item/ms-generic-table-c.html',
            link:function(scope, el, attrs)
            {
                var tearsheetObj = angular.fromJson(_.unescape(scope.tearsheet)),
                    html = '',
                    rows = [];

                if(tearsheetObj.col) {
                   rows.push(tearsheetObj);
                }
                else if(tearsheetObj.length > 0) {
                    rows.push.apply(rows, tearsheetObj);
                }

                html += '<table id="child-generic-table" cellspacing="0" cellpadding="0" width="100%">';

                console.log('Rows --');
                console.log(rows);

                //Creating Rows for Child-Generic-Table
                _.each(rows, function(row)
                {
                    if(!row.id && row.id !== 'toolbar_links' &&
                        row.col.length) {
                        html += '<tr style="background: rgba(255, 255, 255, 0)">';

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
                                        html += '<ms-label style="font-weight: bold" value="' + tearSheetItem.Label + '"></ms-label>';
                                        break;
                                    case 'LinkItemNoWord':
                                        html += '<ms-link value="' + tearSheetItem.Label + '" href="'+ tearSheetItem.url +'"></ms-link>';
                                        break;
                                    case 'LinkItem':
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
                                    default:
                                        html += '<div>&nbsp;</div>';
                                        break;
                                }
                            }
                            else {
                                html += '<div>&nbsp;</div>';
                            }

                            html += '</td>';
                        });
                        html += '</tr>';
                    }
                });

                html += '</table>';

                el.find('#child-generic-table-layout').append($compile(html)(scope));


            }
        };
    }

})();