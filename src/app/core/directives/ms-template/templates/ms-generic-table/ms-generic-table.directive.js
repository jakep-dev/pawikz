(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('msGenericController', msGenericController)
        .directive('msGenericTable', msGenericTableDirective);


    function msGenericController($scope)
    {
        var vm = this;


    }

    /** @ngInject */
    function msGenericTableDirective($compile)
    {
        return {
            restrict: 'E',
            scope   : {
                tearsheet: '='
            },
            templateUrl: 'app/core/directives/ms-template/templates/ms-generic-table/ms-generic-table.html',
            controller:'msGenericController',
            link:function(scope, el, attrs)
            {
                console.log('---Inside Generic Table Start---');
                console.log(scope);
                console.log('---Inside Generic Table End---');
                var newScope = null;
                var html = '';
                angular.forEach(scope.tearsheet.rows, function(row)
                {
                    if(angular.isUndefined(row.id) || row.id !== 'toolbar_links') {
                        html = '';
                        newScope = null;
                        html += '<div class="row" layout-align="center center"  layout="row" flex>';

                        var columns = null;

                        if(angular.isUndefined(row.col))
                        {
                            columns = row;
                        }
                        else {
                            columns = row.col;
                        }


                        angular.forEach(columns, function (col) {
                            html += '<div flex>';
                            var tearSheetItem = col.TearSheetItem;

                            if (!angular.isUndefined(tearSheetItem) &&
                                 typeof(tearSheetItem.Label) !== 'object') {

                                switch (tearSheetItem.id) {
                                    case 'LabelItem':
                                        console.log('---Inserting Label Element ' + tearSheetItem.Label);
                                        html += '<ms-label value="' + tearSheetItem.Label + '"></ms-label>';
                                        break;
                                    case 'LinkItemNoWord':
                                        html += '<ms-link value="' + tearSheetItem.Label + '"></ms-link>';
                                        break;
                                    case 'LinkItem':
                                        html += '<ms-link value="www.3m.com"></ms-link>';
                                        break;
                                    case 'GenericTextItem':
                                        html += '<ms-text value="" isdisabled="false"></ms-text>';
                                        break
                                    case 'SingleDropDownItem':

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
                                            selectedValue: selectedValue

                                        };

                                        html += '<ms-dropdown tearsheet="tearsheet"></ms-dropdown>';
                                        break;

                                    case 'DateItem':
                                        html += '<ms-calendar></ms-calendar>';
                                        break;
                                }
                            }
                            html += '</div>';
                        });
                        html += '</div>'
                        if(newScope !== null)
                        {
                            el.find('#generic-table-layout').append($compile(html)(newScope));
                        }
                        else {
                            el.find('#generic-table-layout').append($compile(html)(scope));
                        }
                        console.log(html);

                    }
                })
            }
        };
    }

})();