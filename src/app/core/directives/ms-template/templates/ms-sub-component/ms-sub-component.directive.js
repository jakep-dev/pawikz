(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('msSubComponentController', msSubComponentController)
        .directive('msSubComponent', msSubComponentDirective);

    function msSubComponentController($scope, commonBusiness,
                                   templateBusiness, overviewBusiness, toast)
    {
        var vm = this;
        vm.isNonEditable = $scope.isnoneditable;
        vm.iscollapsible = $scope.iscollapsible;
        vm.isProcessComplete = $scope.isprocesscomplete;
        vm.showPrintIcon = false;
        vm.collapsed = false;
        vm.isAvailableForPrint = null;
        vm.sectionId = null;

        vm.toggleCollapse = toggleCollapse;
        vm.printer = printer;


        commonBusiness.onMsg('IsTemplateExpanded', $scope, function() {
            if (commonBusiness.isTemplateExpandAll === vm.collapsed) {
                toggleCollapse();
            }
        });

        commonBusiness.onMsg('IsPrintable', $scope, function() {
            if (vm.isAvailableForPrint != null && commonBusiness.isPrintableAll !== vm.isAvailableForPrint) {
                vm.printer(commonBusiness.isPrintableAll);
            }
        });

        initialize();

        function initialize()
        {
            if($scope.tearheader &&
                $scope.tearheader.mnemonicid)
            {
                vm.showPrintIcon = templateBusiness.showPrintIcon($scope.tearheader.mnemonicid);
                if(vm.showPrintIcon)
                {
                    vm.sectionId = $scope.tearheader.itemid;
                    vm.isAvailableForPrint = templateBusiness.getPrintableValue($scope.tearheader.itemid);
                    vm.collapsed = !vm.isAvailableForPrint;
                }
            }
        }

        function printer(printableValue)
        {
            // vm.isAvailableForPrint = !vm.isAvailableForPrint;
            vm.isAvailableForPrint = printableValue;
            if(vm.isAvailableForPrint)
            {
                toast.simpleToast('Section will show on pdf download');
            }
            else {
                toast.simpleToast('Section will not show on pdf download');
            }

            if(vm.sectionId)
            {
                overviewBusiness.templateOverview.isChanged = true;
                overviewBusiness.updateTemplateOverview(vm.sectionId, vm.isAvailableForPrint);
                overviewBusiness.getReadyForAutoSave();
            }
        }

        function toggleCollapse()
        {
            vm.collapsed = !vm.collapsed;
        }
    }

    /** @ngInject */
    function msSubComponentDirective($compile, templateBusiness)
    {
        return {
            restrict: 'E',
            scope   : {
                tearheader: '=',
                tearcontent: '=',
                iscollapsible: '=?',
                isnoneditable: '=?'
            },
            controller: 'msSubComponentController',
            controllerAs: 'vm',
            templateUrl: 'app/core/directives/ms-template/templates/ms-sub-component/ms-sub-component.html',
            compile: function(el, attrs)
            {
                return function($scope)
                {
                    $scope.title = $scope.tearheader.Label;
                    bindComponents($scope, el, $scope.tearcontent);
                };
            }
        };

        ///Bind component to UI
        function bindComponents(scope, el, tearcontent)
        {
            var comp = {
                html: '',
                scope: null
            };
            _.each(tearcontent, function(content) {
                comp = templateBusiness.buildComponents(scope, content, (scope.subtype || content.subtype));

                if(comp && comp.html !== '')
                {
                    el.find('#ms-accordion-sub-content').append($compile(comp.html)(comp.scope));
                }
            });
        }
    }

})();