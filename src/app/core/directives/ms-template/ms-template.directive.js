(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('msTemplateController', msTemplateController)
        .directive('msTemplate', msTemplateDirective);

    function msTemplateController($rootScope, $scope, $mdMenu, templateBusiness, commonBusiness, workupBusiness)
    {
        var vm = this;

        vm.isExpandAll = true;
		vm.isPrintableAll = commonBusiness.isPrintableAll;
        templateBusiness.isTemplateExpandAll = vm.isExpandAll;
        vm.saveAll = saveAll;
        vm.toggleExpand = toggleExpand;
		vm.printableAll = printableAll;
        vm.pdfDownload = pdfDownload;
        vm.renew = renew;

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

        function pdfDownload() {

            templateBusiness.requestPdfDownload();
        }

        function exportCharts1()
        {
            $rootScope.$broadcast('exportAllCharts');
        }

        function renew()
        {
            workupBusiness.renew(commonBusiness.userId, commonBusiness.projectId, 'reload-steps');

            commonBusiness.onMsg('reload-steps', $scope, function()
            {
                $scope.refreshstep();
            });
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

    function msTemplateDirective($compile, templateBusiness, commonBusiness, deviceDetector, clientConfig)
    {
        return {
            restrict: 'E',
            scope   : {
                components: '=',
                refreshstep: '='
            },
            controller: 'msTemplateController',
            controllerAs: 'vm',
            templateUrl: 'app/core/directives/ms-template/ms-template.html',
            link:function(scope, el, attrs)
            {
                //Storing the components for future load.
                templateBusiness.components = scope.components;

                scope.isLoadMoreDisabled = false;

                console.log('Template component creation initiated - ');
                console.log(scope);

                if(deviceDetector.browser === 'ie')
                {

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
                    PerfectScrollbar.initialize($('#template-steps')[0], options);
                    PerfectScrollbar.destroy($('#main-content')[0]);
                }

                scope.loadMore = function()
                {
                    //commonBusiness.emitMsg('step-load-initiated');

                    var loadedIndex = parseInt(el.find('#btnLoadMore').attr('loadedIndex')),
                        components = [],
                        loadSize = clientConfig.appSettings.componentInitialLoad,
                        compSize = 0;

                    components.push.apply(components, templateBusiness.components.content);
                    components = components.splice(loadedIndex, _.size(components));

                    compSize = _.size(components);

                    if(compSize < clientConfig.appSettings.componentInitialLoad)
                    {
                        loadSize = compSize
                    }
                    bindComponent(scope, el, components, loadSize);

                    var newLoadedIndex = loadedIndex + loadSize;

                    if(_.size(templateBusiness.components.content) === newLoadedIndex)
                    {
                        scope.isLoadMoreDisabled = true;
                    }

                    el.find('#btnLoadMore').attr('loadedIndex', newLoadedIndex);
                };

                bindHeader(scope);
                var compCount = clientConfig.appSettings.componentInitialLoad,
                    compSize = _.size(scope.components.content);

                if(compSize < clientConfig.appSettings.componentInitialLoad)
                {
                    compCount = compSize;
                    scope.isLoadMoreDisabled = true;
                }
                bindComponent(scope, el, scope.components.content, compCount);
                el.find('#btnLoadMore').attr('loadedIndex', compCount);
            }

        };

        ///Bind header details for the component
        ///Header & Sub-Header
        function bindHeader(scope)
        {
            var header = templateBusiness.getComponentHeader();

            if(header){
                scope.stepName = header.name;
                scope.stepSubHeader = header.subheader;
            }
        }

        //Bind components
        function bindComponent(scope, el, contents, componentLoadCount)
        {
            if(contents) {
                var totalComponent = componentLoadCount;
                var currentComponent = 1;
                var isSkip = false;

                _.each(contents, function (renderContent) {



                    if (renderContent.header &&
                        renderContent.sections &&
                        renderContent.sections.length > 0 &&
                        !isSkip) {
                        var newScope = scope.$new(true);
                        newScope.tearheader = renderContent.header;
                        newScope.tearcontent = [];

                        _.each(renderContent.sections, function (section) {
                            newScope.isnoneditable = (section.type === 'nonEditableUnmark');
                            newScope.subtype = section.subtype || renderContent.header.subtype || '';

                            if (section.TearSheetItem &&
                                section.TearSheetItem.length) {
                                newScope.tearcontent.push.apply(newScope.tearcontent, section.TearSheetItem);
                            }
                            else if (section.TearSheetItem) {
                                newScope.tearcontent.push(section.TearSheetItem);
                            }
                            else if (section.Label) {
                                newScope.tearcontent.push(section);
                            }
                            else if (section.row || section.ItemId) {
                                newScope.tearcontent.push(section);
                            }
                        });

                        if (newScope.tearcontent) {
                            newScope.iscollapsible = true;
                            newScope.isprocesscomplete = true;
                            newScope.actions = [];
                            var isChartComp = false;

                            //Check for chart component
                            angular.forEach(newScope.tearcontent, function (each) {
                                if (each.id === 'ScrapedItem' && each.Mnemonic.indexOf('WU_STOCK_CHART') !== -1) {
                                    isChartComp = true;
                                    return;
                                }
                            });

                            var html = '',
                                isLastComponent = (currentComponent >= totalComponent);
                            if (isChartComp) {
                                html = '<ms-chart-component tearheader="tearheader" tearcontent="tearcontent" iscollapsible="iscollapsible" ' +
                                    'isnoneditable="isnoneditable" isprocesscomplete="isprocesscomplete"></ms-chart-component>';
                            } else {
                                html = '<ms-component tearheader="tearheader" tearcontent="tearcontent" iscollapsible="iscollapsible" ' +
                                    'isnoneditable="isnoneditable" isprocesscomplete="isprocesscomplete" actions="actions" ' +
                                    'subtype="' + newScope.subtype + '" islastcomponent="' + isLastComponent + '"></ms-component>';
                            }


                            el.find('#template-content').append($compile(html)(newScope));
                        }
                    }
                    else {

                        if(currentComponent >= totalComponent)
                        {
                            commonBusiness.emitMsg('step-load-completed');
                        }

                            switch (renderContent.id) {
                                case 'LinkItem':
                                    var newScope = scope.$new();
                                    var html = '<div layout-padding>';
                                    html += '<ms-link value="' + renderContent.Label + '" href="' + renderContent.url + '"></ms-link>';
                                    html += '</div>';
                                    el.find('#template-content').append($compile(html)(newScope));
                                    break;
                            }
                        }

                    if(currentComponent == totalComponent)
                    {
                        isSkip = true;
                    }


                    currentComponent++;
                });
            }
        }
    }
})();