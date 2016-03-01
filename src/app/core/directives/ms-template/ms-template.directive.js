(function ()
{
    'use strict';

    angular
        .module('app.core')
        .directive('msTemplate', msTemplateDirective);



    /** @ngInject */
    function msTemplateDirective($compile, $rootScope)
    {

        function setElement(scope, el, tearSheetItem)
        {
            var html = '<div>';

            switch (tearSheetItem.id)
            {
                case 'LabelItem':
                    var newScope  = scope.$new();
                    if(typeof(tearSheetItem.Label) !== 'object')
                    {
                        var splitType = tearSheetItem.type.split(' ');
                        switch (splitType[0])
                        {
                            case 'header1':
                            case 'header2':
                            case 'header3':
                            case 'header4':
                            case 'header5':
                            case 'header6':

                                var newScope  = scope.$new();
                                newScope.tearsheet = {
                                    type: tearSheetItem.type,
                                    value: tearSheetItem.Label,
                                    mnemonics: tearSheetItem.id
                                };
                                html += '<ms-header tearsheet="tearsheet"></ms-header>';
                                html += '</div>';
                                //el.find('#template-content').append($compile(html)(newScope));

                                break;

                            case 'fieldLabel':
                                html += '<ms-label value="'+ tearSheetItem.Label +'"></ms-label>';
                                html += '</div>';
                                //el.find('#template-content').append($compile(html)(scope));
                                break;
                        }
                    }
                    else {
                        html += '<ms-blank></ms-blank>';
                        html += '</div>';
                    }
                    el.find('#template-content').append($compile(html)(newScope));
                    break;
                case "ScrapedItem":
                    var newScope  = scope.$new();
                    var mnemonicid = tearSheetItem.Mnemonic;
                    var itemid = tearSheetItem.ItemId;

                    html += '<ms-chart type="Stock" mnemonicid="'+ mnemonicid +'" itemid="'+ itemid +'"></ms-chart>';
                    el.find('#template-content').append($compile(html)(newScope));
                    break;
                case 'GenericTableItem':
                        var newScope  = scope.$new();
                        newScope.tearsheet = {
                            rows: tearSheetItem.row
                        };
                        html += '<ms-generic-table tearsheet="tearsheet"></ms-generic-table>';
                        html += '</div>';
                        el.find('#template-content').append($compile(html)(newScope));
                    break;
                case 'Component':
                        var contentCompId = 0;
                        var tearcontent = [];
                        var tearSheet = [];

                        angular.forEach(tearSheetItem, function(each)
                        {
                            contentCompId = each.comId;
                        })

                        if(!angular.isUndefined(contentCompId))
                        {
                            tearSheet = tearSheetItem;
                            angular.forEach(scope.steps.Component, function(step)
                            {
                                if(step.id === contentCompId)
                                {
                                    tearcontent.push(step);
                                }
                            });
                        }
                        else {
                            tearSheet.push(tearSheetItem[0]);
                            tearcontent.push(tearSheetItem[1]);
                        }


                       var newScope = scope.$new();
                       newScope.tearsheet = tearSheet;
                       newScope.tearcontent = tearcontent;
                       html += '<ms-component tearsheet="tearsheet" tearcontent="tearcontent"></ms-component>';
                       html += '</div>';
                       el.find('#template-content').append($compile(html)(newScope));
                    break;
                case 'LinkItem':
                    var newScope = scope.$new();
                    var value = '';
                    var link = ''
                    if(angular.isDefined(tearSheetItem.Label))
                    {
                        value = tearSheetItem.Label;
                        link = tearSheetItem.Link;
                    }
                    else {
                        var itemId = tearSheetItem.ItemId;
                        var mnemonicId = tearSheetItem.Mnemonic;
                        var value = templateBusiness.getMnemonicValue(itemId, mnemonicId);
                        link = value;
                    }
                    html += '<ms-link value="'+value+'" href="'+link+'" isdisabled="false"></ms-link>';
                    el.find('#template-content').append($compile(html)(newScope));
                    break;
            }
        }


        return {
            restrict: 'E',
            scope   : {
                components: '='
            },
            templateUrl: 'app/core/directives/ms-template/ms-template.html',
            link:function(scope, el, attrs)
            {
                console.log('Template component creation initiated - ');
                console.log(scope.components);

                var compCount = 0;
                var processingComp = scope.components;

                angular.forEach(processingComp, function(component)
                {
                    var tearSheetItem = component.TearSheetItem;

                    if(compCount > 1) //Remove this check
                    {
                        if(tearSheetItem.length > 0)
                        {
                            var html = '<div>';
                            var tearSheet = [];
                            var tearContent = [];
                            var isCollapse = false;

                            var countTearSheetItem = 0;
                            angular.forEach(tearSheetItem, function(eachItem)
                            {
                                if(countTearSheetItem === 0)
                                {
                                    tearSheet.push(eachItem);
                                }
                                else {
                                    tearContent.push(eachItem);
                                }

                                if(eachItem.id === 'SectionItem')
                                {
                                    isCollapse = true;
                                    tearContent = [];
                                    var indexOfComponent = -1;
                                    var findCompCount = 0;
                                    angular.forEach(processingComp, function(findComp)
                                    {
                                        if(findComp.id === eachItem.comId)
                                        {
                                            tearContent = findComp.TearSheetItem;
                                            indexOfComponent = findCompCount;
                                        }
                                        findCompCount++;
                                    });

                                    if(indexOfComponent > -1)
                                    {
                                        processingComp.splice(indexOfComponent, 1);
                                    }
                                }
                                countTearSheetItem++;
                            });

                            var newScope = scope.$new();
                            newScope.tearsheet = tearSheet;
                            newScope.tearcontent = tearContent;
                            newScope.iscollapse = isCollapse;

                            html += '<ms-component tearsheet="tearsheet" tearcontent="tearcontent" iscollapse="iscollapse"></ms-component>';
                            html += '</div>';
                            el.find('#template-content').append($compile(html)(newScope));
                        }
                        else
                        {
                            console.log(tearSheetItem);
                            setElement(scope, el, tearSheetItem);
                        }
                    }

                    compCount++;
                });

                console.log('Template component creation ended - ');
            }
        };
    }
})();