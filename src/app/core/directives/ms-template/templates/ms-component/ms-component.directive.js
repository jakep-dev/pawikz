(function() {
    'use strict';

    angular
        .module('app.core')
        .controller('msComponentController', msComponentController)
        .directive('msComponent', msComponentDirective);

    function msComponentController($scope, commonBusiness, templateBusinessFormat,
                                    templateBusiness, overviewBusiness, toast, deviceDetector) {
        var vm = this;
        vm.isNonEditable = $scope.isnoneditable;
        vm.iscollapsible = $scope.iscollapsible;
        vm.isProcessComplete = $scope.isprocesscomplete;
        vm.showPrintIcon = false;
        vm.actions = null;
        vm.collapsed = false;
        vm.isAvailableForPrint = null;
        vm.sectionId = null;
        vm.isExcelDownloadable = $scope.tearcontent && $scope.tearcontent[0] && _.has($scope.tearcontent[0], 'excelDownLoadForCom');
        vm.excelFilename = $scope.tearcontent && $scope.tearcontent[0] && $scope.tearcontent[0].excelDownLoadForCom;
        vm.excelComponents = (vm.isExcelDownloadable)? $scope.tearcontent : null;

        vm.toggleCollapse = toggleCollapse;
        vm.applyClickEvent = applyClickEvent;
        vm.applyMenuEvent = applyMenuEvent;
        vm.printer = printer;
        vm.downloadExcel = downloadExcel;

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

        //download excel ms-component level
        function downloadExcel() {
            var linkElement = $('#link-component-download');
            var dataInfo = buildExcelData(vm.excelComponents);
            var data = templateBusiness.unParseJsonToCsv(dataInfo);
            var BOM = String.fromCharCode(0xFEFF);  //fix for euro symbol
            var blob = new Blob([BOM + data], {
                "type": "text/csv;charset=utf8;"
            });     

            if (deviceDetector.browser === 'ie')
            { 
                var fileName = vm.excelFilename + '.csv';
                window.navigator.msSaveOrOpenBlob(blob, fileName);
                toast.simpleToast('Finished downloading - ' + fileName); 
            } else if(data && linkElement && linkElement.length > 0) {
                var fileName = vm.excelFilename + '.csv';
                linkElement[0].setAttribute("href", window.URL.createObjectURL(blob));
                linkElement[0].setAttribute("download", fileName);
                linkElement[0].click();
                toast.simpleToast('Finished downloading - ' + fileName);
            }
        }
        
        //build excel data based on nodes under component tag
        function buildExcelData(tearcontent) {
            var excelRow = [];
            var tearsheetItem = [];

            _.each(tearcontent, function(content) {
                if(content) {
                    if(_.has(content, 'TearSheetItem')) {
                        if(_.isArray(content.TearSheetItem)) {
                            tearsheetItem.push.apply(tearsheetItem, content.TearSheetItem);
                        } else {
                            tearsheetItem.push(content.TearSheetItem);
                        }
                    } else {
                        tearsheetItem.push(content);
                    }
                }
            });

            _.each(tearsheetItem, function(tearsheet) {
                var row = getTearSheetData(tearsheet);

                if(_.isArray(row)) {
                    excelRow.push.apply(excelRow, row);
                } else {
                    excelRow.push([row]);
                }
            });
            
            return excelRow;
        }

        //get data per TearSheetItem tag
        function getTearSheetData(tearsheet) {
            var value = null;
            if(tearsheet && tearsheet.id) {
                switch(tearsheet.id.toLowerCase()) {
                    case 'linkitem': 
                    case 'linkitemnoword':
                    case 'labelitem':
                        value = (tearsheet.Label && typeof(tearsheet.Label) !== 'object') ? tearsheet.Label : ' ';
                        break;

                    case 'genericselectitem':
                        var itemid = tearsheet.ItemId;
                        var mnemonicId = tearsheet.Mnemonic;
                        value = templateBusiness.getMnemonicValue(itemid, mnemonicId);
                        break;

                    case 'generictextitem':
                        var itemId = tearsheet.ItemId;
                        var mnemonicId = tearsheet.Mnemonic;
                        var formats = templateBusinessFormat.getFormatObject(tearsheet);
                        value = templateBusiness.getMnemonicValue(itemId, mnemonicId, false);
                        value = templateBusinessFormat.formatData(value, formats);
                        break;

                    case 'singledropdownitem':
                        var itemId = tearsheet.ItemId;
                        var mnemonicId = tearsheet.Mnemonic;
                        value = templateBusiness.getMnemonicValue(itemId, mnemonicId);
                        break;

                    case 'dateitem':
                        var itemId = tearsheet.ItemId;
                        var mnemonicId = tearsheet.Mnemonic;
                        var formats = templateBusinessFormat.getFormatObject(tearsheet);
                        value = templateBusiness.getMnemonicValue(itemId, mnemonicId);
                        value = templateBusinessFormat.formatData(value, formats);
                        break;

                    case 'genericradiogroup':
                        var itemId = tearsheet.ItemId;
                        var mnemonicId = tearsheet.Mnemonic;
                        value = templateBusiness.getMnemonicValue(itemId, mnemonicId);
                        break;

                    case 'rtftextareaitem':
                        var itemId = tearsheet.ItemId;
                        var mnemonicId = tearsheet.Mnemonic;
                        value = templateBusiness.getMnemonicValue(itemId, mnemonicId);
                        break;

                    case 'generictableitem':
                        value = buildGenericTableForExcel(tearsheet);
                        break;

                    case 'tablelayout':
                        value = buildTableLayoutForExcel(tearsheet);
                        break;

                    default:
                        value = ' ';
                        break;
                }
            }
            
            return value;
        }

        //get array data for GenericTableItem
        function buildGenericTableForExcel(tearsheet) {
            var excelRow = [];
            _.each(tearsheet.row, function(row) {
                if(!row.id || row.id !== 'toolbar_links') {
                    var columns = null;
                    
                    if(!row.col) {
                        columns = row;
                    } else if(row.col && row.col.length)  {
                        columns = row.col;
                    } else if(row.col) {
                        columns = [];
                        columns.push(row.col);
                    }

                    var excelCell = [];
                    _.each(columns, function (col) {
                        var tearSheetItem = col.TearSheetItem;
                        var value = getTearSheetData(tearSheetItem);

                        value = value || ' ';
                        excelCell.push(value);
                    });

                    excelRow.push(excelCell);
                }
            });
            return excelRow;
        }

        //get array data for TableLayOut
        function buildTableLayoutForExcel(tearsheet) {
            var excelRow = [];
            if(tearsheet && tearsheet.TableRowTemplate && tearsheet.TableRowTemplate.row) {
                var tableLayoutData = _.find(templateBusiness.tableLayoutMnemonics, { projectId: commonBusiness.projectId, mnemonic: tearsheet.Mnemonic, itemId: tearsheet.ItemId });
                
                if(tableLayoutData && tableLayoutData.data && _.size(tableLayoutData.data) > 0) {
                    _.each(tableLayoutData.data, function(data) {
                        _.each(tearsheet.TableRowTemplate.row, function(row) {
                            if(!row.id || row.id !== 'toolbar_links') {
                                var columns = null;
                                
                                if(!row.col) {
                                    columns = row;
                                } else if(row.col && row.col.length)  {
                                    columns = row.col;
                                } else if(row.col) {
                                    columns = [];
                                    columns.push(row.col);
                                }
                                
                                var excelCell = [];
                                _.each(columns, function (col) {
                                    var tearSheetItem = col.TearSheetItem;
                                    var value = null;
                                    
                                    if(tearSheetItem && tearSheetItem.id && tearSheetItem.id === 'LabelItem') {
                                        value = getTearSheetData(tearSheetItem);
                                    } else {
                                        if(tearSheetItem && tearSheetItem.Mnemonic){
                                        
                                            //formats data
                                            var formats = templateBusinessFormat.getProgramTableFormatObject(tearSheetItem, _.find(tableLayoutData.type, {mnemonic: tearSheetItem.Mnemonic}));

                                            formats.precision = (''+data[tearSheetItem.Mnemonic].indexOf('.') > -1)? 2 : 0;
                                            formats.prefix = '';

                                            value = (data[tearSheetItem.Mnemonic])?  templateBusinessFormat.formatData(data[tearSheetItem.Mnemonic], formats) : ' ';
                                        }
                                    }
                                    
                                    value = value || ' ';
                                    excelCell.push(value);
                                });

                                excelRow.push(excelCell);
                            }
                        });
                    });
                } else {
                    excelRow.push(['No Data Available']);
                }
            }

            return excelRow;
        }
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