(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('msComponentController', msComponentController)
        .directive('msComponent', msComponentDirective);

    function msComponentController($scope, $element, $compile,  commonBusiness,
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
                overviewBusiness.updateTemplateOverview(vm.sectionId, vm.isAvailableForPrint);
                overviewBusiness.getReadyForAutoSave();
            }
        }

        function toggleCollapse()
        {
            vm.collapsed = !vm.collapsed;
        }

        function applyClickEvent(action)
        {
            if(action && action.callback)
            {
               commonBusiness.emitMsg(action.callback);

                if(action.isclicked !== null)
                {
                    action.isclicked = !action.isclicked;
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
                    if(newValue !== oldValue)
                    {
                        console.log('Fire Build Action Watch');

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
                actions: '='
            },
            controller: 'msComponentController',
            controllerAs: 'vm',
            templateUrl: 'app/core/directives/ms-template/templates/ms-component/ms-component.html',
            compile: function(el, attrs)
            {
                return function($scope)
                {
                    $scope.title = $scope.tearheader.label;

                    var html = '';
                    var isTableLayout = false;
                    isTableLayout = ($scope.tearcontent.length && $scope.tearcontent.length >= 1 &&
                    _.findIndex($scope.tearcontent, {id: 'TableLayOut'}) !== -1);

                    angular.forEach($scope.tearcontent, function(content)
                    {
                        html = '<div>';
                        switch (content.id)
                        {
                            case 'ExpiringProgram':
                                var newScope  = $scope.$new();
                                newScope.tearsheet = null;
                                newScope.isnoneditable = $scope.isnoneditable;
                                newScope.copyproposed = null;

                                if($scope.tearheader)
                                {
                                    newScope.copyproposed =  $scope.tearheader.copyproposed || null;
                                }

                                if($scope.tearcontent)
                                {
                                    angular.forEach($scope.tearcontent, function(content)
                                    {
                                      newScope.tearsheet = content;
                                    })
                                }

                                html += '<ms-expiring tearsheet="tearsheet" copyproposed="'+ newScope.copyproposed +'" isnoneditable="isnoneditable"></ms-expiring>';
                                el.find('#ms-accordion-content').append($compile(html)(newScope));
                                break;

                            case 'ProposedProgram':
                                var newScope  = $scope.$new();
                                newScope.tearsheet = null;
                                newScope.isnoneditable = $scope.isnoneditable;
                                newScope.copyexpiring = null;

                                if($scope.tearheader)
                                {
                                    newScope.copyexpiring =  $scope.tearheader.copyexpiring || null;
                                }

                                if($scope.tearcontent)
                                {
                                    //newScope.tearsheet = [];
                                    angular.forEach($scope.tearcontent, function(content)
                                    {
                                        newScope.tearsheet = content;
                                    })
                                }


                                html += '<ms-proposed tearsheet="tearsheet" copyexpiring="'+ newScope.copyexpiring +'"  isnoneditable="isnoneditable"></ms-proposed>';
                                el.find('#ms-accordion-content').append($compile(html)(newScope));
                                break;

                            case 'LabelItem':
                                var newScope  = $scope.$new();
                                newScope.tearsheet = {
                                    value: content.Label,
                                    type: 'header3'
                                };

                                html += '<ms-header tearsheet="tearsheet"></ms-header>';
                                html += '</div>';
                                el.find('#ms-accordion-content').append($compile(html)(newScope));
                                break;

                            case 'GenericTableItem':
                                if(isTableLayout)
                                    return;

                                var newScope  = $scope.$new();
                                newScope.tearsheet = {
                                    rows: content.row
                                };

                                newScope.isnoneditable = $scope.isnoneditable;

                                if(content.row.col && content.row.col.TearSheetItem &&
                                    content.row.col.TearSheetItem.id === 'ScrapedItem')
                                {
                                    html += '<ms-message message="Under Construction"></ms-message>';
                                    el.find('#ms-accordion-content').append($compile(html)(newScope));
                                    return;
                                }

                                html += '<ms-generic-table tearsheet="tearsheet" isnoneditable="isnoneditable"></ms-generic-table>';
                                html += '</div>';
                                el.find('#ms-accordion-content').append($compile(html)(newScope));
                                break;
                            case 'TableLayOut':
                                var newScope  = $scope.$new(true);

                                var header = null;
                                var col = null;

                                //Get Header And Body Details
                                if(isTableLayout)
                                {
                                    var genericTableItemRow = _.first($scope.tearcontent);
                                    header = {};
                                    col = {};
                                    header = genericTableItemRow.row;
                                    col = content.TableRowTemplate.row;
                                }

                                newScope.itemid = content.ItemId;
                                newScope.mnemonicid = content.Mnemonic;

                                newScope.tearsheet = {
                                    header: header,
                                    columns: col
                                };

                                console.log(newScope);

                                if((col && $scope.isnoneditable) || col.col)
                                {
                                    html += '<ms-tablelayout-r itemid="'+newScope.itemid+'" mnemonicid="'+newScope.mnemonicid+'" tearsheet="tearsheet" iseditable="true"></ms-tablelayout-r>';
                                }
                                else {
                                    var descColumn = col[1];
                                    var isFilterTableLayout = false;
                                    if(descColumn && descColumn.col &&
                                        descColumn.col.TearSheetItem &&
                                        ( descColumn.col.TearSheetItem.Mnemonic === 'DESCRIPTION' ||
										 descColumn.col.TearSheetItem.Mnemonic === 'SIGDEVDESC') )
                                    {
                                        isFilterTableLayout = true;
                                    }

                                    if(isFilterTableLayout)
                                    {
                                        html += '<ms-tablelayout-f itemid="'+newScope.itemid+'" mnemonicid="'+newScope.mnemonicid+'" tearsheet="tearsheet"></ms-tablelayout-f>';
                                    }
                                    else if(!$scope.isnoneditable && content.EditRow)
                                    {
                                        if(!newScope.tearsheet.header)
                                        {
                                            if(content.VerticalRow)
                                            {
                                                newScope.tearsheet.header = content.VerticalRow.row;
                                            }
                                        }
                                        html += '<ms-tablelayout-e itemid="'+newScope.itemid+'" mnemonicid="'+newScope.mnemonicid+'" tearsheet="tearsheet" isfulloption="null"></ms-tablelayout-e>';
                                    }
                                    else if(col.length)
                                    {
                                        //Fill Up headers
                                        console.log('Inside NonEditable Variation');

                                        var headers = [];

                                        angular.forEach(col, function(eachCol)
                                        {
                                            angular.forEach(eachCol.col, function(header)
                                            {
                                                if(header.TearSheetItem &&
                                                    header.TearSheetItem.id === 'LabelItem')
                                                {
                                                    headers.push(header);
                                                }
                                            });
                                        });
                                        newScope.tearsheet.header = headers;
                                        html += '<ms-tablelayout-r itemid="'+newScope.itemid+'" mnemonicid="'+newScope.mnemonicid+'" tearsheet="tearsheet" iseditable="true"></ms-tablelayout-r>';
                                    }
                                }

                                html += '</div>';
                                el.find('#ms-accordion-content').append($compile(html)(newScope));
                                break;
                            case 'RTFTextAreaItem':
                                var itemId = content.ItemId;
                                var mnemonicId = content.Mnemonic;
                                var prompt = '';
                                var value = templateBusiness.getMnemonicValue(itemId, mnemonicId);

                                if(angular.isDefined(content.prompt) &&
                                    typeof(content.prompt) !== 'object')
                                {
                                    prompt = content.prompt;
                                }

                                var newScope  = $scope.$new();
                                html += '<ms-rich-text-editor itemid="'+itemId+'" ' +
                                    'mnemonicid="'+mnemonicId+'" prompt="'+prompt+'" value="'+ value +'" isdisabled="false"></ms-rich-text-editor>';
                                html += '</div>';
                                el.find('#ms-accordion-content').append($compile(html)(newScope));
                                break;
                            case "ScrapedItem":
                                var newScope  = $scope.$new();
                                var mnemonicid = content.Mnemonic;
                                var itemid = content.ItemId;

                                newScope.mnemonicid = mnemonicid;
                                newScope.itemid = itemid;

                                html += '<ms-message message="Under Construction"></ms-message>';
                                el.find('#ms-accordion-content').append($compile(html)(newScope));
                                break;
                            default:
                                var newScope  = $scope.$new();
                                html += '<ms-message message="Under Construction"></ms-message>';
                                el.find('#ms-accordion-content').append($compile(html)(newScope));
                                break;
                        }
                    });

                };
            }
        };
    }

})();