/**
 * Created by sherindharmarajan on 1/19/16.
 */
(function() {
    'use strict';

    angular
        .module('app.business')
        .service('templateBusiness', templateBusiness);

    /* @ngInject */
    function templateBusiness($interval, $filter, toast, clientConfig, commonBusiness, stepsBusiness,
                              overviewBusiness, templateService, Papa) {
        var business = {
           mnemonics: null,
           saveMnemonics: [],
		   saveTableMnemonics: [],
		   saveHybridTableMnemonics: [],
           autoSavePromise: [],
           isExpandAll: false,
           save: save,
           saveTable: saveTable,
           saveHybridTable: saveHybridTable,
           cancelPromise: cancelPromise,
           getMnemonicValue: getMnemonicValue,
           getTemplateElement: getTemplateElement,
           getReadyForAutoSave: getReadyForAutoSave,
		   getReayForAutoSaveTableLayout: getReayForAutoSaveTableLayout,
		   getReayForAutoSaveHybridTable: getReayForAutoSaveHybridTable,
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
           buildLabel: buildLabel,
           buildGenericTableItem: buildGenericTableItem,
           buildRichTextArea: buildRichTextArea,
           buildScrapeItem: buildScrapeItem,
           buildMessage: buildMessage,
           determineTableLayout: determineTableLayout
        };

        return business;

        function buildComponents(scope, content, subtype)
        {
            var type = subtype || content.id;

            switch(type)
            {
                case 'LabelItem':
                    return buildLabel(scope, content);
                    break;

                case 'GenericTableItem':
                    return buildGenericTableItem(scope, content);
                    break;

                case 'RTFTextAreaItem':
                    return buildRichTextArea(scope, content);
                    break;

                case 'ScrapedItem':
                    return buildScrapeItem(scope, content);
                    break;

                case 'Expiring':
                    return buildExpiringProgram(scope, scope.tearheader, content);
                    break;

                case 'Proposed':
                    return buildProposedProgram(scope, scope.tearheader, content);
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
        function buildHybridTableLayout(scope, content, header, rows)
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
                rows: rows
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
                    //
                    tableLayout = getHeaderAndColumnsForTableLayout3(scope.tearcontent);
                    return buildReadOnlyTableLayout(scope, content, tableLayout.header, tableLayout.row);
                    break;

                case 'tablelayout4':
                    tableLayout = getHeaderAndColumnsForTableLayout4(scope.tearcontent);
                    return buildHybridTableLayout(scope, content, tableLayout.header, tableLayout.row);
                    //Hybrid Table
                    break;

                case 'tablelayout5':
                    tableLayout = getHeaderAndColumnsForTableLayout5(scope.tearcontent);
                    return buildFilterTableLayout(scope, tableLayout.itemId, tableLayout.mnemonicId, tableLayout.header, tableLayout.row);
                    break;

                case 'tablelayout6':
                    tableLayout = getHeaderAndColumnsForTableLayout6(scope.tearcontent);
                    return buildHybridTableLayout(scope, content, tableLayout.header, tableLayout.row);
                    break;
            }

            return null;
        }

        //Get header and columns for table layout 1
        function getHeaderAndColumnsForTableLayout1(tearcontent)
        {
            var tableLayout = {
                header: null,
                row: null,
                itemId: null,
                mnemonicId: null
            };

            _.each(tearcontent, function(content)
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
                    row: null
                };

            _.each(tearcontent, function(content)
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
                header: null,
                row: null
            };

            _.each(tearcontent, function(content)
            {
                if(content.id === 'TableLayOut')
                {
                    tableLayout.row = content.TableRowTemplate.row;
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
                    row: null
                };

            _.each(tearcontent, function(content)
            {
                if(content.id === 'TableLayOut')
                {
                    tableLayout.header = content.HeaderRowTemplate;
                    tableLayout.row = content.TableRowTemplate.row;
                }
            });

            return tableLayout;
        }

        //Get header and columns for table layout 5
        function getHeaderAndColumnsForTableLayout5(tearcontent)
        {
            var tableLayout = {
                header: null,
                row: null
            };

            _.each(tearcontent, function(content)
            {
                if(content.id === 'TableLayOut')
                {
                    tableLayout.row = content.TableRowTemplate.row;
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
            };

            _.each(tearcontent, function(content)
            {
                if(content.id === 'TableLayOut')
                {
                    tableLayout.header = content.VerticalRow.row;
                    tableLayout.row = content.TableRowTemplate.row;
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
                value = getMnemonicValue(itemId, mnemonicId);

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

            var newScope  = scope.$new();
            comp.html = '<ms-rich-text-editor itemid="'+itemId+'" ' +
                'mnemonicid="' + mnemonicId + '" prompt="' + prompt + '" value="' + _.escape(value) + '" isdisabled="false" answer="' + answer + '"></ms-rich-text-editor>';
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

            newScope.mnemonicid = mnemonicid;
            newScope.itemid = itemid;

            comp.html = '<ms-scrape mnemonicid="' + newScope.mnemonicid + '" itemid="' + newScope.itemid + '"></ms-scrape>';
            comp.scope = newScope;

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
            var regEx = /^[0-9]+\.?[0-9]*[kKmMbB]$/;
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

            var finalValue = inputVal;
            if (isKMBValue(inputVal)) {
                var abbreviationType = inputVal.slice(-1);
                var longValue = Number(inputVal.substring(0, inputVal.length - 1));
                if (!isNaN(longValue))
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
                finalValue = $filter("currency")(longValue, '', 0);
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
                angular.forEach(business.mnemonics, function(eachrow)
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
				angular.forEach(mnemonicTable.table, function(savedRow){
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
			angular.forEach(table, function(addedRow){
				if(addedRow.action === 'added'){
					if(addedRow.row){
						angular.forEach(addedRow.row, function(existingRow){
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
				angular.forEach(table, function(savedRow){
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
			//angular.forEach(table, function(addedRow){
			for(var index = table.length - 1; index >= 0; index--){
				var row = table[index];
				if(row.action === 'added' || row.action === 'updated'){
					if(row.row){
						angular.forEach(row.row, function(existingRow){
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
        function getMnemonicValue(itemId, mnemonic)
        {
            var value = '';
            if(angular.isDefined(business.mnemonics))
            {
                angular.forEach(business.mnemonics, function(eachrow)
                {
                    if(eachrow.itemId === itemId)
                    {
                        value = eachrow.value.trim() || '';
                        return _.escape(value);
                    }
                });
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
                    cancelPromise();
                }, clientConfig.appSettings.autoSaveTimeOut);
            }
        }

        //Save template details
        function save()
        {
			if(business.saveMnemonics.length > 0){
				var input = {
					projectId: commonBusiness.projectId,
					stepId: commonBusiness.stepId,
					userId: commonBusiness.userId,
					mnemonics: business.saveMnemonics
				};

				templateService.save(input).then(function(response)
				{
                    business.saveMnemonics = [];
					toast.simpleToast('Saved successfully');
				});
			}
        }
		
		 //Save table layout template details
        function saveTable()
        {
            if(business.saveTableMnemonics.length > 0) {
                angular.forEach(business.saveTableMnemonics, function(tableMnemonic){

                    templateService.saveDynamicTableData(commonBusiness.projectId, commonBusiness.stepId,
                        tableMnemonic.mnemonic, tableMnemonic.itemId, tableMnemonic.table).then(function(response)
                    {
                        business.saveTableMnemonics = [];
                        toast.simpleToast('Saved successfully');
                    });
                });
            }
        }
		
		function saveHybridTable(){
			
			angular.forEach(business.saveHybridTableMnemonics, function(hybridTable){
				var tableItemId = hybridTable.itemId;
				var tableMnemonicId = hybridTable.mnemonic;
				
				var addHybrid = new Array();
				var updateHybrid = new Array();
				var deleteHybrid = new Array();
				
				angular.forEach(hybridTable.table, function(table){
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

        //Cancel the auto-save promise.
        function cancelPromise()
        {
            $interval.cancel(business.autoSavePromise);
            business.autoSavePromise = [];
        }
    }
})();
