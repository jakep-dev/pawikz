(function() {
    'use strict';

    angular
        .module('app.core')
        .controller('msComponentController', msComponentController)
        .directive('msComponent', msComponentDirective);

    function msComponentController($scope, commonBusiness,
        templateBusiness, overviewBusiness, toast) {
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
                vm.isProcessComplete = value;
            }
        );

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

        function initialize() {
            if ($scope.tearheader &&
                $scope.tearheader.mnemonicid) {
                vm.showPrintIcon = templateBusiness.showPrintIcon($scope.tearheader.mnemonicid);
                if (vm.showPrintIcon) {
                    vm.sectionId = $scope.tearheader.itemid;
                    vm.isAvailableForPrint = templateBusiness.getPrintableValue($scope.tearheader.itemid);
                    vm.collapsed = !vm.isAvailableForPrint;
                }
            }
        }

        function printer(printableValue) {
            // vm.isAvailableForPrint = !vm.isAvailableForPrint;
            vm.isAvailableForPrint = printableValue;
            if (vm.isAvailableForPrint) {
                toast.simpleToast('Section will show on pdf download');
            } else {
                toast.simpleToast('Section will not show on pdf download');
            }

            if (vm.sectionId) {
                overviewBusiness.templateOverview.isChanged = true;
                overviewBusiness.updateTemplateOverview(vm.sectionId, vm.isAvailableForPrint);
                overviewBusiness.getReadyForAutoSave();
            }
        }

        function toggleCollapse() {
            vm.collapsed = !vm.collapsed;
        }

        function applyClickEvent(action, $mdOpenMenu, ev) {
            if (action) {
                if (action.type === 'button' && action.callback) {
                    commonBusiness.emitMsg(action.callback);
                } else if (action.type === 'menu') {
                    $mdOpenMenu(ev);
                }

                if (action.isclicked !== null) {
                    action.isclicked = !action.isclicked;
                }
            }
        }

        function applyMenuEvent(menu, action) {
            if (menu && action) {
                if (action.type === 'menu' && menu.callback) {
                    if (menu.callbackParam) {
                        commonBusiness.emitWithArgument(menu.callback, menu.callbackParam);
                    } else {
                        commonBusiness.emitMsg(menu.callback);
                    }
                }
            }
        }

        //Build the component actions if provided.
        function buildActions() {
            $scope.$watchCollection(
                "actions",
                function handleBuildActions(newValue, oldValue) {
                    if (newValue &&
                        newValue.length >= 1) {
                        vm.actions = [];
                        _.each(newValue, function(eachVal) {
                            vm.actions.push(eachVal);
                        });
                    }
                }
            );
        }

        buildActions();
    }

    /** @ngInject */
    function msComponentDirective($compile, templateBusiness, commonBusiness) {
        return {
            restrict: 'E',
            scope: {
                tearheader: '=',
                tearcontent: '=',
                iscollapsible: '=?',
                isnoneditable: '=?',
                isprocesscomplete: '=?',
                actions: '=',
                subtype: '@',
                islastcomponent: '=?',
                itemid: '@'
            },
            controller: 'msComponentController',
            controllerAs: 'vm',
            templateUrl: 'app/core/directives/ms-template/templates/ms-component/ms-component.html',
            compile: function(el, attrs) {
                return function($scope) {
                    $scope.title = $scope.tearheader.label || $scope.tearheader.Label;
                    $scope.preLabel = $scope.tearheader.prelabel || '';
                    $scope.actions = null;
                    $scope.actions = [];
                    var comp = {
                        html: '',
                        scope: null
                    };

                    if ($scope.subtype !== '') {
                        switch ($scope.subtype.toLocaleLowerCase()) {
                            case 'expiring':
                            case 'proposed':
                            case 'expiringhybrid':
                            case 'proposedhybrid':

                                var tearSheets = templateBusiness.getTearSheetItems($scope.tearcontent);

                                _.each(tearSheets, function(content) {
                                    comp = templateBusiness.buildComponents($scope, content, content.subtype);
                                    if (comp && comp.html !== '') {
                                        el.find('#ms-accordion-content').append($compile(comp.html)(comp.scope));
                                    }
                                });
                                break;

                            case 'tablelayout1':
                            case 'tablelayout2':
                            case 'tablelayout3':
                            case 'tablelayout5':
                                comp = templateBusiness.determineTableLayout($scope, $scope.tearcontent, $scope.subtype);
                                if (comp && comp.html !== '') {
                                    el.find('#ms-accordion-content').append($compile(comp.html)(comp.scope));
                                }
                                break;

                            case 'tablelayout4':
                                comp = templateBusiness.determineTableLayout($scope, $scope.tearcontent, $scope.subtype);
                                if (comp && comp.html !== '') {
                                    el.find('#ms-accordion-content').append($compile(comp.html)(comp.scope));
                                }
                                bindTableLayout4Components($scope, el, $scope.tearcontent);
                                break;
                            case 'subcomponent':
                                var subComponents = templateBusiness.getSubComponents($scope.tearcontent);
                                if (subComponents) {
                                    var msCompElem = el.find('#ms-accordion-content');
                                    if (msCompElem) {
                                        _.each(subComponents, function(component) {
                                            if (!component.header) {
                                                comp = templateBusiness.buildComponents($scope, component.section, component.section.id);
                                                if (comp && comp.html !== '') {
                                                    comp.html += '<div style="height:5px"></div>';
                                                }
                                            } else {
                                                comp = templateBusiness.buildSubComponent($scope, component);
                                            }

                                            if (comp && comp.html !== '') {
                                                msCompElem.append($compile(comp.html)(comp.scope));
                                            }
                                        });
                                    }
                                }
                                break;
                        }
                    } else {
                        bindComponents($scope, el, $scope.tearcontent);
                    }

                    if ($scope.islastcomponent) {
                        commonBusiness.emitMsg('step-load-completed');
                    }
                };
            }
        };

        function bindTableLayout4Components(scope, el, tearcontent) {
            var comp = {
                html: '',
                scope: null
            };

            var msCompElem = el.find('#ms-accordion-content');

            if (msCompElem) {
                _.each(tearcontent, function(content) {
                    if (content.id !== 'TableLayOut') {
                        comp = templateBusiness.buildComponents(scope, content, scope.subtype);
                        if (comp && comp.html !== '') {
                            msCompElem.append($compile(comp.html)(comp.scope));
                        }
                    }
                });
            }
        }

        function bindComponents(scope, el, tearcontent) {
            var comp = {
                    html: '',
                    scope: null
                },
                tearSheets = templateBusiness.getTearSheetItems(tearcontent);

            var msCompElem = el.find('#ms-accordion-content');

            if (msCompElem) {
                _.each(tearSheets, function(content) {
                    comp = templateBusiness.buildComponents(scope, content, scope.subtype);
                    if (comp && comp.html !== '') {
                        msCompElem.append($compile(comp.html)(comp.scope));
                    }
                });
            }
        }
    }

})();