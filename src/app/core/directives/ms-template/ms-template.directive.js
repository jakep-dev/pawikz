(function ()
{
    'use strict';

    angular
        .module('app.core')
        .directive('msTemplate', msTemplateDirective);



    /** @ngInject */
    function msTemplateDirective($compile, $rootScope)
    {

        function firstVariation(contentComponents, comp)
        {
            var sectionId = null;
            var component = null;
            var tearSheetItem = comp.TearSheetItem;

            if(!comp.id && tearSheetItem.length &&
                tearSheetItem.length > 0)
            {
                component = {
                    header: {},
                    sections: []
                };

                _.each(tearSheetItem, function(item)
                {
                    if(item.Label &&
                        item.comId)
                    {
                        sectionId = item.comId;
                        component.header = {
                            label: item.Label,
                            id: item.id,
                            itemid: item.ItemId,
                            mnemonicid: item.Mnemonic,
                            variation: 'first'
                        }
                    }
                });

                //Find section based on sectionId
                if(sectionId)
                {
                    var sectionTearSheetItem = _.filter(contentComponents, function(section)
                    {
                        if(section.id &&
                            section.id === sectionId &&
                            section.TearSheetItem)
                        {
                            return section;
                        }
                    });

                    if(sectionTearSheetItem &&
                        sectionTearSheetItem.length &&
                        sectionTearSheetItem.length > 0)
                    {
                        component.sections.push(sectionTearSheetItem[0]);
                    }
                }
            }

            return component;
        }

        function secondVariation(contentComponents, comp)
        {
            var sectionId = null;
            var component = null;
            var tearSheetItem = comp.TearSheetItem;

            if(tearSheetItem.Label &&
               typeof(tearSheetItem.Label) !== 'object' &&
               tearSheetItem.id &&
               tearSheetItem.id === 'LabelItem')
            {
                var startIndex = _.findIndex(contentComponents, comp);
                var endIndex = startIndex + 1;

                var foundIndex = false;
                _.each(contentComponents.slice(startIndex + 1, contentComponents.length - 1),
                    function(each)
                {
                   if(each.TearSheetItem.Label &&
                      typeof(each.TearSheetItem.Label) === 'object' &&
                      each.TearSheetItem.id &&
                      each.TearSheetItem.id === 'LabelItem')
                   {
                       foundIndex = true;
                   }
                    if(!foundIndex)
                        endIndex++;
                });

                var fullGroupComponents = contentComponents.slice(startIndex, endIndex);

                if(fullGroupComponents)
                {
                    component = {
                        header: {},
                        sections: []
                    };

                    _.each(fullGroupComponents, function(grpComp)
                    {
                        var item = grpComp.TearSheetItem;

                        if(item.Label)
                        {
                            component.header = {
                                label: item.Label,
                                id: item.id,
                                itemid: item.ItemId || '',
                                mnemonicid: item.Mnemonic || '',
                                variation: 'second'
                            }
                        }
                        else if(grpComp.id)
                        {
                            sectionId = grpComp.id;
                        }
                    });

                    //Find section based on sectionId
                    if(sectionId)
                    {
                        var sectionTearSheetItem = _.filter(fullGroupComponents, function(section)
                        {
                            if(section.TearSheetItem &&
                               section.id &&
                               section.id === sectionId)
                            {
                                return section;
                            }
                        });

                        if(sectionTearSheetItem &&
                           sectionTearSheetItem.length &&
                           sectionTearSheetItem.length > 0)
                        {
                            component.sections.push(sectionTearSheetItem[0]);
                        }
                    }
                }
            }

            return component;
        }

        function thirdVariation(contentComponents, comp)
        {
            var component = null;
            var tearSheetItem = comp.TearSheetItem;

            if(comp.id &&
               tearSheetItem &&
               tearSheetItem.ItemId &&
               tearSheetItem.Mnemonic) {
                component = {
                    header: {},
                    sections: []
                };

                component.header = {
                    label: tearSheetItem.prompt,
                    id: comp.id,
                    itemid: tearSheetItem.ItemId || '',
                    mnemonicid: tearSheetItem.Mnemonic || '',
                    variation: 'third'
                };

                component.sections.push(comp);
            }

            return component;
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
                console.log(scope);

                var components = scope.components;

                var headerComponents = [];
                var contentComponents =  [];
                var templateData = {
                    header: {},
                    content: []
                };

                headerComponents.push.apply(headerComponents, components.slice(0,2));
                contentComponents.push.apply(contentComponents, components.slice(2, components.length - 1));


                console.log('Body Componenets');
                console.log(contentComponents);

                //Build Headers
                _.each(headerComponents, function(component)
                {
                    var tearSheetItem = component.TearSheetItem;

                    if(!tearSheetItem.id)
                        return;

                    if(tearSheetItem.id === 'GenericTableItem')
                    {
                        //Tool Bar Code
                    }
                    else if(tearSheetItem.id === 'LabelItem') {
                        templateData.header.label = tearSheetItem.Label;
                        templateData.header.id = tearSheetItem.id;
                        templateData.header.type = tearSheetItem.type;
                    }
                });

                //Build Components.
                var processedComp = [];


                //Build Content
                _.each(contentComponents, function(comp)
                {
                    var component = null;
                    var sectionId = null;
                    var tearSheetItem = comp;
                    var isReadyToProcess = true;

                    if(comp.TearSheetItem.Label &&
                        typeof(comp.TearSheetItem.Label) === 'object')
                    {
                        isReadyToProcess = false;
                    }
                    else if(comp.id) {
                        isReadyToProcess =  (_.findIndex(processedComp, {compId: comp.id}) === -1);
                    }

                    if(isReadyToProcess)
                    {
                        //Finding First Variation.
                        component = firstVariation(contentComponents, comp);

                        if(!component)
                        {
                            component = secondVariation(contentComponents, comp);
                        }

                        if(!component)
                        {
                            component = thirdVariation(contentComponents, comp);
                        }
                    }

                    if(component)
                    {
                        _.each(component.sections, function(section)
                        {
                            if(section.id)
                            {
                                processedComp.push({
                                    compId: section.id
                                });
                            }
                        });

                        templateData.content.push(component);
                    }

                });

                console.log('Template Data - ');
                console.log(templateData);
                console.log(processedComp);
                console.log('Template component creation ended - ');


                //Render the header for the step
                if(templateData.header)
                {
                    scope.stepName = templateData.header.label;
                }

                //Render the content for the step
                if(templateData.content)
                {
                    angular.forEach(templateData.content, function(renderContent)
                    {
                        if(renderContent.header &&
                           renderContent.sections &&
                           renderContent.sections.length > 0)
                        {
                            var newScope = scope.$new();
                            newScope.tearheader = renderContent.header;
                            newScope.tearcontent = [];

                            angular.forEach(renderContent.sections, function(section)
                            {
                                if(section.TearSheetItem &&
                                   section.TearSheetItem.length)
                                {
                                    newScope.tearcontent.push.apply(newScope.tearcontent, section.TearSheetItem);
                                }
                                else if(section.TearSheetItem) {
                                    newScope.tearcontent.push(section.TearSheetItem);
                                }
                            });

                            if(newScope.tearcontent)
                            {
                                var html = '<ms-component tearheader="tearheader" tearcontent="tearcontent"></ms-component>';
                                el.find('#template-content').append($compile(html)(newScope));
                            }
                        }
                    });
                }
            }
        };
    }
})();