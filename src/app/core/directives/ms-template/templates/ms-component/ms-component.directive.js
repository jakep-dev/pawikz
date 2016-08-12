(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('msComponentController', msComponentController)
        .directive('msComponent', msComponentDirective);

    function msComponentController($scope, $mdMenu, $element, $compile,  commonBusiness,
                                   templateBusiness, overviewBusiness, toast)
    {
        var vm = this;
        vm.isNonEditable = $scope.isnoneditable;
        vm.iscollapsible = $scope.iscollapsible;
        vm.isProcessComplete = $scope.isprocesscomplete;
        vm.showPrintIcon = false;
        vm.actions = null;
        vm.collapsed = false;
        vm.isAvailableForPrint = null;
        vm.sectionId = null;

        vm.toggleCollapse = toggleCollapse;
        vm.applyClickEvent = applyClickEvent;
        vm.applyMenuEvent = applyMenuEvent;
        vm.printer = printer;

        $scope.$watch(
            "isprocesscomplete",
            function handleProgress(value) {
                console.log('Progress Watch Triggered');
                console.log(value);
                vm.isProcessComplete = value;
            }
        );

        commonBusiness.onMsg('IsTemplateExpanded', $scope, function() {
            if (commonBusiness.isTemplateExpandAll === vm.collapsed) {
                toggleCollapse();
            }
        });
		
		commonBusiness.onMsg('IsPrintable', $scope, function() {
            if (vm.isAvailableForPrint != null && commonBusiness.isPrintableAll === vm.isAvailableForPrint) {
                vm.printer();
            }            
        });
		
        console.log('Component Scope');
        console.log($scope);

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

        function printer()
        {
            vm.isAvailableForPrint = !vm.isAvailableForPrint;
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

        function applyClickEvent(action, $mdOpenMenu, ev)
        {
            if(action)
            {
                if(action.type === 'button' && action.callback)
                {
                    commonBusiness.emitMsg(action.callback);
                }
                else if(action.type === 'menu') {
                    $mdOpenMenu(ev);
                }

                if(action.isclicked !== null)
                {
                    action.isclicked = !action.isclicked;
                }
            }
        }

        function applyMenuEvent(menu, action)
        {
            if(menu && action)
            {
                if(action.type === 'menu' && menu.callback)
                {
                    commonBusiness.emitMsg(menu.callback);
                }
            }
        }

        //Build the component actions if provided.
        function buildActions()
        {
            console.log('Initialize Build Action');
            $scope.$watchCollection(
                "actions",
                function handleBuildActions(newValue, oldValue) {
                    if(newValue &&
                        newValue.length >= 1)
                    {
                        vm.actions = [];
                        _.each(newValue, function(eachVal)
                        {
                            vm.actions.push(eachVal);
                        });
                    }
                }
            );
        }

        buildActions();

    }

    /** @ngInject */
    function msComponentDirective($compile, templateBusiness)
    {
        return {
            restrict: 'E',
            scope   : {
                tearheader: '=',
                tearcontent: '=',
                iscollapsible: '=?',
                isnoneditable: '=?',
                isprocesscomplete: '=?',
                actions: '=',
                subtype: '@'
            },
            controller: 'msComponentController',
            controllerAs: 'vm',
            templateUrl: 'app/core/directives/ms-template/templates/ms-component/ms-component.html',
            compile: function(el, attrs)
            {
                return function($scope)
                {
                    $scope.title = $scope.tearheader.label;
                    $scope.actions = null;
                    $scope.actions = [];
                    var comp = {
                        html: '',
                        scope: null
                    };

                    if($scope.subtype !== '')
                    {
                        switch($scope.subtype)
                        {
                            case 'Expiring':
                            case 'Proposed':
                                _.each($scope.tearcontent, function(content)
                                {
                                    comp = templateBusiness.buildComponents($scope, content, content.subtype);
                                    if(comp && comp.html !== '')
                                    {
                                        el.find('#ms-accordion-content').append($compile(comp.html)(comp.scope));
                                    }
                                });
                                break;

                            case 'TableLayOut1':
                            case 'TableLayOut2':
                            case 'TableLayOut5':
                                comp =  templateBusiness.determineTableLayout($scope, $scope.tearcontent, $scope.subtype);
                                if(comp && comp.html !== '')
                                {
                                    el.find('#ms-accordion-content').append($compile(comp.html)(comp.scope));
                                }
                                break;

                            case 'TableLayOut4':
                                comp =  templateBusiness.determineTableLayout($scope, $scope.tearcontent, $scope.subtype);
                                if(comp && comp.html !== '')
                                {
                                    el.find('#ms-accordion-content').append($compile(comp.html)(comp.scope));
                                }
                                bindTableLayout4Components($scope, el, $scope.tearcontent);
                                break;
                        }
                    }
                    else {
                        bindComponents($scope, el, $scope.tearcontent);
                    }
                };
            }
        };

        function bindTableLayout4Components(scope, el, tearcontent)
        {
            var comp = {
                html: '',
                scope: null
            };

            _.each(tearcontent, function(content)
            {
               if(content.id !== 'TableLayOut')
               {
                   comp = templateBusiness.buildComponents(scope, content, scope.subtype);
                   if(comp && comp.html !== '')
                   {
                       el.find('#ms-accordion-content').append($compile(comp.html)(comp.scope));
                   }
               }
            });
        }

        function bindComponents(scope, el, tearcontent)
        {
            var comp = {
                html: '',
                scope: null
            };
            _.each(tearcontent, function(content) {
                comp = templateBusiness.buildComponents(scope, content, scope.subtype);

                if(comp && comp.html !== '')
                {
                    el.find('#ms-accordion-content').append($compile(comp.html)(comp.scope));
                }
            });
        }
    }

})();