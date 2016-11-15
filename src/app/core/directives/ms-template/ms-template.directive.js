(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('msTemplateController', msTemplateController)
        .directive('msTemplate', msTemplateDirective);

    function msTemplateController($rootScope, $scope, $mdMenu, $window,
                                  templateBusiness, commonBusiness, workupBusiness)
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
            templateBusiness.initializeMessages($scope);
            workupBusiness.renew(commonBusiness.userId, commonBusiness.projectId, commonBusiness.projectName, 'reload-steps');
            commonBusiness.onMsg('reload-steps', $scope, function(ev, data)
            {
                templateBusiness.updateNotification(parseInt(data.old_project_id), 'complete', 'Renewal',
                    parseInt(data.projectId), data.project_name);
            });

            //commonBusiness.onMsg('reload-steps', $scope, function()
            //{
            //    //$scope.refreshstep();
            //
            //});
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

        commonBusiness.onMsg('step-load-more', $scope, function() {
            $scope.loadMore();
        });
    }

    /** @ngInject */

    function msTemplateDirective($compile, $rootScope, templateBusiness, $mdDialog, dialog,
                                 commonBusiness, $interval, clientConfig)
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

                scope.loadMore = function()
                {

                    if(!scope.isLoadMoreDisabled) {


                        $mdDialog.show(
                            $mdDialog.alert({
                                clickOutsideToClose: true,
                                templateUrl: 'app/core/directives/ms-template/dialog/ms-template.dialog.html'
                            })
                        );

                       var comPromise = $interval(function(){//using $interval seems to work fine
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
                            var actualCompCount  = bindComponent(scope, el, components, loadSize);

                            var newLoadedIndex = loadedIndex + actualCompCount;

                            if(_.size(templateBusiness.components.content) === newLoadedIndex)
                            {
                                scope.isLoadMoreDisabled = true;
                            }

                            el.find('#btnLoadMore').attr('loadedIndex', newLoadedIndex);
                           $interval.cancel(comPromise);
                        }.bind(this), 10);


                    }


                };

                bindHeader(scope);
                var compCount = clientConfig.appSettings.componentInitialLoad,
                    compSize = getNumberOfComp(scope.components.content);

                if(compSize < compCount)
                {
                    compCount = compSize;
                    scope.isLoadMoreDisabled = true;
                }

                var actualCompCount = bindComponent(scope, el, scope.components.content, compCount);

                el.find('#btnLoadMore').attr('loadedIndex', actualCompCount);

                commonBusiness.onMsg('reached-page-bottom', scope, function(){
                    scope.loadMore();
                });
            }
        };

        ///Bind header details for the component
        ///Header & Sub-Header
        function bindHeader(scope)
        {
            var header = templateBusiness.getComponentHeader();

            if(header){
                scope.stepName = header.name;
                scope.stepSubHeader = header.subHeader;
            }
        }

        //Bind components
        function bindComponent(scope, el, contents, componentLoadCount)
        {
            if(contents) {
                var totalComponent = componentLoadCount;
                var currentComponent = 0;
                var isSkip = false;

                _.each(contents, function (renderContent) {

                    if(!isSkip)
                    {
                        if (renderContent.header &&
                            renderContent.sections &&
                            renderContent.sections.length > 0) {
                            var newScope = scope.$new(true);
                            newScope.tearheader = renderContent.header;
                            newScope.tearcontent = [];
                            newScope.subtype = null;
                            _.each(renderContent.sections, function (section) {
                                newScope.isnoneditable = (section.type === 'nonEditableUnmark');

                                if(!newScope.subtype) {
                                    newScope.subtype = section.subtype || renderContent.header.subtype || '';
                                }

                                if (section.TearSheetItem &&
                                    section.TearSheetItem.length) {
                                    newScope.tearcontent.push.apply(newScope.tearcontent, section.TearSheetItem);
                                }
                                else if (section.TearSheetItem) {
                                    if(newScope.subtype === 'SubComponent' && section.subtype) {
                                        section.TearSheetItem.subtype = section.subtype;
                                    }
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
                               _.each(newScope.tearcontent, function (each) {
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
                            switch (renderContent.id) {
                                case 'WU_RATIOS_CHART':
                                    var newScope = scope.$new();
                                    newScope.iscollapsible = true;
                                    newScope.isprocesscomplete = true;
                                    newScope.isnoneditable = (renderContent.type === 'nonEditableUnmark');
                                    newScope.tearheader = renderContent.row.col[0].TearSheetItem;
                                    newScope.tearcontent = [];
                                    newScope.tearcontent.push(renderContent.row.col[1].TearSheetItem);
                                    var html = '<ms-chart-component tearheader="tearheader" tearcontent="tearcontent" iscollapsible="iscollapsible" ' +
                                        'isnoneditable="isnoneditable" isprocesscomplete="isprocesscomplete"></ms-chart-component>';
                                    el.find('#template-content').append($compile(html)(newScope));
                                    break;
                                
                                case 'LinkItem':
                                    var newScope = scope.$new();
                                    var html = '<div layout-padding>';
                                    html += '<ms-link value="' + renderContent.Label + '" href="' + renderContent.url + '" gotostep="'+ renderContent.GoBack +'"></ms-link>';
                                    html += '</div>';
                                    el.find('#template-content').append($compile(html)(newScope));
                                    break;
                            }
                        }

                        currentComponent++;

                        if(currentComponent >= totalComponent)
                        {
                            isSkip = true;
                            commonBusiness.emitMsg('step-load-completed');
                        }
                    }
                });

                return currentComponent;
            }
        }

        function getNumberOfComp(contents)
        {
            var totalComp = 0;

            _.each(contents, function(content)
            {
                if (content.header &&
                    content.sections &&
                    content.sections.length > 0)
                {
                    totalComp++;
                }
            });

            return totalComp;
        }
    }
})();