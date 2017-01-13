/**
 * Created by sherindharmarajan on 1/19/16.
 */
(function() {
    'use strict';

    angular
        .module('app.template.business', [])
        .service('templateBusiness', templateBusiness);

    /* @ngInject */
    function templateBusiness($rootScope, $interval, $filter, $window, $sce, $mdToast,
                              Papa, dialog, store, deviceDetector, toast, 
                              clientConfig, commonBusiness, stepsBusiness, notificationBusiness, overviewBusiness,
                              templateService, stockService, financialChartService
                             ) {
        var business = {
           mnemonics: null,
           saveMnemonics: [],
		   saveTableMnemonics: [],
		   saveHybridTableMnemonics: [],
           programTableMnemonics: [],
		   //saveInteractiveStockChartMnemonics: [],
		   //saveSignificantDevelopmentMnemonics: [],
		   //saveInteractiveFinancialChartMnemonics: [],
           autoSavePromise: [],
           isExpandAll: false,
           componentStatus: [],
           components:[],
           remainingComponentCount: 0,
           save: save,
           saveTable: saveTable,
           saveHybridTable: saveHybridTable,
           //saveInteractiveStockCharts: saveInteractiveStockCharts,
           //saveSignificantDevelopmentItems: saveSignificantDevelopmentItems,
           //saveInteractiveFinancialCharts: saveInteractiveFinancialCharts,
           cancelPromise: cancelPromise,
           getMnemonicValue: getMnemonicValue,
           getTemplateElement: getTemplateElement,
           getReadyForAutoSave: getReadyForAutoSave,
		   getReayForAutoSaveTableLayout: getReayForAutoSaveTableLayout,
		   getReayForAutoSaveHybridTable: getReayForAutoSaveHybridTable,
		   //getReadyForAutoSaveInteractiveStockChart: getReadyForAutoSaveInteractiveStockChart,
		   //getReadyForAutoSaveSignificantDevelopmentItem: getReadyForAutoSaveSignificantDevelopmentItem,
		   //getReadyForAutoSaveInteractiveFinancialChart: getReadyForAutoSaveInteractiveFinancialChart,
           getTableLayoutMnemonicValue: getTableLayoutMnemonicValue,
           getEvalMnemonicValue: getEvalMnemonicValue,
           getNewItemId: getNewItemId,
           getCopyItemId: getCopyItemId,
           updateMnemonicValue: updateMnemonicValue,
           showPrintIcon:  showPrintIcon,
           getPrintableValue: getPrintableValue,
           calculateProgramRate: calculateProgramRate,
           calculateProgramRol: calculateProgramRol,
           calculateProgramAtt: calculateProgramAtt,
           parseCsvToJson: parseCsvToJson,
           unParseJsonToCsv: unParseJsonToCsv,
           isKMBValue: isKMBValue,
           transformKMB: transformKMB,
           buildComponents: buildComponents,
           buildExpiringProgram: buildExpiringProgram,
           buildProposedProgram: buildProposedProgram,
           buildExpiringProgramHybrid: buildExpiringProgramHybrid,
           buildProposedProgramHybrid: buildProposedProgramHybrid,
           buildLabel: buildLabel,
           buildGenericTableItem: buildGenericTableItem,
           buildRichTextArea: buildRichTextArea,
           buildScrapeItem: buildScrapeItem,
           buildMessage: buildMessage,
           determineTableLayout: determineTableLayout,
           getSubComponents: getSubComponents,
           buildSubComponent: buildSubComponent,
           showTemplateProgress: showTemplateProgress,
           hideTemplateProgress: hideTemplateProgress,
           requestPdfDownload: requestPdfDownload,
           downloadTemplatePdf:downloadTemplatePdf,
           pushComponentStatus: pushComponentStatus,
		   getTableLayoutSubMnemonics: getTableLayoutSubMnemonics,
		   getMnemonicPostfix: getMnemonicPostfix,
		   getMnemonicParameters: getMnemonicParameters,
		   getMnemonicPrecision: getMnemonicPrecision,
		   getMnemonicDataType: getMnemonicDataType,
		   getMnemonicDataSubtype: getMnemonicDataSubtype,
		   formatData: formatData,
		   removeFormatData: removeFormatData,
           removeCommaValue: removeCommaValue,
           numberWithCommas: numberWithCommas,
		   parenthesisForNegative: parenthesisForNegative,
		   removeParenthesis: removeParenthesis,
		   formatDate: formatDate,
		   parseDate: parseDate,
           loadComponents: loadComponents,
           getComponentHeader: getComponentHeader,
		   isMnemonicNumberType: isMnemonicNumberType,
           getTearSheetItems: getTearSheetItems,
           getCompInitialLoadCount: getCompInitialLoadCount,
           updateProgramTableMnemonics: updateProgramTableMnemonics
        };

        return business;

        function getCompInitialLoadCount() {
            var compCount = clientConfig.appSettings.compInitialLoadForDesktop;
            if (deviceDetector.isMobile()) {
                compCount = clientConfig.appSettings.compInitialLoadForMobile;
            }
            else if (deviceDetector.isTablet()) {
                compCount = clientConfig.appSettings.compInitialLoadForTablet;
            }
            else if (deviceDetector.browser ==='ie')
            {
                compCount = clientConfig.appSettings.compInitialLoadForDesktopIE;
            }
            return compCount;
        }

        ///Get the component header details
        function getComponentHeader()
        {
            var header = {
                name: '',
                subHeader: ''
            };

            if(business.components.header)
            {
                header.name = business.components.header.label;
                header.subHeader = business.components.header.subheader || '';
            }

            return header;
        }

        function loadComponents()
        {

        }

        function pushComponentStatus(id, status)
        {
            if(business.componentStatus)
            {
                var component = _.find(business.componentStatus, function(component)
                {
                   if(component.id === id)
                   {
                       return component;
                   }
                });

                if(component)
                {
                    component.isLoaded = status;
                }
                else {
                    business.componentStatus.push({
                       id: id,
                        isLoaded: status
                    });
                }
            }
        }

        //Download template pdf
        function downloadTemplatePdf(requestId, workupName)
        {
            var pdfName = workupName.concat('.pdf');

            templateService.downloadTemplatePdf(requestId, pdfName).then(function (data) {

                //uses the browser specific Blob object
                var blob = new Blob([data.data], { type: 'application/octet-stream' });

                //get browser dependent url builder for Blob object
                var url = $window.URL || $window.webkitURL || $window.mozURL;

                var objectUrl = $sce.trustAsResourceUrl(url.createObjectURL(blob));

                var anchor = $('#backgroundLink')[0];
                anchor.download = pdfName;

                //For IE 10+
                if (window.navigator.msSaveOrOpenBlob) {
                    window.navigator.msSaveOrOpenBlob(blob, pdfName);
                } else {
                    //For Chrome, Firefox, Safari
                    anchor.href = objectUrl;
                    anchor.click();
                }
            });
        }

        function requestPdfDownload()
        {
            var inProgressNotification = _.find(notificationBusiness.notifications, function (notification) {
                if(notification.type === 'PDF-Download' &&
                    notification.status === 'in-process')
                {
                 return notification;
                }
            });

            if (inProgressNotification) {
                toast.simpleToast("PDF Download is in-progress. Please try after the PDF Download is complete");
                return null;
            }

            var userDetails = store.get('user-info'),
                userName = '',
                userId = null;

            if (userDetails) {
                userName = userDetails.fullName;
                userId = userDetails.userId;


                var notification = _.find(notificationBusiness.notifications, function (not)
                {
                    if(not.id === commonBusiness.projectId &&
                        not.type === 'PDF-Download')
                    {
                        return not;
                    }
                });

                if(notification)
                {
                    notification.disabled = true;
                    notification.progress = 0;
                    notification.status = 'in-process';
                    notification.requestId = 0;
                }
                else {
                    notificationBusiness.notifications.push(notificationBusiness.addNotification(commonBusiness.projectId, commonBusiness.projectName, 'PDF-Download',
                        'icon-file-pdf-box', 0, true, '', 'in-process', userId.toString(), true, 0));
                }

                templateService.createTemplatePdfRequest(commonBusiness.projectId, userId,
                                                         commonBusiness.projectName,
                                                         commonBusiness.companyName, userName)
                    .then(function (data) {

                        var notification = _.find(notificationBusiness.notifications, function (not)
                        {
                            if(not.id === commonBusiness.projectId &&
                                not.type === 'PDF-Download')
                            {
                                return not;
                            }
                        });

                        if (!data) {
                            if (notification) {
                                notification.status = 'error';
                                notification.progress = 100;
                                notification.disabled = false;
                            }
                            toast.simpleToast("Issue with PDF Download. Please try again.");
                        } else if (data && data.errorMessages &&
                            data.errorMessages.length > 0) {
                            if(notification)
                            {
                                notification.status = 'error';
                                notification.progress = 100;
                                notification.disabled = false;
                            }
                            toast.simpleToast("Issue with PDF Download. Please try again.");
                        } else {
                            if(notification)
                            {
                                notification.requestId = data.requestId;
                            }
                            dialog.notify('Pdf Download', 'Go to Notification Center ',
                                '<md-icon md-font-icon="icon-bell"></md-icon> <span> to download.</span>',
                                null, null, null, false);
                        }
                    });
            }
        }


        function showTemplateProgress()
        {
            dialog.status('app/core/directives/ms-template/dialog/ms-template.dialog.html', false, false);
        }

        function hideTemplateProgress()
        {
            dialog.close();
        }

        function buildSubComponent(scope, component)
        {
            var newScope = scope.$new(true),
                comp = {
                    html: '',
                    scope: null
                };

            newScope.tearheader = component.header;
            newScope.tearcontent = [];
            newScope.iscollapsible = true;

            if(component.section.length) {
                newScope.tearcontent.push.apply(newScope.tearcontent, component.section);
            }
            else{
                newScope.tearcontent.push(component.section);
            }

            newScope.isnoneditable = scope.isnoneditable;
            newScope.isprocesscomplete = true;
            newScope.actions = [];
            newScope.subtype = component.section.subtype || '';
            var isLastComponent = false;
            newScope.itemid = component.section.ItemId || component.header.itemid;

            comp.html = '<div><ms-component tearheader="tearheader" tearcontent="tearcontent" iscollapsible="iscollapsible" ' +
                'isnoneditable="isnoneditable" isprocesscomplete="isprocesscomplete" actions="actions" ' +
                'subtype="' + newScope.subtype + '" islastcomponent="' + isLastComponent + '"></ms-component> <div style="min-height: 5px"></div> </div>';
            comp.scope = newScope;

            return comp;
        }

        ///Get the sub-component for financial step
        //Get the same structure to hold header and section.
        function getSubComponents(contents)
        {
            var components = [],
                component = {
                    header: null,
                    section: null
                };

            _.each(contents, function(content)
            {
                var tearSheet;
                if(content.TearSheetItem &&
                   !content.TearSheetItem.length) {
                    tearSheet = content.TearSheetItem;
                }
                else {
                    tearSheet = content;
                }

                if(tearSheet.id === 'LabelItem') {
                    component.header = tearSheet;
                }
                else {
                    component.section = tearSheet;
                    //If the Label Item followed by section pattern is not found.
                    //Which means that its a stand-alone section.
                    if(!component.header) {
                        components.push(component);
                        component = {
                            header: null,
                            section: null
                        };
                    }
                }

                if(component.header &&
                    component.section) {
                    components.push(component);
                    component = {
                        header: null,
                        section: null
                    };
                }
            });

            return components;
        }

        function buildComponents(scope, content, subtype)
        {
            var tearSheet = content.TearSheetItem || content,
                type = subtype || tearSheet.id;

            switch(type.toLowerCase())
            {
                case 'labelitem':
                    return buildLabel(scope, tearSheet);
                    break;

                case 'generictableitem':
                    return buildGenericTableItem(scope, tearSheet);
                    break;

                case 'rtftextareaitem':
                    return buildRichTextArea(scope, tearSheet);
                    break;

                case 'scrapeditem':
                    return buildScrapeItem(scope, tearSheet);
                    break;

                case 'expiring':
                    return buildExpiringProgram(scope, scope.tearheader, tearSheet);
                    break;

                case 'proposed':
                    return buildProposedProgram(scope, scope.tearheader, tearSheet);
                    break;

                case 'expiringhybrid':
                    return buildExpiringProgramHybrid(scope, scope.tearheader, tearSheet);
                    break;

                case 'proposedhybrid':
                    return buildProposedProgramHybrid(scope, scope.tearheader, tearSheet);
                    break;

                case 'linkitem':
                    return buildLinkItem(scope, tearSheet);
                    break;

                case 'tablelayout':
                    scope.tearcontent = [];
                    scope.tearcontent.push(tearSheet);
                    return determineTableLayout(scope, tearSheet, tearSheet.subtype);
                    break;
            }
        }

        ///Build filter table layout element
        function buildFilterTableLayout(scope, itemId, mnemonicId, header, columns)
        {
            var newScope  = scope.$new(true),
                comp = {
                    html: '',
                    scope: null
                };

            newScope.itemid = itemId;
            newScope.mnemonicid = mnemonicId;
            newScope.tearsheet = {
                header: header,
                columns: columns
            };

            comp.html = '<ms-tablelayout-f itemid="'+newScope.itemid+'" mnemonicid="'+newScope.mnemonicid+'" tearsheet="tearsheet"></ms-tablelayout-f>';
            comp.scope = newScope;

            return comp;
        }

        ///Build read-only table layout element
        function buildReadOnlyTableLayout(scope, itemId, mnemonicId, header, columns)
        {
            var newScope  = scope.$new(true),
                comp = {
                    html: '',
                    scope: null
                };

            newScope.itemid = itemId;
            newScope.mnemonicid = mnemonicId;

            newScope.tearsheet = {
                header: header,
                columns: columns
            };

            comp.html = '<ms-tablelayout-r itemid="'+newScope.itemid+'" mnemonicid="'+newScope.mnemonicid+'" tearsheet="tearsheet" iseditable="true" isfulloption="false"></ms-tablelayout-r>';
            comp.scope = newScope;

            return comp;
        }

        //Build read-only pivot table layout element
        function buildReadOnlyPivotTableLayout(scope, itemId, mnemonicId, header, columns, footer)
        {
            var newScope  = scope.$new(true),
                comp = {
                    html: '',
                    scope: null
                };

            newScope.itemid = itemId;
            newScope.mnemonicid = mnemonicId;

            newScope.tearsheet = {
                header: header,
                columns: columns,
                footer: footer
            };

            comp.html = '<ms-tablelayout-r-p itemid="'+newScope.itemid+'" mnemonicid="'+newScope.mnemonicid+'" tearsheet="tearsheet" iseditable="true" isfulloption="false"></ms-tablelayout-r-p>';
            comp.scope = newScope;

            return comp;
        }

        ///Build edit table layout element
        function buildEditTableLayout(scope, content, header, columns)
        {
            var newScope  = scope.$new(true),
                comp = {
                    html: '',
                    scope: null
                };

            newScope.itemid = content.ItemId;
            newScope.mnemonicid = content.Mnemonic;

            newScope.tearsheet = {
                header: header,
                columns: columns
            };

            comp.html = '<ms-tablelayout-e itemid="'+newScope.itemid+'" mnemonicid="'+newScope.mnemonicid+'" tearsheet="tearsheet" isfulloption="false"></ms-tablelayout-e>';
            comp.scope = newScope;

            return comp;
        }

        ///Build hybrid table layout element
        function buildHybridTableLayout(scope, itemId, mnemonicId, header, columns, footer)
        {
            var newScope  = scope.$new(true),
                comp = {
                    html: '',
                    scope: null
                };

            newScope.itemid = itemId;
            newScope.mnemonicid = mnemonicId;

            newScope.tearsheet = {
                header: header,
				footer: footer,
                columns: columns
            };

            comp.html = '<ms-tablelayout-h itemid="'+newScope.itemid+'" mnemonicid="'+newScope.mnemonicid+'" tearsheet="tearsheet"></ms-tablelayout-h>';
            comp.scope = newScope;

            return comp;
        }

        function determineTableLayout(scope, content, subtype)
        {
            var tableLayout = {
                header: null,
                row: null,
                itemId: null,
                mnemonicId: null
            };

            switch (subtype.toLowerCase())
            {
                case 'tablelayout1':
                    //ReadOnly Table
                    tableLayout = getHeaderAndColumnsForTableLayout1(scope.tearcontent);
                    return buildReadOnlyTableLayout(scope, tableLayout.itemId, tableLayout.mnemonicId, tableLayout.header, tableLayout.row);
                    break;

                case 'tablelayout2':
                    //Filter Table
                    tableLayout = getHeaderAndColumnsForTableLayout2(scope.tearcontent);
                    return buildFilterTableLayout(scope, tableLayout.itemId, tableLayout.mnemonicId, tableLayout.header, tableLayout.row);
                    break;

                case 'tablelayout3':
                    //ReadOnly-Pivot Table
                    tableLayout = getHeaderAndColumnsForTableLayout3(scope.tearcontent);
                    return buildReadOnlyPivotTableLayout(scope, tableLayout.itemId, tableLayout.mnemonicId, tableLayout.header, tableLayout.row, tableLayout.footer);
                    break;

                case 'tablelayout4':
                    tableLayout = getHeaderAndColumnsForTableLayout4(scope.tearcontent);
                    return buildHybridTableLayout(scope, tableLayout.itemId, tableLayout.mnemonicId, tableLayout.header, tableLayout.row, tableLayout.footer);
                    //Hybrid Table
                    break;

                case 'tablelayout5':
                    tableLayout = getHeaderAndColumnsForTableLayout5(scope.tearcontent);
                    return buildFilterTableLayout(scope, tableLayout.itemId, tableLayout.mnemonicId, tableLayout.header, tableLayout.row);
                    break;

                case 'tablelayout6':
                    tableLayout = getHeaderAndColumnsForTableLayout6(scope.tearcontent);
                    return buildHybridTableLayout(scope, tableLayout.itemId, tableLayout.mnemonicId, tableLayout.header, tableLayout.row);
                    break;
            }

            return null;
        }

        //Get TearSheet Items
        function getTearSheetItems(tearcontent)
        {
            var tearSheets = [],
                content;

            if(tearcontent && tearcontent.length === 1) {
                content = tearcontent[0];

                if (content.TearSheetItem) {
                    if (content.TearSheetItem.length) {
                        tearSheets.push.apply(tearSheets, content.TearSheetItem)
                    }
                    else {
                        tearSheets.push(content.TearSheetItem);
                    }
                }
                else {
                    tearSheets.push(content);
                }
            }
            else{
                tearSheets.push.apply(tearSheets, tearcontent);
            }

            return tearSheets;
        }

        //Get header and columns for table layout 1
        function getHeaderAndColumnsForTableLayout1(tearcontent)
        {
            var tableLayout = {
                header: null,
                row: null,
                itemId: null,
                mnemonicId: null
            },
            tearSheets = getTearSheetItems(tearcontent);

            _.each(tearSheets, function(content)
            {
                if(content.id === 'GenericTableItem')
                {
                    tableLayout.header = content.row;
                }
                else if(content.id === 'TableLayOut')
                {
                    tableLayout.row = content.TableRowTemplate.row;
                    tableLayout.itemId = content.ItemId;
                    tableLayout.mnemonicId = content.Mnemonic;
                }
            });

            return tableLayout;
        }

        //Get header and columns for table layout 2
        function getHeaderAndColumnsForTableLayout2(tearcontent)
        {
            var tableLayout = {
                    header: null,
                    row: null,
                    itemId: null,
                    mnemonicId: null
            },
            tearSheets = getTearSheetItems(tearcontent);

            _.each(tearSheets, function(content)
            {
                if(content.id === 'GenericTableItem')
                {
                    tableLayout.header = content.row;
                }
                else if(content.id === 'TableLayOut')
                {
                    tableLayout.row = content.TableRowTemplate.row;
                    tableLayout.itemId = content.ItemId;
                    tableLayout.mnemonicId = content.Mnemonic;
                }
            });

            return tableLayout;
        }

        //Get header and columns for table layout 3
        function getHeaderAndColumnsForTableLayout3(tearcontent)
        {
            var tableLayout = {
                itemId: null,
                mnemonicId: null,
                header: null,
                row: null,
                footer: null
            },
            tearSheets = getTearSheetItems(tearcontent);

            _.each(tearSheets, function(content)
            {
                if(content.id) {
                    switch (content.id.toLowerCase()) {
                        case 'tablelayout':
                            tableLayout.itemId = content.ItemId;
                            tableLayout.mnemonicId = content.Mnemonic;
                            if (content.TableRowTemplate.row.length) {
                                tableLayout.row = content.TableRowTemplate.row;
                            }
                            else {
                                tableLayout.row = [];
                                tableLayout.row.push(content.TableRowTemplate.row);
                            }
                            break;

                        case 'labelitem':
                            tableLayout.footer = content.Label;
                            break;
                    }
                }
            });

            return tableLayout;
        }

        //Get header and columns for table layout 4
        //Need to display the generic table item also.
        function getHeaderAndColumnsForTableLayout4(tearcontent)
        {
            var tableLayout = {
                    header: null,
                    row: null,
                    itemId: null,
                    mnemonicId: null
            },
            tearSheets = getTearSheetItems(tearcontent);

            _.each(tearSheets, function(content)
            {
                if(content.id === 'TableLayOut')
                {
                    tableLayout.header = content.HeaderRowTemplate;
                    tableLayout.row = content.TableRowTemplate.row;
                    tableLayout.itemId = content.ItemId;
                    tableLayout.mnemonicId = content.Mnemonic;
                }
				
				if(content.id === 'GenericTableItem')
				{
					tableLayout.footer = content.row;
				}
            });

            return tableLayout;
        }

        //Get header and columns for table layout 5
        function getHeaderAndColumnsForTableLayout5(tearcontent)
        {
            var tableLayout = {
                header: null,
                row: null,
                itemId: null,
                mnemonicId: null
            },
            tearSheets = getTearSheetItems(tearcontent);

            _.each(tearSheets, function(content)
            {
                if(content.id === 'TableLayOut')
                {
                    tableLayout.row = content.TableRowTemplate.row;
                    tableLayout.itemId = content.ItemId;
                    tableLayout.mnemonicId = content.Mnemonic;
                }
            });

            return tableLayout;
        }

        //Get header and columns for table layout 6
        function getHeaderAndColumnsForTableLayout6(tearcontent)
        {
            var tableLayout = {
                header: null,
                row: null
            },
            tearSheets = getTearSheetItems(tearcontent);

            _.each(tearSheets, function(content)
            {
                if(content.id === 'TableLayOut')
                {
                    tableLayout.header = content.VerticalRow.row;
                    tableLayout.row = content.TableRowTemplate.row;
                    tableLayout.itemId = content.ItemId;
                    tableLayout.mnemonicId = content.Mnemonic;
                }
            });

            return tableLayout;
        }

        //Build label element
        function buildLabel(scope, content)
        {
            var comp = {
                html: '',
                scope: null
            },
            newScope  = scope.$new(),
            html = '';

            newScope.tearsheet = {
                value: content.Label,
                type: 'header3'
            };

            comp.html = '<ms-header tearsheet="tearsheet"></ms-header>';
            comp.scope = newScope;

            return comp;
        }

        //Build generic table item
        function buildGenericTableItem(scope, content)
        {
            var newScope  = scope.$new(),
                comp = {
                html: '',
                scope: null
            };

            newScope.tearsheet = {
                rows: content.row
            };

            newScope.isnoneditable = scope.isnoneditable;
            comp.html = '<ms-generic-table tearsheet="tearsheet" isnoneditable="isnoneditable"></ms-generic-table>';
            comp.scope = newScope;

            return comp;
        }

        //Build rich text-area element
        function buildRichTextArea(scope, content)
        {
            var itemId = content.ItemId,
                mnemonicId = content.Mnemonic,
                prompt = '',
                answer = '',
                comp = {
                    html: '',
                    scope: null
                },
                value = getMnemonicValueNoEscape(itemId, mnemonicId);

            if(content.prompt &&
                typeof(content.prompt) !== 'object')
            {
                prompt = content.prompt;
            }

            if(content.answer &&
                typeof(content.answer) !== 'object')
            {
                answer = content.answer;
            }

            var newScope  = scope.$new(true);
            newScope.itemid = itemId;
            newScope.mnemonicid = mnemonicId;
            newScope.prompt = prompt;
            newScope.value = _.escape(value);
            newScope.isdisabled = false;
            newScope.answer = answer;


            comp.html = '<ms-rich-text-editor itemid="'+ newScope.itemid + '" ' +
                'mnemonicid="' + newScope.mnemonicid + '" prompt="' + newScope.prompt + '" ' +
                'value="' + newScope.value + '" isdisabled="false" answer="' + newScope.answer + '"></ms-rich-text-editor>';
            comp.scope = newScope;

            return comp;
        }

        ///Build scrape item
        function buildScrapeItem(scope, content)
        {
            var newScope  = scope.$new(),
                mnemonicid = content.Mnemonic,
                itemid = content.ItemId,
                comp = {
                    html: '',
                    scope: null
                };

            if(mnemonicid !== 'SEC_PARSE')
            {
              newScope.mnemonicid = mnemonicid;
              newScope.itemid = itemid;

              comp.html = '<ms-scrape mnemonicid="' + newScope.mnemonicid + '" itemid="' + newScope.itemid + '"></ms-scrape>';
              comp.scope = newScope;
            }

            return comp;
        }

        //Build message element
        function buildMessage(text)
        {
            return '<ms-message message="'+ text +'"></ms-message>';
        }

        ///Build expiring program element
        function buildExpiringProgram(scope, tearheader, content)
        {
            var comp = {
              html: '',
              scope: null
            };
            var newScope  = scope.$new(true);
            newScope.tearsheet = null;
            newScope.isnoneditable = scope.isnoneditable;
            newScope.copyproposed = null;

            if(tearheader)
            {
                newScope.copyproposed =  tearheader.copyproposed || null;
            }

            newScope.tearsheet = content;
            comp.html += '<ms-expiring tearsheet="tearsheet" copyproposed="'+ newScope.copyproposed +'" isnoneditable="isnoneditable"></ms-expiring>';
            comp.scope = newScope;

            return comp;
        }

        ///Build proposed program element
        function buildProposedProgram(scope, tearheader, content)
        {
            var comp = {
                html: '',
                scope: null
            };
            var newScope  = scope.$new(true);
            newScope.tearsheet = null;
            newScope.isnoneditable = scope.isnoneditable;
            newScope.copyexpiring = null;

            if(tearheader)
            {
                newScope.copyexpiring =  tearheader.copyexpiring || null;
            }

            newScope.tearsheet = content;
            comp.html += '<ms-proposed tearsheet="tearsheet" copyexpiring="'+ newScope.copyexpiring +'"  isnoneditable="isnoneditable"></ms-proposed>';
            comp.scope = newScope;

            return comp;
        }
        
        function buildExpiringProgramHybrid(scope, tearheader, content)
        {
            var comp = {
              html: '',
              scope: null
            };
            var newScope  = scope.$new(true);
            newScope.isnoneditable = scope.isnoneditable;
            newScope.copyproposed = null;
            newScope.copyStepId = null;
            newScope.tearsheet = {
                header: null,
                rows: null
            }

            if(content)
            {
                newScope.copyproposed = content.copyProposedTable || null;
                newScope.copyStepId = content.copyStepId || '';
            }

            if(content && content.HeaderRowTemplate && content.HeaderRowTemplate.Headers) {
                newScope.tearsheet.header = content.HeaderRowTemplate.Headers;
            }

            if(content && content.TableRowTemplate && content.TableRowTemplate.row) {
                newScope.tearsheet.rows = content.TableRowTemplate.row;
            }
            
            comp.html += '<ms-expiring-h tearsheet="tearsheet" mnemonic="'+content.Mnemonic+'" item-id="'+content.ItemId+'" copyproposed="'+ newScope.copyproposed +'" copstepid="'+ newScope.copyStepId +'" isnoneditable="isnoneditable"></ms-expiring-h>';
            comp.scope = newScope;

            return comp;
        }

        function buildProposedProgramHybrid(scope, tearheader, content)
        {
            var comp = {
                html: '',
                scope: null
            };
            var newScope  = scope.$new(true);
            newScope.tearsheet = null;
            newScope.isnoneditable = scope.isnoneditable;
            newScope.copyexpiring = null;
            content.copyStepId = null;
            newScope.tearsheet = {
                header: null,
                rows: null
            }

            if(content)
            {
                newScope.copyexpiring =  content.copyExpiringTable || null;
                newScope.copyStepId = content.copyStepId || '';
            }

            if(content && content.HeaderRowTemplate && content.HeaderRowTemplate.Headers) {
                newScope.tearsheet.header = content.HeaderRowTemplate.Headers;
            }

            if(content && content.TableRowTemplate && content.TableRowTemplate.row) {
                newScope.tearsheet.rows = content.TableRowTemplate.row;
            }

            comp.html += '<ms-proposed-h tearsheet="tearsheet" mnemonic="'+content.Mnemonic+'" item-id="'+content.ItemId+'" copyexpiring="'+ newScope.copyexpiring +'"  copystepid="'+ newScope.copyStepId +'" isnoneditable="isnoneditable"></ms-proposed-h>';
            comp.scope = newScope;

            return comp;
        }

        //Build the link item components
        function buildLinkItem(scope, content)
        {
            var comp = {
                html: '',
                scope: scope
            };

            comp.html = '<div layout-padding>';
            comp.html += '<ms-link value="' + content.Label + '" href="' + content.url + '" gotostep="'+ content.GoBack +'"></ms-link>';
            comp.html += '</div>';

            return comp;
        }


        function unParseJsonToCsv(json)
        {
            return Papa.unparse(json, {
                quotes: false,
                delimiter: ",",
                newline: "\r\n"
            });
        }

        function parseCsvToJson(file, callBack, $scope)
        {
            if(file)
            {
                Papa.parse(file, {
                    delimiter: "",	// auto-detect
                    newline: "",	// auto-detect
                    header: false,
                    dynamicTyping: false,
                    preview: 0,
                    encoding: "",
                    worker: false,
                    comments: false,
                    step: undefined,
                    complete: function(data)
                    {
                        callBack(data, $scope);
                    },
                    error: undefined,
                    download: false,
                    skipEmptyLines: true,
                    chunk: undefined,
                    fastMode: undefined,
                    beforeFirstChunk: undefined,
                    withCredentials: undefined
                });
            }
        }

        function isKMBValue(inputVal) 
        {
            var regEx = /^\-?[0-9]+\.?[0-9]*[kKmMbB]$/;
            if (regEx.test(inputVal))
            {
                return true;
            }
            else
            {
                return false;
            }
        }

        //Test if inputVal is kmb value if so convert the inputVal and format the value with comma and truncate the number
        //Otherwise return inputVal unchanged
        function transformKMB(inputVal)
        {

            var finalValue = '';
            if(inputVal) {
                finalValue = inputVal;

                if (isKMBValue(inputVal)) {
                    var abbreviationType = inputVal.slice(-1);
                    var longValue = Number(inputVal.substring(0, inputVal.length - 1));
                    if (longValue && (!isNaN(longValue)) )
                    {
                        switch (abbreviationType)
                        {
                            case 'K':
                            case 'k':
                                longValue *= 1000;
                                break;
                            case 'M':
                            case 'm':
                                longValue *= 1000000;
                                break;
                            case 'B':
                            case 'b':
                                longValue *= 1000000000;
                                break;
                            default:
                                break;
                        }
                    }
                    if(longValue) {
                        finalValue = longValue + '';
                    }
                }
            }
            return finalValue;
        }

        ///Calculate the Att or Ret
        function calculateProgramAtt(limit, att)
        {
            if(!limit || !att)
            {
                return null;
            }

            return parseInt(limit) + parseInt(att);
        }

        ///Calculate the expiring / proposed program Rate
        function calculateProgramRate(premium, limit)
        {
            if(!premium ||
                !limit ||
                premium === '' ||
                limit === '')
            {
                return null;
            }

            return (( parseInt(premium) * 1000000) / parseInt(limit)).toFixed(2);
        }

        ///Calculate the expiring / proposed program ROL
        function calculateProgramRol(currentRate, previousRate)
        {
            if(!currentRate ||
               !previousRate ||
                currentRate === '' ||
                previousRate === '')
            {
                return null;
            }

            return ((parseFloat(currentRate) * 100.0) / parseFloat(previousRate)).toFixed(2);
        }

        function getPrintableValue(sectionId)
        {
            var value = false;
            var specificStep = _.find(overviewBusiness.templateOverview.steps, function(step)
            {
                if(parseInt(step.stepId) === parseInt(stepsBusiness.stepId))
                {
                    return step;
                }
            });

            if(specificStep)
            {
                var specificSection = _.find(specificStep.sections, function(section)
                {
                   if(section.itemId === sectionId)
                   {
                       return section;
                   }
                });

                if(specificSection)
                {
                    value = specificSection.value;
                }
            }

            return value;
        }

        function showPrintIcon(mnemonicId)
        {
            return (mnemonicId === 'section');
        }

        function updateMnemonicValue(itemId, mnemnoicId, value)
        {
            if(angular.isDefined(business.mnemonics))
            {
                _.each(business.mnemonics, function(eachrow)
                {
                    if(eachrow.itemId === itemId)
                    {
                        eachrow.value = value;
                    }
                });
            }
        }

        function getCopyItemId(copyItemId)
        {
            var newItemId = '';
            if(copyItemId)
            {
                var splittedItem = copyItemId.split("_");
                var totalCount = splittedItem.length;
                var currentCount = 1;

                _.each(splittedItem, function(str)
                {
                    if(currentCount !== 1)
                    {
                        newItemId += str;
                    }

                    if(currentCount !== 1 && currentCount !== totalCount)
                    {
                        newItemId += '_';
                    }

                    currentCount++;
                });
            }
            return newItemId;
        }

        function getNewItemId(itemId)
        {
            var newItemId = '';
            if(itemId)
            {
                var splittedItem = itemId.split("_");
                var totalCount = splittedItem.length;
                var currentCount = 1;

                _.each(splittedItem, function(str)
                {
                    if(currentCount !== totalCount && currentCount !== 1)
                    {
                        newItemId += str;
                    }
                    currentCount++;
                });
            }
            return newItemId;
        }

        function getEvalMnemonicValue(mnemonic, exp)
        {
            var expression = exp + mnemonic;
            return eval(expression);
        }

        //
        function getTableLayoutMnemonicValue(itemId, mnemonic)
        {

        }
		
		function getReayForAutoSaveTableLayout(itemId, mnemonic, row)
		{
			var mnemonicTable = _.find(business.saveTableMnemonics, {itemId: itemId, mnemonic: mnemonic});

            if(angular.isUndefined(mnemonicTable))
            {
                business.saveTableMnemonics.push({
                    itemId: itemId,
                    mnemonic: mnemonic,
                    table: [row]
                });
            }
            else {
				var isExist = false;
				_.each(mnemonicTable.table, function(savedRow){
					if(_.isEqual(savedRow.condition, row.condition)){
						savedRow.row = row.row;
						isExist = true;
						return;
					}
				});
				
				if(!isExist){
					mnemonicTable.table.push(row);
				}
            }
            initiateAutoSave();
		}

        //Get ready for auto save.
        function getReadyForAutoSave(itemId, mnemonic, value)
        {
            var mnemonicRow = _.find(business.saveMnemonics, {itemId: itemId, mnemonic: mnemonic});

            if(angular.isUndefined(mnemonicRow))
            {
                business.saveMnemonics.push({
                    itemId: itemId,
                    mnemonic: mnemonic,
                    uiType: null,
                    value: value
                })
            }
            else {
                mnemonicRow.value = value;
            }
            initiateAutoSave();
        }
		
		function getReayForAutoSaveHybridTable(itemId, mnemonic, row, action, sequence)
		{
			var mnemonicTable = _.find(business.saveHybridTableMnemonics, {itemId: itemId, mnemonic: mnemonic});

            if(angular.isUndefined(mnemonicTable))
            {
				row.action = action;
                business.saveHybridTableMnemonics.push({
                    itemId: itemId,
                    mnemonic: mnemonic,
                    table: [row]
                });
            }
            else {
				switch(action)
				{
					case 'added':
						row.action = action;
						mnemonicTable.table.push(row);
						break;
					case 'updated':
						hybridUpdateRules(mnemonicTable.table, row, sequence);
						break;
					case 'deleted':
						hybridDeleteRules(mnemonicTable.table, row, sequence);
						break;
					default: break;
				}
            }
            initiateAutoSave();
		}
		
		/*
		 * if row sequence exists in added, 
		 * move row object to added
		 */
		function hybridUpdateRules(table, newRow, sequence)
		{
			var isExist = false;
			var isAdded = false;
			_.each(table, function(addedRow){
				if(addedRow.action === 'added'){
					if(addedRow.row){
						_.each(addedRow.row, function(existingRow){
							if(existingRow.columnName === 'SEQUENCE' && existingRow.value == sequence){
								isAdded = true;
								newRow.action = addedRow.action;
								addedRow.row = newRow.row;
								return;
							}
						});
					}
					if(isAdded){
						return;
					}
				}
			});
			
			if(!isAdded){
				newRow.action = 'updated';
				_.each(table, function(savedRow){
					if(_.isEqual(savedRow.condition, newRow.condition)){
						savedRow.row = newRow.row;
						isExist = true;
						return;
					}
				});
				
				if(!isExist){
					table.push(newRow);
				}
			}
		}
		
		/*
		 * if row sequence exists in added, delete the row object
		 * if row sequence exists in updated, change action to deleted
		 */
		function hybridDeleteRules(table, newRow, sequence)
		{
			var isExist = false;
			//_.each(table, function(addedRow){
			for(var index = table.length - 1; index >= 0; index--){
				var row = table[index];
				if(row.action === 'added' || row.action === 'updated'){
					if(row.row){
						_.each(row.row, function(existingRow){
							if(existingRow.columnName === 'SEQUENCE' && existingRow.value == sequence){								
								if(row.action === 'added' )
								{
									table.splice(index, 1);
								}
								else if(row.action === 'updated')
								{
									row.action = 'deleted';
								}								
								
								isExist = true;
								return;
							}
						});
					}
					if(isExist){
						break;
					}
				}
			}
			//});
			
			if(!isExist){
				newRow.action = 'deleted';
				table.push(newRow);
			}
		}

        //Get Mnemonic value based on itemId and Mnemonic
        function getMnemonicValue(itemId, mnemonic, format)
        {
            var value = '';
            if(business.mnemonics)
            {

                var mnemonic = _.find(business.mnemonics, function(m)
                                {
                                  if(m.itemId === itemId)
                                  {
                                      return m;
                                  }
                                });

                if(mnemonic)
                {
                    if(!format && format === false) { //ensures format is false & not null/undefined
                        value = mnemonic.value;
                    }
                    else {
                        value = formatData(mnemonic.value, mnemonic);
                    }
                    value = _.escape(value);
                }
            }
            return value;
        }

        //Get Mnemonic value based on itemId and Mnemonic
        function getMnemonicValueNoEscape(itemId, mnemonic, format)
        {
            var value = '';
            if(business.mnemonics)
            {

                var mnemonic = _.find(business.mnemonics, function(m)
                {
                    if(m.itemId === itemId)
                    {
                        return m;
                    }
                });

                if(mnemonic)
                {
                    if(!format && format === false) { //ensures format is false & not null/undefined
                        value = mnemonic.value;
                    }
                    else {
                        value = formatData(mnemonic.value, mnemonic);
                    }
                    value = value;
                }
            }
            return value;
        }

		
		//get all subMnemonics in table layouts to get its data types and sub data types
		function getTableLayoutSubMnemonics(itemId, mnemonic)
        {
            var subMnemonics = [];
            if(angular.isDefined(business.mnemonics))
            {
                angular.forEach(business.mnemonics, function(eachrow)
                {
                    if(eachrow.itemId === itemId && eachrow.dataSubtype)
                    {
						angular.forEach(eachrow.dataSubtype.split(','), function(eachColumn)
						{
							var mnemonic = eachColumn.split(' ');
							if(mnemonic.length > 0)
							{
								subMnemonics.push({
									mnemonic: mnemonic[0] || '',
									dataType: mnemonic[1] || '',
									dataSubtype: mnemonic[2] || ''
								});
							}
						});
						
                    }
                });
            }
			
            return subMnemonics;
        }
		
		//formats the data for NUMBER(PERCENTAGE & CURRENCY only) and DATE data types
		function formatData(value, valueType)
		{
			if(!angular.isUndefined(valueType) && !angular.isUndefined(value))
			{
				value = value+''.trim() || '';
				
				if( valueType.dataType && (valueType.dataType == 'NUMBER' || valueType.dataType == 'TABLE') && valueType.dataSubtype &&
					(valueType.dataSubtype == 'PERCENTAGE') || (valueType.dataSubtype == 'CURRENCY') || 
					(valueType.dataSubtype == 'SCALAR') || (valueType.dataSubtype == 'RATIO') )
				{
					value = numberWithCommas(value);
					value = parenthesisForNegative(value);
				}
				else if(valueType.dataType &&
					valueType.dataType == 'DATE')
				{				
					value = formatDate(parseDate(value, 'DD-MMM-YY'), 'MM/DD/YYYY');
				}
			}
			
			return value;
		}
		
		//removes formatted data, used in savings and reformatting
		function removeFormatData(value, valueType)
		{
			if(!angular.isUndefined(valueType) && !angular.isUndefined(value))
			{
				value = value+''.trim() || '';
				
				if( valueType.dataType && (valueType.dataType == 'NUMBER' || valueType.dataType == 'TABLE') && valueType.dataSubtype &&
					(valueType.dataSubtype == 'PERCENTAGE') || (valueType.dataSubtype == 'CURRENCY') || 
					(valueType.dataSubtype == 'SCALAR') || (valueType.dataSubtype == 'RATIO') )
				{
					value = removeCommaValue(value);
				}
				else if(valueType && valueType.dataType && valueType.dataType == 'DATE') 
				{				
					value = formatDate(parseDate(value, 'DD-MMM-YY'), 'MM/DD/YYYY');
				}
			}
			
			return value;
		}
		
		//check if the mnemonic type is number
		function isMnemonicNumberType(mnemonicValue)
		{
			var isNumber = false;
			if(business.mnemonics)
            {

                var mnemonic = _.find(business.mnemonics, function(m)
                                {
                                  if(m.mnemonic === mnemonicValue)
                                  {
                                      return m;
                                  }
                                });

                if(mnemonic)
                {
                    isNumber = mnemonic.dataType === 'NUMBER';
                }
            }
			
			return isNumber;
		}

		function getMnemonicDataType(tearSheet) {
		    var dataType = null;

		    if (business.mnemonics) {
		        var mnemonic = _.find(business.mnemonics, function (m) {
		            if (m.mnemonic === tearSheet.Mnemonic) {
		                return m;
		            }
		        });

		        if (mnemonic) {
		            return mnemonic.dataType;
		        }
		    }
		    return dataType;
		}

		function getMnemonicDataSubtype(tearSheet) {
		    var dataSubtype = null;

		    if (business.mnemonics) {
		        var mnemonic = _.find(business.mnemonics, function (m) {
		            if (m.mnemonic === tearSheet.Mnemonic) {
		                return m;
		            }
		        });

		        if (mnemonic) {
		            return mnemonic.dataSubtype;
		        }
		    }
		    return dataSubtype;
		}

		//get decimal places for NUMBER types
        function getMnemonicPrecision(tearSheet)
        {
            var precision = null;
            
            //xml precision value set
            var xmlParameters = getMnemonicParameters(tearSheet);
			
            if(xmlParameters && xmlParameters.precision_in)
            {
                return xmlParameters.precision_in;
            }
            
            //webservice default precision value
            if(business.mnemonics)
            {
                var mnemonic = _.find(business.mnemonics, function(m)
                {
                    if(m.mnemonic === tearSheet.Mnemonic)
                    {
                        return m;
                    }
                });

                if(mnemonic && mnemonic.dataType === 'NUMBER')
                {
                    return mnemonic.precision;
                }
            }
            return precision;
        }
		
		//get parameters set in XML
		function getMnemonicParameters(tearSheet)
		{
			if(tearSheet.Parameters && tearSheet.Parameters.length > 0) {
				var parameters = [];
				angular.forEach(tearSheet.Parameters.split(','), function(parameter)
				{
					if(parameter && parameter.length && parameter.indexOf('=') > -1){
						var param = parameter.split('=');
						var strParam = '';
						
						strParam += '"' + param[0] + '"' ;  //key
						strParam += ':"' + param[1] + '"' ;  //value
						
						parameters.push(strParam);
					}
				});
				
				return angular.fromJson('{' + parameters.join(', ') + '}');
			}
			
			return null;
		}
		
		//get KMB indicators for NUMBER types
		function getMnemonicPostfix(tearSheet)
		{
			var postFix = '';
			
			//xml units value set
			var xmlParameters = getMnemonicParameters(tearSheet);
			if(xmlParameters && xmlParameters.unit_in)
			{
				return getKMBIndicator(xmlParameters.unit_in);
			}
			
			//webservice default units value
			if(business.mnemonics)
            {
				var mnemonic = _.find(business.mnemonics, function(m)
				{
					if(m.mnemonic === tearSheet.Mnemonic)
					{
						return m;
					}
				});

                if(mnemonic)
                {
					return getKMBIndicator(mnemonic.units);
                }
            }
			return postFix;
		}
		
		//KMB Indicator value 
		function getKMBIndicator(unitValue)
		{
			var unit = '';
			if(unitValue && unitValue.length > 0)
			{
				var unitLength = unitValue.length;
				
				if (unitLength > 9)
				{
					unit = "B";
				} else if (unitLength > 6)
				{
					unit = "M";
				} else if (unitLength > 3)
				{
					unit = "K";
				}
			}
			return unit;
		}
		
		function parseDate(str, format)
		{
			var date = moment(str, format, true);
			return date.isValid() ? date.toDate() : '';
		}
		
		function formatDate(date, format)
		{
			var date = moment(date);
			return date.isValid() ? date.format(format) : '';
		}
 
        function numberWithCommas(value)
		{ 
			//ensure that value is number
			if(value+''.match(/^-?[0-9]*[\.]?[0-9]+$/))
			{
				var parts = value.toString().split("."); 
				parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ","); 
				return parts.join("."); 
			}
			
			return value;
        }
		
		function removeCommaValue(inputValue)
        {
            var outputValue;
            
            if (inputValue)
            {
                outputValue = String(inputValue).replace(/\,/g, '');
                return Number(outputValue);
            }
            else
            {
                return inputValue;
            }
        }
 
		//add parenthesis for negative values
		function parenthesisForNegative(value)
		{
			if(parseFloat(value) < 0)
			{
				value = value.replace('-', '(') + ')';
			}
			return value;
		}
		
		//remove parenthesis for negative values
		function removeParenthesis(value)
		{
			if(value+''.match(/^\(\d*\)/g))
			{
				value = value.replace('(', '-').replace(')','');
			}
			return value;
		}
		
        function getTemplateElement()
        {

        }

        //Initiate auto-save
        function initiateAutoSave()
        {
            if(_.size(business.autoSavePromise) === 0)
            {
                business.autoSavePromise = $interval(function()
                {
                    save();
					saveTable();
					saveHybridTable();
					//saveInteractiveStockCharts();
					//saveSignificantDevelopmentItems();
					//saveInteractiveFinancialCharts();
                    cancelPromise();
                }, clientConfig.appSettings.autoSaveTimeOut);
            }
        }

        //Save template details
        function save()
        {
			if(business.saveMnemonics.length > 0){
			
				var saveMnemoncis = business.saveMnemonics.splice(0, business.saveMnemonics.length);
				var input = {
					projectId: commonBusiness.projectId,
					stepId: commonBusiness.stepId,
					userId: commonBusiness.userId,
					mnemonics: saveMnemoncis
				};

				templateService.save(input).then(function(response)
				{
					toast.simpleToast('Saved successfully');
				}, function(err) {
					business.saveMnemonics.push.apply(business.saveMnemonics, saveMnemonics);
					toast.simpleToast('Save Failed');
				});
			}
        }
		
		 //Save table layout template details
        function saveTable()
        {
            if(business.saveTableMnemonics.length > 0) {
                _.each(business.saveTableMnemonics, function(tableMnemonic, index){
					
					var saveTableMnemonics = business.saveTableMnemonics.splice(index, 1);
                    templateService.saveDynamicTableData(commonBusiness.projectId, commonBusiness.stepId,
                        saveTableMnemonics.mnemonic, saveTableMnemonics.itemId, saveTableMnemonics.table).then(function(response)
                    {
                        toast.simpleToast('Saved successfully');
					}, function(err) {
						business.saveTableMnemonics.push.apply(business.saveTableMnemonics, saveTableMnemonics);
						toast.simpleToast('Save Failed');
                    });
                });
            }
        }
		
		function saveHybridTable(){
			
			_.each(business.saveHybridTableMnemonics, function(hybridTable){
				var tableItemId = hybridTable.itemId;
				var tableMnemonicId = hybridTable.mnemonic;
				
				var addHybrid = new Array();
				var updateHybrid = new Array();
				var deleteHybrid = new Array();
				
				_.each(hybridTable.table, function(table){
					switch(table.action)
					{
						case 'added':
							
							//required fields for add row
							table.row.push({
								columnName: 'OBJECT_ID',
								value: commonBusiness.projectId
							});
							
							table.row.push({
								columnName: 'ITEM_ID',
								value: tableItemId
							});
							
							addHybrid.push({
								row: table.row
							});
							break;
						case 'updated':
							updateHybrid.push({
								row: table.row,
								condition: table.condition
							});
							break;
						case 'deleted':
							deleteHybrid.push({
								condition: table.condition
							});
							
							break;
						default: break;
					}
				});
				
				if(addHybrid && addHybrid.length > 0){
					templateService.addDynamicTableData(commonBusiness.projectId, commonBusiness.stepId,
						tableMnemonicId, tableItemId, addHybrid).then(function(response) {

						}
					);
				}
				
				if(updateHybrid && updateHybrid.length > 0){
					templateService.saveDynamicTableData(commonBusiness.projectId, commonBusiness.stepId,
						tableMnemonicId, tableItemId, updateHybrid).then(function(response) {

						}
					);
				}
				
				if(deleteHybrid && deleteHybrid.length > 0){
					templateService.deleteDynamicTableData(commonBusiness.projectId, commonBusiness.stepId,
						tableMnemonicId, tableItemId, deleteHybrid).then(function(response) {

						}
					);
				}
				
			});
			
			business.saveHybridTableMnemonics = [];
		}

        //maintain business variable for copy expiring/proposed program
        function updateProgramTableMnemonics(projectId, mnemonic, itemId, rows)
        {
            var tableMnemonic = _.find(business.programTableMnemonics, {projectId: projectId, mnemonic: mnemonic, itemId: itemId});

            if(angular.isUndefined(tableMnemonic)) {
                business.programTableMnemonics.push({
                    projectId: projectId, 
                    mnemonic: mnemonic, 
                    itemId: itemId,
                    rows: rows
                })
            } else {
                tableMnemonic.rows = rows;
            }
        }

        //Cancel the auto-save promise.
        function cancelPromise()
        {
            $interval.cancel(business.autoSavePromise);
            business.autoSavePromise = [];
        }

        ////Get ready for interactive stock chart auto save.
        //function getReadyForAutoSaveInteractiveStockChart(companyId, projectId, stepId, mnemonicId, itemId, value) {
        //    var mnemonicItem = _.find(business.saveInteractiveStockChartMnemonics, function (currentMnemonic) {
        //        if ((currentMnemonic.projectId == projectId) && (currentMnemonic.stepId = stepId) && (currentMnemonic.mnemonicId = mnemonicId) && (currentMnemonic.itemid = itemId)) {
        //            return currentMnemonic;
        //        }
        //    });

        //    if (angular.isUndefined(mnemonicItem)) {
        //        business.saveInteractiveStockChartMnemonics.push({
        //            companyId: companyId,
        //            projectId: projectId,
        //            stepId: stepId,
        //            mnemonicId: mnemonicId,
        //            itemId: itemId,
        //            value: value
        //        })
        //    }
        //    else {
        //        mnemonicItem.value = value;
        //    }
        //    initiateAutoSave();
        //}

        ////Save interactive stock chart details
        //function saveInteractiveStockCharts() {
        //    if (business.saveInteractiveStockChartMnemonics.length > 0) {

        //        _.each(business.saveInteractiveStockChartMnemonics, function (mnemonicItem) {
        //            stockService.saveChartAllSettings(mnemonicItem)
        //                .then(function (response) {
        //                    //TODO: send message to update chart id
        //                    toast.simpleToast('Saved successfully');
        //                });
        //        });
        //        business.saveInteractiveStockChartMnemonics = [];
        //    }
        //}

        ////Get ready for significant development item auto save.
        //function getReadyForAutoSaveSignificantDevelopmentItem(companyId, projectId, stepId, mnemonicId, itemId, value) {
        //    var mnemonicItem = _.find(business.saveSignificantDevelopmentMnemonics, function (currentMnemonic) {
        //        if ((currentMnemonic.projectId == projectId) && (currentMnemonic.stepId = stepId) && (currentMnemonic.mnemonicId = mnemonicId) && (currentMnemonic.itemid = itemId)) {
        //            return currentMnemonic;
        //        }
        //    });

        //    if (angular.isUndefined(mnemonicItem)) {
        //        business.saveSignificantDevelopmentMnemonics.push({
        //            companyId: companyId,
        //            projectId: projectId,
        //            stepId: stepId,
        //            mnemonicId: mnemonicId,
        //            itemId: itemId,
        //            value: value
        //        })
        //    }
        //    else {
        //        mnemonicItem.value = value;
        //    }
        //    initiateAutoSave();
        //}

        ////Save significant development item details
        //function saveSignificantDevelopmentItems() {
        //    if (business.saveSignificantDevelopmentMnemonics.length > 0) {

        //        _.each(business.saveSignificantDevelopmentMnemonics, function (mnemonicItem) {
        //            stockService.saveSigDevItems(mnemonicItem)
        //                .then(function (response) {
        //                    //TODO: send message to update chart id
        //                    toast.simpleToast('Saved successfully');
        //                });
        //        });
        //        business.saveSignificantDevelopmentMnemonics =[];
        //    }
        //}

        ////Get ready for interactive financial chart auto save.
        //function getReadyForAutoSaveInteractiveFinancialChart(companyId, projectId, stepId, mnemonicId, itemId, value) {
        //    var mnemonicItem = _.find(business.saveInteractiveFinancialChartMnemonics, function (currentMnemonic) {
        //        if((currentMnemonic.projectId == projectId) && (currentMnemonic.stepId = stepId) && (currentMnemonic.mnemonicId = mnemonicId) && (currentMnemonic.itemid = itemId) ) {
        //            return currentMnemonic;
        //        }
        //    });

        //    if (angular.isUndefined(mnemonicItem)) {
        //        business.saveInteractiveFinancialChartMnemonics.push({
        //            companyId: companyId,
        //            projectId: projectId,
        //            stepId: stepId,
        //            mnemonicId: mnemonicId,
        //            itemId: itemId,
        //            value: value
        //        })
        //    }
        //    else {
        //        mnemonicItem.value = value;
        //    }
        //    initiateAutoSave();
        //}

        ////Save interactive financial chart details
        //function saveInteractiveFinancialCharts() {
        //    if (business.saveInteractiveFinancialChartMnemonics.length > 0) {

        //        _.each(business.saveInteractiveFinancialChartMnemonics, function (mnemonicItem) {
        //            financialChartService.saveInteractiveFinancialChart(mnemonicItem)
        //                .then(function (response) {
        //                    //TODO: send message to update chart id
        //                    toast.simpleToast('Saved successfully');
        //                });
        //        });
        //        business.saveInteractiveFinancialChartMnemonics = [];
        //    }
        //}

    }
})();
