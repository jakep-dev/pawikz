(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('msTemplateController', msTemplateController)
        .directive('msTemplate', msTemplateDirective);

    function msTemplateController($scope, $mdMenu, templateBusiness, commonBusiness, workupBusiness, $rootScope)
    {
        var vm = this;

        vm.isExpandAll = true;
		vm.isPrintableAll = commonBusiness.isPrintableAll;
        templateBusiness.isTemplateExpandAll = vm.isExpandAll;
        vm.saveAll = saveAll;
        vm.toggleExpand = toggleExpand;
		vm.printableAll = printableAll;
        vm.pdfExport = exportCharts;
        vm.renew = renew;
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

    function msTemplateDirective($compile, templateBusiness, dialog)
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
                //templateBusiness.showTemplateProgress();


                console.log('Template component creation initiated - ');
                console.log(scope);

                //Render the header for the step
                if(scope.components.header)
                {
                    scope.stepName = scope.components.header.label;
                    scope.stepSubHeader = scope.components.header.subheader || '';
                }

                //Render the content for the step
                if(scope.components.content)
                {
                    angular.forEach(scope.components.content, function(renderContent)
                    {
                        if(renderContent.header &&
                            renderContent.sections &&
                            renderContent.sections.length > 0)
                        {
                            var newScope = scope.$new(true);
                            newScope.tearheader = renderContent.header;
                            newScope.tearcontent = [];

                            _.each(renderContent.sections, function(section)
                            {
                                newScope.isnoneditable =  (section.type === 'nonEditableUnmark');
                                newScope.subtype = section.subtype || renderContent.header.subtype || '';

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
                                else if(section.row || section.ItemId)
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
                                        return;
                                    }
                                });

                                var html = '';
                                if(isChartComp)
                                {
                                     html = '<ms-chart-component tearheader="tearheader" tearcontent="tearcontent" iscollapsible="iscollapsible" isnoneditable="isnoneditable" isprocesscomplete="isprocesscomplete"></ms-chart-component>';
                                }else {
                                     html = '<ms-component tearheader="tearheader" tearcontent="tearcontent" iscollapsible="iscollapsible" ' +
                                         'isnoneditable="isnoneditable" isprocesscomplete="isprocesscomplete" actions="actions" subtype="' + newScope.subtype +'"></ms-component>';
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

                //templateBusiness.hideTemplateProgress();
            }
        };
    }
})();