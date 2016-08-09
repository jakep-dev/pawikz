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
            commonBusiness.emitMsg('saveAllChart');
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

    function msTemplateDirective($compile, templateBusiness)
    {
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
                        component = templateBusiness.getComponents(contentComponents, comp);
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
                console.log('Content Update - ');

                var options = {
                    wheelSpeed            : 1,
                    wheelPropagation      : false,
                    swipePropagation      : true,
                    minScrollbarLength    : null,
                    maxScrollbarLength    : null,
                    useBothWheelAxes      : false,
                    useKeyboard           : true,
                    suppressScrollX       : false,
                    suppressScrollY       : false,
                    scrollXMarginOffset   : 0,
                    scrollYMarginOffset   : 0,
                    stopPropagationOnClick: true
                };

                console.log($('#template-steps')[0]);
                PerfectScrollbar.initialize($('#template-steps')[0], options);
                PerfectScrollbar.destroy($('#main-content')[0]);
                //$('#main-content').perfectScrollbar();
            }
        };
    }
})();