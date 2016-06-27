(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('msTemplateController', msTemplateController)
        .directive('msTemplate', msTemplateDirective);

    function msTemplateController($scope, $mdMenu, templateBusiness, commonBusiness,$rootScope)
    {
        var vm = this;

        vm.isExpandAll = true;
		vm.isPrintableAll = commonBusiness.isPrintableAll;
        templateBusiness.isTemplateExpandAll = vm.isExpandAll;
        vm.saveAll = saveAll;
        vm.toggleExpand = toggleExpand;
		vm.printableAll = printableAll;
        vm.pdfExport = exportCharts;
        vm.determinateValue = 1;

        var socket = io();
        socket.on("pdfc status progress", function (data) {
            setTimeout(function() {
                vm.determinateValue=data.percentage;
                console.log("determinateValue:", vm.determinateValue);
                if(vm.determinateValue>100)
                    vm.determinateValue=1;
            }, 0);
        });
        //Save the entire template data.
        function saveAll()
        {
            //Changed Date: 28/4/2016 as per Bug - Chart title not saving
            $rootScope.$broadcast('saveAllChart');
            templateBusiness.save();
            templateBusiness.saveTable();
            $mdMenu.hide();
            templateBusiness.cancelPromise();
        }

        function exportCharts()
        {
            $rootScope.$broadcast('exportAllCharts');
        }


        //Toggle expand or collapse
        function toggleExpand()
        {
            vm.isExpandAll = !vm.isExpandAll;
            commonBusiness.isTemplateExpandAll = vm.isExpandAll;
            $mdMenu.hide();
        }
		
		function printableAll(){
			vm.isPrintableAll = !vm.isPrintableAll;
			commonBusiness.isPrintableAll = vm.isPrintableAll;
            $mdMenu.hide();
		}
	
	}

    /** @ngInject */
    function msTemplateDirective($compile)
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
            var startIndex = _.findIndex(contentComponents, comp);
            var isSkip = false;

            //Determine previous had Label
            var nextComp = contentComponents[startIndex + 1];
            if(nextComp && nextComp.TearSheetItem &&
               !nextComp.TearSheetItem.length && !nextComp.TearSheetItem.comId)
            {
                isSkip = true;
            }

            if(!isSkip &&
               tearSheetItem.Label &&
               typeof(tearSheetItem.Label) !== 'object' &&
               tearSheetItem.id &&
               tearSheetItem.id === 'LabelItem')
            {

                var endIndex = startIndex + 1;

                var foundIndex = false;
                var secondVariationComp = contentComponents.slice(startIndex + 1, contentComponents.length - 1);

                _.each(secondVariationComp,function(each)
                {
                   if((each.TearSheetItem.Label &&
                      typeof(each.TearSheetItem.Label) !== 'object' &&
                      each.TearSheetItem.id &&
                      each.TearSheetItem.id === 'LabelItem'))
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

                        if(!item.length)
                        {
                            if(item.Label &&
                               typeof(item.Label) !== 'object')
                            {
                                component.header = {
                                    label: item.Label,
                                    id: item.id,
                                    itemid: item.ItemId || '',
                                    mnemonicid: item.Mnemonic || '',
                                    variation: 'second'
                                }
                                if(item.comId)
                                {
                                    sectionId = item.comId;
                                }
                            }
                            else {
                                sectionId = grpComp.id;
                            }
                        }
                        else if(!grpComp.id) {
                            _.each(item, function(eachSection)
                            {
                                if(!eachSection.comId)
                                {
                                    component.sections.push(eachSection);
                                }
                                else if(eachSection.comId)
                                {
                                    sectionId = eachSection.comId;
                                }

                                if(sectionId)
                                {
                                    var compSection = extractSection(fullGroupComponents, sectionId);
                                    if(compSection)
                                    {
                                        component.sections.push(compSection);
                                    }
                                    sectionId = null;
                                }
                            });
                        }
                    });

                    //Find section based on sectionId
                    if(sectionId)
                    {
                        var compSection = extractSection(fullGroupComponents, sectionId);

                        if(compSection)
                        {
                            component.sections.push(compSection);
                        }
                    }
                }
            }

            return component;
        }

        function extractSection(fullGroupComponents, sectionId)
        {
            if(!sectionId || !fullGroupComponents ||
                fullGroupComponents.length === 0)
            {
                return null;
            }

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
                return sectionTearSheetItem[0];
            }
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

        function fourthVariation(contentComponents, comp)
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

                        if(!item.length)
                        {
                            if(item.Label &&
                                typeof(item.Label) !== 'object')
                            {
                                component.header = {
                                    label: item.Label,
                                    id: item.id,
                                    itemid: item.ItemId || '',
                                    mnemonicid: item.Mnemonic || '',
                                    variation: 'fourth'
                                }
                                if(item.comId)
                                {
                                    sectionId = item.comId;
                                }
                            }
                            else {
                                sectionId = grpComp.id;
                            }
                        }
                    });

                    //Find section based on sectionId
                    if(sectionId)
                    {
                        var compSection = extractSection(fullGroupComponents, sectionId);

                        if(compSection)
                        {
                            component.sections.push(compSection);
                        }
                    }
                }
            }

            return component;
        }

        function fifthVariation(contentComponents, comp)
        {
            var tearSheetItem = comp.TearSheetItem;
            var component = null;

            if(tearSheetItem.id &&
                tearSheetItem.row &&
                tearSheetItem.row.col &&
                tearSheetItem.row.col.length > 1)
            {
                component = {
                    header: {},
                    sections: []
                };

                _.each(tearSheetItem.row.col, function(eachCol)
                {
                   var item = eachCol.TearSheetItem;

                    if(item.id === 'LabelItem')
                    {
                      component.header = {
                          label: item.Label,
                          id: item.id,
                          itemid: '',
                          mnemonicid: '',
                          variation: 'fifth'
                      }
                    }
                    else {
                        component.sections.push(eachCol);
                    }
                });
            }

            return component;
        }

        function sixthVariation(contentComponents, comp)
        {
            var tearSheetItem = comp.TearSheetItem;
            var component = null;

            if(tearSheetItem &&
               tearSheetItem.length &&
                (comp.copyProposed || comp.copyExpiring))
            {
                component = {
                    header: {},
                    sections: []
                };

                _.each(tearSheetItem, function(item)
                {
                    if(item.id === 'LabelItem')
                    {
                        component.header = {
                            label: item.Label,
                            id: item.id,
                            itemid: '',
                            mnemonicid: '',
                            variation: 'sixth',
                            copyproposed: comp.copyProposed || null,
                            copyexpiring: comp.copyExpiring || null
                        }
                    }
                    else {
                        item.id = comp.copyProposed ? 'ExpiringProgram' : 'ProposedProgram';
                        component.sections.push(item);
                    }
                });
            }

            return component;
        }

        return {
            restrict: 'E',
            scope   : {
                components: '='
            },
            controller: 'msTemplateController',
            controllerAs: 'vm',
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

                var headerEndIndex = null;

                _.each(components, function(findHeader)
                {
                    var tearSheetItem = findHeader.TearSheetItem;

                    if(tearSheetItem &&
                        tearSheetItem.Label &&
                        typeof(tearSheetItem.Label) !== 'object' &&
                        !headerEndIndex)
                    {
                        headerEndIndex = _.findIndex(components, findHeader);
                        return;
                    }
                });


                headerComponents.push.apply(headerComponents, components.slice(0,headerEndIndex + 1));
                contentComponents.push.apply(contentComponents, components.slice(headerEndIndex + 1, components.length - 1));

                console.log('Header Component Index');
                console.log(headerEndIndex);
                console.log('Header Component');
                console.log(headerComponents);
                console.log('Content Componenets');
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

                        //var newScope = scope.$new();
                        //newScope.tearheader = {};
                        //newScope.tearcontent = [];
                        //newScope.iscollapsible = true;
                        //newScope.isprocesscomplete = true;
                        //newScope.isnoneditable = false;
                        //
                        //newScope.tearheader = {
                        //    label: 'Available Links',
                        //    id: 'avalLink',
                        //    itemid: '',
                        //    mnemonicid: ''
                        //}
                        //
                        //newScope.tearcontent.push(component.TearSheetItem);
                        //
                        //var html = '<ms-component tearheader="tearheader" tearcontent="tearcontent" iscollapsible="iscollapsible" isnoneditable="isnoneditable" isprocesscomplete="isprocesscomplete"></ms-component>';
                        //el.find('#template-content').append($compile(html)(newScope));
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
                        if(comp.TearSheetItem && comp.TearSheetItem.Mnemonic)
                        {
                            if(comp.TearSheetItem.Mnemonic === 'WU_STOCK_CHART_3YR')
                            {
                                isReadyToProcess = false;
                            }
                        }
                    }
                    else if(comp.TearSheetItem.length)
                    {
                        _.each(comp.TearSheetItem, function(tearSheet)
                        {
                            if(isReadyToProcess)
                            {
                                isReadyToProcess= (_.findIndex(processedComp, {compId: tearSheet.id}) === -1);
                            }
                        });
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

                        if(!component)
                        {
                            component = fourthVariation(contentComponents, comp);
                        }

                        if(!component)
                        {
                            component = fifthVariation(contentComponents, comp);
                        }

                        if(!component)
                        {
                            component = sixthVariation(contentComponents, comp);
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
                    else if(comp.TearSheetItem &&
                        comp.TearSheetItem.id === 'LinkItem')
                    {
                        templateData.content.push(comp.TearSheetItem);
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
                            var newScope = scope.$new(true);
                            newScope.tearheader = renderContent.header;
                            newScope.tearcontent = [];

                            angular.forEach(renderContent.sections, function(section)
                            {
                                newScope.isnoneditable =  (section.type === 'nonEditableUnmark');
                                if(section.TearSheetItem &&
                                    section.TearSheetItem.length)
                                {
                                    newScope.tearcontent.push.apply(newScope.tearcontent, section.TearSheetItem);
                                }
                                else if(section.TearSheetItem) {
                                    newScope.tearcontent.push(section.TearSheetItem);
                                }
                                else if(section.Label)
                                {
                                    newScope.tearcontent.push(section);
                                }
                                else if(section.row)
                                {
                                    newScope.tearcontent.push(section);
                                }
                            });

                            if(newScope.tearcontent)
                            {
                                newScope.iscollapsible = true;
                                newScope.isprocesscomplete = true;
                                newScope.actions = [];
                                var isChartComp = false;

                                //Check for chart component
                                angular.forEach(newScope.tearcontent, function(each)
                                {
                                    if(each.id === 'ScrapedItem' && each.Mnemonic.indexOf('WU_STOCK_CHART') !== -1)
                                    {
                                        isChartComp = true;
                                    }
                                });

                                if(isChartComp)
                                {
                                    var html = '<ms-chart-component tearheader="tearheader" tearcontent="tearcontent" iscollapsible="iscollapsible" isnoneditable="isnoneditable" isprocesscomplete="isprocesscomplete"></ms-chart-component>';
                                }else {
                                    var html = '<ms-component tearheader="tearheader" tearcontent="tearcontent" iscollapsible="iscollapsible" isnoneditable="isnoneditable" isprocesscomplete="isprocesscomplete" actions="actions"></ms-component>';
                                }


                                el.find('#template-content').append($compile(html)(newScope));
                            }
                        }
                        else {
                            switch(renderContent.id)
                            {
                                case 'LinkItem':
                                    var newScope = scope.$new();
                                    var html = '<div layout-padding>';
                                    html += '<ms-link value="' + renderContent.Label + '" href="'+ renderContent.url +'"></ms-link>';
                                    html += '</div>';
                                    el.find('#template-content').append($compile(html)(newScope));
                                    break;
                            }

                        }
                    });
                }
                console.log('Content - ');
                console.log($('#main-content'));

            }
        };
    }
})();