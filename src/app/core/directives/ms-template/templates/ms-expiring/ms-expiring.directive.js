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
    function msExpiringDirective($compile, templateBusiness, DTOptionsBuilder)
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
                defineExpiringLayout(scope, el);
            },
            controller: 'msExpiringController',
            controllerAs: 'vm'
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
                    id: 1,
                    callback: "EP-Upload",
                    icon: 'icon-upload',
                    isclicked: null,
                    tooltip: 'Upload excel sheet'
                });
            }
        }

        function defineExpiringLayout($scope, el)
        {
            var html = '<table width="100%" dt-options="dtOptions" class="row-border hover highlight cell-border" datatable="" cellpadding="1" cellspacing="0">';

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

            html += '<tbody>';
            html += '<tr ng-repeat="row in rows">';
            angular.forEach($scope.tearsheet.row[1].col, function(eachCol)
            {
                var tearSheetItem = eachCol.TearSheetItem;
                var itemId = tearSheetItem.ItemId;
                var mnemonicId = tearSheetItem.Mnemonic;
                var newItemId = getNewItemId(itemId);
                html += '<td>';
                switch(tearSheetItem.id)
                {
                    case 'GenericTextItem':
                        html += '<ms-text itemid="{{row.'+ newItemId +'.itemid}}" ' +
                            'mnemonicid="{{row.'+ newItemId +'.mnemonicid}}" ' +
                            'value="{{row.'+ newItemId +'.value}}"></ms-text>';
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
                        var value = templateBusiness.getMnemonicValue(itemId, mnemonicId);
                        var newItemId = getNewItemId(itemId);

                        makeColDef +=  '"' + newItemId + '":';
                        makeColDef += '{ "value":';
                        makeColDef += '"' + itemId + '",';
                        makeColDef += '"itemid":';
                        makeColDef += '"' + itemId + '",';
                        makeColDef += '"mnemonicid":';
                        makeColDef += '"' + mnemonicId + '"';


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

        function defineExpiringData($scope)
        {

        }

        function getNewItemId(itemId)
        {
            var newItemId = '';
            if(itemId)
            {
                var splittedItem = itemId.split("_");
                var totalCount = splittedItem.length;
                var currentCount = 1;

                _.each(splittedItem, function(str)
                {
                    if(currentCount !== totalCount)
                    {
                        newItemId += str;
                    }
                    currentCount++;
                });
            }
            return newItemId;
        }
    }

})();