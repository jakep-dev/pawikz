(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('msTablelayoutFController', msTablelayoutFController)
        .directive('msTablelayoutF', msTablelayoutFDirective);

    function msTablelayoutFController($scope,  templateService, commonBusiness,
                                      DTOptionsBuilder,
                                      DTColumnBuilder)
    {
        var vm = this;
        vm.dtColumns = [];
        vm.dtOptions = [];

        dtOptions();
        dtColumns();

        //Define data-table configurations
        function dtOptions()
        {
            //Dashboard DataTable Configuration
            vm.dtOptions = DTOptionsBuilder
                .newOptions()
                .withOption('processing', true)
                .withOption('paging', true)
                .withOption('autoWidth', true)
                .withOption('responsive', true)
                .withOption('stateSave', false)
                .withOption('order',[])
                .withPaginationType('full')
                .withDOM('<"top bottom"<"left"<"length"l>><"right"f>>rt<"bottom"<"left"<"info text-bold"i>><"right"<"pagination"p>>>');
        }

        //Define data-table columns
        function dtColumns()
        {
            if($scope.tearsheet.header && $scope.tearsheet.header.col)
            {
                angular.forEach($scope.tearsheet.header.col, function (col) {
                    var tearSheetItem = col.TearSheetItem;
                    if (!angular.isUndefined(tearSheetItem) &&
                        typeof(tearSheetItem.Label) !== 'object') {
                        switch (tearSheetItem.id) {
                            case 'LabelItem':
                                vm.dtColumns.push(DTColumnBuilder.newColumn(tearSheetItem.Label, tearSheetItem.Label));
                                break;
                        }
                    }
                });
            }
        }

        //Define data-table data
        function dtData()
        {

        }
    }

    /** @ngInject */
    function msTablelayoutFDirective($compile)
    {
        return {
            restrict: 'E',
            scope   : {
                itemid: '@',
                mnemonicid: '@',
                tearsheet: '='
            },
            templateUrl: 'app/core/directives/ms-template/templates/ms-table-layout/filter/ms-table-layout-f.html',
            compile:function(el, attrs)
            {
                console.log('First Filter Compiler');
               return function($scope)
               {
                   var dataTableId = $scope.itemid;

                   if($scope.tearsheet.columns.length > 0)
                   {
                       $scope.$parent.$parent.isprocesscomplete = false;
                       var html = '<table id="'+ dataTableId +'" dt-options="vm.dtOptions" dt-column-defs="vm.dtColumnDefs" ' +
                           'class="row-border cell-border hover" datatable="" dt-columns="vm.dtColumns"  width="100%" cellpadding="4" cellspacing="0"></table>';
                   }
                   el.find('#ms-table-layout').append($compile(html)($scope));
               };
            },
            controller: 'msTablelayoutFController',
            controllerAs: 'vm'
        };
    }

})();