(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('msComponentController', msComponentController)
        .directive('msComponent', msComponentDirective);

    function msComponentController($scope)
    {
        $scope.collapse = collapse;

        //Toggle the collapse
        function collapse()
        {
            $scope.collapsed = !$scope.collapsed;
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
                iscollapse: '=?'
            },
            controller: 'msComponentController',
            templateUrl: 'app/core/directives/ms-template/templates/ms-component/ms-component.html',
            link: function(scope, el, attrs)
            {
                scope.collapsed = false;
                scope.title = scope.tearheader.label;
                var html = '';
                angular.forEach(scope.tearcontent, function(content)
                {
                    html = '<div>';
                    switch (content.id)
                    {
                        case 'LabelItem':
                            var newScope  = scope.$new();
                            html += '<ms-label value="Sherin"></ms-label>';
                            html += '</div>';
                            el.find('#ms-accordion-content').append($compile(html)(newScope));
                            break;

                        case 'GenericTableItem':
                            var newScope  = scope.$new();
                            newScope.tearsheet = {
                                rows: content.row
                            };
                            console.log(newScope);
                            html += '<ms-generic-table tearsheet="tearsheet"></ms-generic-table>';
                            html += '</div>';
                            el.find('#ms-accordion-content').append($compile(html)(newScope));
                            break;
                        case 'TableLayOut':
                            //var newScope  = scope.$new();
                            //html += '<ms-message message="Under Construction"></ms-message>';
                            //html += '</div>';
                            //el.find('#ms-accordion-content').append($compile(html)(newScope));
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
                    }
                });

            }
        };
    }

})();