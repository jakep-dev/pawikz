(function ()
{
    'use strict';

    angular
        .module('app.core')
        //.controller('msTablelayoutController', msTablelayoutController)
        .directive('msTablelayout', msTablelayoutDirective);


    function msTablelayoutController($scope)
    {
        var vm = this;
    }

    /** @ngInject */
    function msTablelayoutDirective($compile)
    {
        return {
            restrict: 'E',
            scope   : {
                tearsheet: '='
            },
            templateUrl: 'app/core/directives/ms-template/templates/ms-table-layout/ms-table-layout.html',
            link:function(scope, el, attrs, templateService)
            {
               var html = '';

                console.log('Table Layout');
                console.log(scope);


               var columns = '';

               if(scope.tearsheet.header.columns)
               {
                   angular.forEach(scope.tearsheet.columns.col, function (col) {

                   });
               }


               html += '<div class="row" layout-align="center center"  layout="row" flex>';

               if(scope.tearsheet.header &&
                  scope.tearsheet.header.col)
               {
                   angular.forEach(scope.tearsheet.header.col, function (col) {
                       html += '<div flex>';
                       var tearSheetItem = col.TearSheetItem;

                       if (!angular.isUndefined(tearSheetItem) &&
                           typeof(tearSheetItem.Label) !== 'object') {

                           switch (tearSheetItem.id) {
                               case 'LabelItem':
                                   html += '<ms-label value="' + tearSheetItem.Label + '"></ms-label>';
                               break;

                           }
                       }

                       html += '</div>';
                   });
               }

               html += '</div>';

               el.find('#ms-table-layout').append($compile(html)(scope));
            }
        };
    }

})();