
(function(templateBusiness)
{

    var _ = require('underscore');

    ///Loop thru the content components and get the components ready to display on UI
    function getComponents(contentComponents, comp)
    {
        var component = null;
        var variations = initVariations(contentComponents, comp);

        while (variations.length){
            component = variations.shift().call();
            if(component)
                return component;
        }
        return component;
    }

    ///Get the header index
    templateBusiness.getHeaderIndex = function(components)
    {
        var headerEndIndex = 0;
        _.each(components, function(findHeader)
        {
            var tearSheetItem = findHeader.TearSheetItem;

            if(tearSheetItem && tearSheetItem.subtype &&
                tearSheetItem.subtype === 'Header1' &&
                !headerEndIndex)
            {
                headerEndIndex = _.findIndex(components, findHeader);
                return;
            }
        });
        return headerEndIndex;
    };

    ///Get header and content components
    templateBusiness.getHeaderAndContentComponents = function(components)
    {
      var comp = {
          headers: [],
          contents: []
      };
        _.each(components, function(component)
        {
            //console.log('Component ID:' + component.id);
           var tearSheetItem = component.TearSheetItem;
           if(tearSheetItem && tearSheetItem.subtype &&
               (tearSheetItem.subtype === 'Header1' ||
                tearSheetItem.subtype === 'Header2'))
           {
               //console.log('Pushing Header Component ID:' + component.id);
               comp.headers.push(component);
           }
           else {
               //console.log('Pushing Content Component ID:' + component.id);
               comp.contents.push(component);
           }
        });
        return comp;
    };

    ///Get the header components
    templateBusiness.getHeaderComponents = function(components)
    {
        var headerComponents = [];
        headerComponents.push.apply(headerComponents, components.slice(templateBusiness.getHeaderIndex() + 1, templateBusiness.getHeaderIndex() + 2));
        return headerComponents;
    };

    ///Get the content components
    templateBusiness.getContentComponents = function(components, contentIndex)
    {
        var contentComponents =  [];
        contentComponents.push.apply(contentComponents, components.slice(templateBusiness.getHeaderIndex() + 1, components.length - 1));
        return contentComponents;
    };

    ///Build header components
    templateBusiness.buildHeaderComponents = function(headerComponents)
    {
        var header = {};

        _.each(headerComponents, function(component)
        {
            var tearSheetItem = component.TearSheetItem;

            if(!tearSheetItem &&
               !tearSheetItem.id)
                return null;

            if(tearSheetItem.subtype === 'Header1') {
                header.label = tearSheetItem.Label;
            }
            else if(tearSheetItem.subtype === 'Header2') {
                header.subheader = tearSheetItem.Label;
            }
        });

        return header;
    };

    templateBusiness.buildContentComponents = function(contentComponents)
    {
        var contents = [];
        var processedComp = [];

        //Build Content
        _.each(contentComponents, function(comp)
        {
            var component = null;
            var isReadyToProcess = true;

            if(comp.TearSheetItem.Label &&
                typeof(comp.TearSheetItem.Label) === 'object')
            {
                isReadyToProcess = false;
            }
            else if(comp.isProcessed)
            {
                isReadyToProcess = false;
            }


            if(isReadyToProcess)
            {
                component = getComponents(contentComponents, comp);
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

                contents.push(component);
            }
            else if (comp.id === 'WU_RATIOS_CHART') {
                comp.TearSheetItem.id = 'WU_RATIOS_CHART';
                comp.TearSheetItem.type = comp.type;
                contents.push(comp.TearSheetItem);
            }
            else if(comp.TearSheetItem &&
                comp.TearSheetItem.id === 'LinkItem')
            {
                contents.push(comp.TearSheetItem);
            }
            else if(comp.TearSheetItem &&
                comp.TearSheetItem.subtype)
            {
                contents.push(comp.TearSheetItem);
            }

        });

        return contents;
    };

    ///Initialize the variation
    function initVariations(contentComponents, comp)
    {
        var sectionCompVariationFunc = function(){
            return sectionCompVariation(contentComponents, comp);
        };

        var sectionParentChildVariationFunc = function()
        {
            return parentChildVariation(contentComponents, comp);
        };

        var sectionParentChildMulitpleVariationFunc = function()
        {
            return parentChildMultipleVariation(contentComponents, comp);
        };

        var variations = [ sectionCompVariationFunc,
            sectionParentChildVariationFunc,
            sectionParentChildMulitpleVariationFunc
        ];

        return variations;
    }

    ///Tear-sheet section component relationship
    function sectionCompVariation(contentComponents, comp)
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
                        prelabel: item.PreLabel || '',
                        itemid: item.ItemId,
                        mnemonicid: item.Mnemonic,
                        variation: 'section'
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
                    sectionTearSheetItem[0].isProcessed = true;
                    component.sections.push(sectionTearSheetItem[0]);
                }
            }
        }

        return component;
    }

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    ///Tear-sheet parent child variation
    function parentChildVariation(contentComponents, comp)
    {
        var component = null;
        var tearSheetItem = comp.TearSheetItem;

        if(tearSheetItem && tearSheetItem.ParentCom &&
            tearSheetItem.ParentCom.ChildCom &&
            typeof(tearSheetItem.ParentCom.ChildCom) === 'string')
        {
            component = {
                header: {},
                sections: []
            };

            component.header = {
                label: tearSheetItem.Label,
                id: tearSheetItem.id,
                itemid: "SECTION_" + getRandomInt(10, 100000),
                prelabel: tearSheetItem.PreLabel || '',
                mnemonicid: null,
                variation: 'parent-child'
            };

            var sectionId = tearSheetItem.ParentCom.ChildCom;

            if(sectionId)
            {
                var sectionItem = _.filter(contentComponents, function(section)
                {
                    if(section.id &&
                        section.id === sectionId &&
                        section.TearSheetItem)
                    {
                        return section;
                    }
                });

                if(sectionItem &&
                    sectionItem.length &&
                    sectionItem.length > 0)
                {
                    sectionItem[0].isProcessed = true;
                    //component.sections.push(sectionItem[0]);
                    console.log('Start');
                    console.log(sectionItem[0]);
                    console.log('End');

                    if(sectionItem[0].TearSheetItem.length)
                    {
                        _.each(sectionItem[0].TearSheetItem, function(sheet)
                        {
                            component.sections.push(sheet);
                            if(sheet.ParentCom)
                            {
                                var sectionId = sheet.ParentCom.ChildCom;

                                var sectionItem = _.filter(contentComponents, function(section)
                                {
                                    if(section.id &&
                                        section.id === sectionId &&
                                        section.TearSheetItem)
                                    {
                                        return section;
                                    }
                                });

                                if(sectionItem &&
                                    sectionItem.length &&
                                    sectionItem.length > 0)
                                {
                                    sectionItem[0].isProcessed = true;
                                    component.sections.push(sectionItem[0]);
                                }

                            }
                        });
                    }
                    else {
                        component.sections.push(sectionItem[0]);
                    }
                }
            }
        }

        return component;
    }

    //Multiple parent-child relationship
    function parentChildMultipleVariation(contentComponents, comp)
    {
        var component = null;
        var tearSheetItem = comp.TearSheetItem;

        if(tearSheetItem && tearSheetItem.ParentCom &&
            tearSheetItem.ParentCom.ChildCom)
        {
            component = {
                header: {},
                sections: []
            };

            component.header = {
                label: tearSheetItem.Label,
                id: tearSheetItem.id,
                itemid: null,
                mnemonicid: null,
                subtype: tearSheetItem.subtype || '',
                prelabel: tearSheetItem.PreLabel || '',
                variation: 'parent-child-multiple'
            };


            _.each(tearSheetItem.ParentCom.ChildCom, function(sectionId)
            {
                if(sectionId)
                {
                    var sectionItem = _.filter(contentComponents, function(section)
                    {
                        if(section.id &&
                            section.id === sectionId &&
                            section.TearSheetItem)
                        {
                            return section;
                        }
                    });

                    if(sectionItem &&
                        sectionItem.length &&
                        sectionItem.length > 0)
                    {
                        //Check for array and compId,
                        var sections = sectionItem[0];
                        if(sections && sections.TearSheetItem &&
                            sections.TearSheetItem.length)
                        {
                            _.each(sections.TearSheetItem, function(sec)
                            {
                                var comId = sec.comId,
                                    section = null;

                                if(comId)
                                {
                                    section = getSectionByCompId(contentComponents, comId);
                                }


                                if(section)
                                {
                                    section[0].isProcessed = true;
                                    component.sections.push(section[0]);
                                }
                                else {
                                    if(sections.TearSheetItem.length > 1)
                                    {
                                        sec.itemid = sections.TearSheetItem[1].ItemId;
                                        sec.mnemonicid = sections.TearSheetItem[1].Mnemonic;
                                    }
                                    sec.isProcessed = true;
                                    component.sections.push(sec);
                                }
                            });
                        }
                    }
                }
            });
        }

        return component;
    }

    //Get section based on compId/sectionId
    function getSectionByCompId(contentComponents, sectionId)
    {
        var section = null;
        if(contentComponents && sectionId)
        {
            var sectionItem = _.filter(contentComponents, function(section)
            {
                if(section.id &&
                    section.id === sectionId &&
                    section.TearSheetItem)
                {
                    return section;
                }
            });

            if(sectionItem &&
                sectionItem.length &&
                sectionItem.length > 0) {
                section = [];
                section.push(sectionItem[0]);
            }
        }
        return section;
    }

})(module.exports);

