(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('msComponentController', msComponentController)
        .directive('msComponent', msComponentDirective);

    function msComponentController($scope)
    {
        var vm = this;
        vm.isNonEditable = $scope.isnoneditable;
        vm.iscollapsible = $scope.iscollapsible;
        vm.isProcessComplete = $scope.isprocesscomplete;


        $scope.$watch(
            "isprocesscomplete",
            function handleProgress(value) {
                console.log('Progress Watch Triggered');
                vm.isProcessComplete = value;
            }
        );

        vm.collapsed = false;
        vm.toggleCollapse = toggleCollapse;

        function toggleCollapse()
        {
            vm.collapsed = !vm.collapsed;
        }

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
                isprocesscomplete: '=?'
            },
            controller: 'msComponentController',
            controllerAs: 'vm',
            templateUrl: 'app/core/directives/ms-template/templates/ms-component/ms-component.html',
            link: function(scope, el, attrs)
            {
                scope.title = scope.tearheader.label;
                var html = '';
                var isTableLayout = false;
                isTableLayout = (scope.tearcontent.length && scope.tearcontent.length > 1 &&
                _.findIndex(scope.tearcontent, {id: 'TableLayOut'}) !== -1)

                angular.forEach(scope.tearcontent, function(content)
                {
                    html = '<div>';
                    switch (content.id)
                    {
                        case 'LabelItem':
                            var newScope  = scope.$new();
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

                            var newScope  = scope.$new();
                            newScope.tearsheet = {
                                rows: content.row
                            };

                            newScope.isnoneditable = scope.isnoneditable;

                            html += '<ms-generic-table tearsheet="tearsheet" isnoneditable="isnoneditable"></ms-generic-table>';
                            html += '</div>';
                            el.find('#ms-accordion-content').append($compile(html)(newScope));
                            break;
                        case 'TableLayOut':
                            var newScope  = scope.$new();

                            var header = null;
                            var col = null;

                            //Get Header And Body Details
                            if(isTableLayout)
                            {
                                var genericTableItemRow = _.first(scope.tearcontent);
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

                            console.log('TableContent');
                            console.log(newScope);
                            console.log(scope);

                            html += '<ms-tablelayout itemid="'+newScope.itemid+'" mnemonicid="'+newScope.mnemonicid+'" tearsheet="tearsheet"></ms-tablelayout>';
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

                            var newScope  = scope.$new();
                            html += '<ms-rich-text-editor itemid="'+itemId+'" ' +
                                'mnemonicid="'+mnemonicId+'" prompt="'+prompt+'" value="'+ value +'" isdisabled="false"></ms-rich-text-editor>';
                            html += '</div>';
                            el.find('#ms-accordion-content').append($compile(html)(newScope));
                            break;
                        case "ScrapedItem":
                            var newScope  = scope.$new();
                            var mnemonicid = content.Mnemonic;
                            var itemid = content.ItemId;

                            newScope.mnemonicid = mnemonicid;
                            newScope.itemid = itemid;

                            html += '<ms-chart type="Stock" mnemonicid="'+ mnemonicid +'" itemid="'+ itemid +'"></ms-chart>';
                            el.find('#ms-accordion-content').append($compile(html)(newScope));
                            break;
                    }
                });

            }
        };
    }

})();