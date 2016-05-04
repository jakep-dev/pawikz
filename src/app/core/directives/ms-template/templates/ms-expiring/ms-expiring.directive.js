(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('msExpiringController', msExpiringController)
        .directive('msExpiring', msExpiringDirective);

    function msExpiringController($scope)
    {
        var vm = this;
        console.log('Expiring Controller Scope');
        console.log($scope.rows);
        vm.rows = $scope.rows;
    }

    /** @ngInject */
    function msExpiringDirective($compile, commonBusiness, templateBusiness, DTOptionsBuilder, toast)
    {
        return {
            restrict: 'E',
            scope   : {
                tearsheet: '=',
                copyproposed: '@',
                isnoneditable: '=?'
            },
            templateUrl: 'app/core/directives/ms-template/templates/ms-expiring/ms-expiring.html',
            link: function(scope, el, attrs)
            {
                console.log('Expiring Program');
                console.log(scope);
                defineAction(scope);
                initializeMsg(scope);
                defineLayout(scope, el);
            }
        };

        function defineAction($scope)
        {
            if($scope.copyproposed)
            {
                $scope.$parent.$parent.actions.push({
                    id: 1,
                    callback: "ExpiringProgram",
                    icon: 'icon-content-copy',
                    isclicked: null,
                    tooltip: 'Copy from Proposed'
                });

                $scope.$parent.$parent.actions.push({
                    id: 2,
                    callback: "EP-Upload",
                    icon: 'icon-upload',
                    isclicked: null,
                    tooltip: 'Upload excel sheet'
                });

                $scope.$parent.$parent.actions.push({
                    id: 3,
                    callback: "EP-Eraser",
                    icon: 'icon-eraser',
                    isclicked: null,
                    tooltip: 'Clear data'
                });


            }
        }

        function defineLayout($scope, el)
        {
            var html = '<table id="expiring" width="100%" dt-options="dtOptions" class="row-border hover highlight cell-border" datatable="ng" cellpadding="1" cellspacing="0">';

            $scope.dtOptions = DTOptionsBuilder
                .newOptions()
                .withOption('processing', false)
                .withOption('paging', false)
                .withOption('filter', false)
                .withOption('autoWidth', true)
                .withOption('info', false)
                .withOption('ordering', false)
                .withOption('responsive', true);

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


            $scope.rows = [];
            $scope.headerItems = [];

            html += '<tbody>';
            html += '<tr ng-repeat="row in rows">';
            angular.forEach($scope.tearsheet.row[1].col, function(eachCol)
            {
                var tearSheetItem = eachCol.TearSheetItem;
                var itemId = tearSheetItem.ItemId;
                var mnemonicId = tearSheetItem.Mnemonic;
                var newItemId = templateBusiness.getNewItemId(itemId);
                html += '<td>';

                $scope.headerItems.push(newItemId);

                switch(tearSheetItem.id)
                {
                    case 'GenericTextItem':
                        html += '<ms-text itemid="{{row.'+ newItemId +'.itemid}}" ' +
                            'mnemonicid="{{row.'+ newItemId +'.mnemonicid}}" ' +
                            'value="{{row.'+ newItemId +'.value}}" isdisabled="false"></ms-text>';
                        break;

                    case 'SingleDropDownItem':
                        html += '<ms-expiring-dropdown tearsheet="{{row.'+ newItemId +'.tearsheet}}"' +
                            'mnemonicid="{{row.'+ newItemId +'.mnemonicid}}" ' +
                            'itemid="{{row.'+ newItemId +'.itemid}}"></ms-expiring-dropdown>';
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
                if(rowCount !== 0)
                {
                    makeColDef = '{';

                    var colCount = 1;
                    var totalCount = eachRow.col.length;
                    angular.forEach(eachRow.col, function(eachCol)
                    {

                        var tearSheetItem = eachCol.TearSheetItem;
                        var itemId = tearSheetItem.ItemId;
                        var mnemonicId = tearSheetItem.Mnemonic;
                        var newCopyItemId = templateBusiness.getCopyItemId(tearSheetItem.CopyItemId);
                        var value = templateBusiness.getMnemonicValue(itemId, mnemonicId);
                        var newItemId = templateBusiness.getNewItemId(itemId);

                        makeColDef +=  '"' + newItemId + '":';
                        makeColDef += '{ "value":';
                        makeColDef += '"' + value + '",';
                        makeColDef += '"itemid":';
                        makeColDef += '"' + itemId + '",';
                        makeColDef += '"mnemonicid":';
                        makeColDef += '"' + mnemonicId + '",';
                        makeColDef += '"copyitemid":';
                        makeColDef += '"' + newCopyItemId + '",';
                        makeColDef += '"id":';
                        makeColDef += '"' + tearSheetItem.id + '"';


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

                    makeColDef += '}';
                    console.log('Making ColDef');
                    console.log(angular.fromJson(makeColDef));
                    $scope.rows.push(angular.fromJson(makeColDef));
                }
                rowCount++;
            });

            el.find('#expiring-layout').append($compile(html)($scope));
        }

        function initializeMsg($scope)
        {
            commonBusiness.onMsg('ExpiringProgram', $scope, function() {
               copyProgram($scope);
            });

            commonBusiness.onMsg('EP-Upload', $scope, function() {
                uploadExcel();
            });

            commonBusiness.onMsg('EP-Eraser', $scope, function() {
                clearProgram($scope);
            });
        }

        function clearProgram($scope)
        {
            for(var count = 0; count < $scope.rows.length; count++)
            {
                angular.forEach($scope.headerItems, function(header) {

                    var exp = '$scope.rows[count].' + header + '.id';
                    var id = eval(exp);


                    if(id === 'SingleDropDownItem'){
                        exp = '$scope.rows[count].' + header + '.tearsheet.selectedValue = "";';
                        eval(exp);
                    }

                    exp = '$scope.rows[count].' + header + '.value = "";';
                    eval(exp);
                });
            }

            toast.simpleToast('Expiring program cleared!');
        }

        function copyProgram($scope){

            for(var count = 0; count < $scope.rows.length; count++)
            {
                angular.forEach($scope.headerItems, function(header) {

                    var exp = '$scope.rows[count].' + header + '.copyitemid';
                    var copyItemId =  eval(exp);

                        exp = '$scope.rows[count].' + header + '.mnemonicid';
                    var mnemonicId = eval(exp);

                        exp = '$scope.rows[count].' + header + '.id';
                    var id = eval(exp);

                    var value = templateBusiness.getMnemonicValue(copyItemId, mnemonicId);


                    if(id === 'SingleDropDownItem'){
                        if(value === 'undefined')
                        {
                            value = ' ';
                        }
                        exp = '$scope.rows[count].' + header + '.tearsheet.selectedValue = "' + value + '";';
                        eval(exp);
                    }
                    exp = '$scope.rows[count].' + header + '.value = "' + value  + '";';

                    eval(exp);
                });
            }

            toast.simpleToast('Proposed program copied!');
        }

        function uploadExcel()
        {

        }
    }

})();