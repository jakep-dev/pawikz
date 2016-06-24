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
    function msGenericTableDirective($compile, templateBusiness, $document)
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
                console.log('GenericTableScope');
                console.log(scope);

                //Creating Rows for Generic-Table
                angular.forEach(scope.tearsheet.rows, function(row)
                {
                    if(!row.id || row.id !== 'toolbar_links') {
                        html = '';
                        newScope = null;
                        html += '<div class="row" layout-align="center center" style="min-height: 30px"  ' +
                            'layout="row" flex>';

                        var columns = null;

                        if(!row.col)
                        {
                            columns = row;
                        }
                        else {
                            columns = row.col;
                        }

                        console.log('RowValues - ');
                        console.log(scope.tearsheet.rows);
                        //Creating Columns for Generic-Table
                        angular.forEach(columns, function (col) {

                            html += '<div flex>';
                            var tearSheetItem = col.TearSheetItem;

                            if (tearSheetItem &&
                                typeof(tearSheetItem.Label) !== 'object') {

                                switch (tearSheetItem.id) {
                                    case 'LabelItem':
                                        newScope = scope.$new();
                                        html += '<ms-label value="' + tearSheetItem.Label + '"></ms-label>';
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
                                        html += '<ms-link value="'+value+'" href="'+link+'" isdisabled="false"></ms-link>';
                                        break;
                                    case 'GenericTextItem':

                                        newScope = scope.$new();
                                        var itemId = tearSheetItem.ItemId;
                                        var mnemonicId = tearSheetItem.Mnemonic;
                                        var value = templateBusiness.getMnemonicValue(itemId, mnemonicId);
                                        html += '<ms-text value="'+ value +'" ' +
                                            'itemid="'+ itemId +'" ' +
                                            'mnemonicid="'+ mnemonicId +'"  ' +
                                            'isdisabled="'+ scope.isnoneditable +'"></ms-text>';
                                        break;
                                    case 'SingleDropDownItem':
                                        var itemId = tearSheetItem.ItemId;
                                        var mnemonicId = tearSheetItem.Mnemonic;
                                        var value = templateBusiness.getMnemonicValue(itemId, mnemonicId);

                                        newScope = scope.$new();
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

                                        newScope.tearsheet = {
                                            label: '',
                                            values: values,
                                            isdisabled: false,
                                            selectedValue: value || selectedValue
                                        };

                                        html += '<ms-dropdown tearsheet="tearsheet"' +
                                            'itemid="'+ itemId +'" ' +
                                            'mnemonicid="'+ mnemonicId +'"  ></ms-dropdown>';
                                        break;

                                    case 'DateItem':
                                        var itemId = tearSheetItem.ItemId;
                                        var mnemonicId = tearSheetItem.Mnemonic;
                                        var value = templateBusiness.getMnemonicValue(itemId, mnemonicId);
										var parseFormat = 'DD-MMM-YY'; //assume that the webservice returns this date format
                                        html += '<ms-calendar itemid="'+ itemId +'" mnemonicid="'+ mnemonicId +'" value="'+ value +'" isdisabled="false" parseformat="'+ parseFormat +'"></ms-calendar>';
                                        break;
                                    case 'GenericRadioGroup':
                                        var itemId = tearSheetItem.ItemId;
                                        var mnemonicId = tearSheetItem.Mnemonic;
                                        var value = templateBusiness.getMnemonicValue(itemId, mnemonicId);

                                        newScope = scope.$new();
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
                                        newScope.tearsheet = {
                                            values: values,
                                            isdisabled: false,
                                            value: value || selectedValue
                                        };

                                        html += '<ms-radio-button tearsheet="tearsheet"' +
                                            'itemid="'+ itemId +'" ' +
                                            'mnemonicid="'+ mnemonicId +'"  ></ms-radio-button>';
                                        break;
                                }
                            }
                            html += '</div>';
                        });


                        html += '</div>';
                        if(newScope !== null)
                        {
                            el.find('#generic-table-layout').append($compile(html)(newScope));
                        }
                        else {
                            el.find('#generic-table-layout').append($compile(html)(scope));
                        }
                    }
                });


            }
        };
    }

})();