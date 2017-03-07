(function() {
    'use strict';

    angular
        .module('app.core')
        .controller('msTemplateController', msTemplateController)
        .directive('msTemplate', msTemplateDirective);

    function msTemplateController($rootScope, $scope, $mdMenu, $window,
        commonBusiness, templateBusiness, templateBusinessSave, notificationBusiness, workupBusiness
    ) {
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
        function saveAll() {
            //Changed Date: 28/4/2016 as per Bug - Chart title not saving
            commonBusiness.emitMsg('saveAllChart');
            templateBusinessSave.save();
            $mdMenu.hide();
        }

        function pdfDownload() {

            templateBusiness.requestPdfDownload();
        }

        function renew() {
            notificationBusiness.initializeMessages($scope);
            workupBusiness.renew(commonBusiness.userId, parseInt(commonBusiness.projectId), commonBusiness.projectName, 'reload-steps');
        }


        //Toggle expand or collapse
        function toggleExpand() {
            vm.isExpandAll = !vm.isExpandAll;
            commonBusiness.isTemplateExpandAll = vm.isExpandAll;
            $mdMenu.hide();
        }

        function printableAll() {
            vm.isPrintableAll = !vm.isPrintableAll;
            commonBusiness.isPrintableAll = vm.isPrintableAll;
            $mdMenu.hide();
        }

        commonBusiness.onMsg('step-load-more', $scope, function() {
            $scope.loadMore();
        });
    }

    /** @ngInject */

    function msTemplateDirective($compile, $timeout,
        $interval, templateBusiness,
        commonBusiness) {
        return {
            restrict: 'E',
            scope: {
                components: '=',
                refreshstep: '='
            },
            controller: 'msTemplateController',
            controllerAs: 'vm',
            templateUrl: 'app/core/directives/ms-template/ms-template.html',
            link: function(scope, el, attrs) {
                //Storing the components for future load.
                templateBusiness.components = scope.components;
                scope.showLoadingBar = true;
                scope.isLoadMoreDisabled = false;
                scope.isCompLoaded = false;

                console.log('Template component creation initiated - ');
                console.log(scope);

                scope.loadMore = function() {
                    if (!scope.isLoadMoreDisabled) {
                        var comPromise = $interval(function() { //using $interval seems to work fine
                            var loadedIndex = parseInt(el.find('#btnLoadMore').attr('loadedIndex')),
                                components = [],
                                loadSize = templateBusiness.getCompInitialLoadCount(),
                                compSize = 0;

                            components.push.apply(components, templateBusiness.components.content);
                            components = components.splice(loadedIndex, _.size(components));
                            compSize = getNumberOfComp(components);

                            if (compSize < templateBusiness.getCompInitialLoadCount()) {
                                loadSize = compSize
                            }

                            var actualCompCount = bindComponent(scope, el, components, loadSize);
                            var newLoadedIndex = loadedIndex + actualCompCount;

                            if (_.size(templateBusiness.components.content) === newLoadedIndex) {
                                scope.isLoadMoreDisabled = true;
                            }

                            el.find('#btnLoadMore').attr('loadedIndex', newLoadedIndex);
                            $interval.cancel(comPromise);
                        }.bind(this), 10);
                    }
                };

                bindHeader(scope);
                var actualCompCount = bindComponent(scope, el, scope.components.content, actualCount(scope));
                el.find('#btnLoadMore').attr('loadedIndex', actualCompCount);

                commonBusiness.onMsg('reached-page-bottom', scope, function() {
                    scope.loadMore();
                });
            }
        };

        //Get the actual count details
        function actualCount(scope) {
            var compCount = templateBusiness.getCompInitialLoadCount(),
                compSize = getNumberOfComp(scope.components.content);

            if (compSize < compCount) {
                compCount = compSize;
                scope.isLoadMoreDisabled = true;
            }
            return compCount;
        }

        ///Bind header details for the component
        ///Header & Sub-Header
        function bindHeader(scope) {
            var header = templateBusiness.getComponentHeader();

            if (header) {
                scope.stepName = header.name;
                scope.stepSubHeader = header.subHeader;
            }
        }

        //Bind components
        function bindComponent(scope, el, contents, componentLoadCount) {
            if (contents) {
                var totalComponent = componentLoadCount,
                    currentComponent = 0,
                    isSkip = false,
                    count = 0,
                    bindHtml = [];

                _.each(contents, function(renderContent) {
                    if (!isSkip) {
                        count++;
                        if (renderContent.header &&
                            renderContent.sections &&
                            renderContent.sections.length > 0) {
                            var newScope = scope.$new(true);
                            newScope.tearheader = renderContent.header;
                            newScope.tearcontent = [];
                            newScope.subtype = null;
                            _.each(renderContent.sections, function(section) {
                                newScope.isnoneditable = (section.type === 'nonEditableUnmark');

                                if (!newScope.subtype) {
                                    newScope.subtype = section.subtype || renderContent.header.subtype || '';
                                }

                                if (section.TearSheetItem &&
                                    section.TearSheetItem.length) {
                                    newScope.tearcontent.push(section);
                                } else if (section.TearSheetItem) {
                                    if (newScope.subtype === 'SubComponent' && section.subtype) {
                                        section.TearSheetItem.subtype = section.subtype;
                                    }
                                    newScope.tearcontent.push(section);
                                } else if (section.Label) {
                                    newScope.tearcontent.push(section);
                                } else if (section.row || section.ItemId) {
                                    newScope.tearcontent.push(section);
                                }
                            });
                            if (newScope.tearcontent) {
                                newScope.iscollapsible = true;
                                newScope.isprocesscomplete = true;
                                newScope.actions = [];
                                var isChartComp = false;

                                //Check for chart component
                                _.each(newScope.tearcontent, function(each) {
                                    var tearSheet = each.TearSheetItem;
                                    if (tearSheet &&
                                        tearSheet.id === 'ScrapedItem' &&
                                        tearSheet.Mnemonic.indexOf('WU_STOCK_CHART') !== -1) {
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

                                bindHtml.push({
                                    content: $compile(html)(newScope)
                                });
                                currentComponent++;
                            }
                        } else {
                            switch (renderContent.subtype || renderContent.id) {
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
                                    bindHtml.push({
                                        content: $compile(html)(newScope)
                                    });
                                    currentComponent++;
                                    break;

                                case 'LinkItem':
                                    var newScope = scope.$new();
                                    var html = '<div layout-padding>';

                                    html += '<ms-link value="' + renderContent.Label + '" href="' + renderContent.url + '" gotostep="' + renderContent.GoBack + '"></ms-link>';
                                    html += '</div>';
                                    bindHtml.push({
                                        content: $compile(html)(newScope)
                                    });
                                    currentComponent++;
                                    break;

                                case 'AdvisenNewsSearch':
                                    var newScope = scope.$new();
                                    newScope.isprocesscomplete = true;
                                    var html = '';
                                    var searchName = renderContent.SearchName || '';
                                    html += '<ms-news title="' + templateBusiness.getNewsHeader(renderContent) + '" search-name="' + searchName + '" isprocesscomplete="isprocesscomplete"></ms-news>';
                                    html += '</div>';
                                    bindHtml.push({
                                        content: $compile(html)(newScope)
                                    });
                                    currentComponent++;
                                    break;
                            }
                        }
                        if (currentComponent > totalComponent) {
                            isSkip = true;
                        }
                    }
                });

                if (bindHtml && bindHtml.length > 0) {

                    $timeout(function(){
                        var element = el.find('#template-content');
                        _.each(bindHtml, function(html) {
                            element.append(html.content);
                        });
                        scope.isCompLoaded = true;
                    }, 0);
                }

                return count;
            }
        }

        function getNumberOfComp(contents) {
            var totalComp = 0;

            _.each(contents, function(content) {
                if (content.header &&
                    content.sections &&
                    content.sections.length > 0) {
                    //counting standard components with headers and child components
                    //for example stock charts, all table types, large text boxes
                    totalComp++;
                } else if (content.ItemId && content.Mnemonic && (content.subtype || content.id)) {
                    //counting WU_RATIOS_CHARTS, LinkItem, AdvisenNewsSearch
                    totalComp++;
                }
            });

            return totalComp;
        }
    }
})();