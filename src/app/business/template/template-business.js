/**
 * Created by sherindharmarajan on 1/19/16.
 */
(function() {
    'use strict';

    angular
        .module('app.business')
        .service('templateBusiness', templateBusiness);

    /* @ngInject */
    function templateBusiness($interval, toast, clientConfig, commonBusiness, stepsBusiness,
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
           getComponents: getComponents
        };

        return business;

        //Get the correct component and add to the collection
        function getComponents(contentComponents, comp)
        {
            var component = null;
            business.variations = [];
            initVariations(contentComponents, comp);

            while (business.variations.length){
                component = business.variations.shift().call();
                if(component)
                    return component;
            }
            return component;
        }

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

            business.variations = [ sectionCompVariationFunc,
                                    sectionParentChildVariationFunc,
                                    sectionParentChildMulitpleVariationFunc
                                  ];
        }

        ///Tearsheet section component relationship
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
                        component.sections.push(sectionTearSheetItem[0]);
                    }
                }
            }

            return component;
        }

        ///Tearsheet parent child variation
        function parentChildVariation(contentComponents, comp)
        {
            var component = null;
            var tearSheetItem = comp.TearSheetItem;

            if(tearSheetItem && tearSheetItem.ParentCom &&
               tearSheetItem.ParentCom.ChildCom &&
                !tearSheetItem.ParentCom.ChildCom.length)
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
                        component.sections.push(sectionItem[0]);
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
                                    var comId = sec.comId;
                                    var section = null;
                                    if(comId)
                                    {
                                        section = getSectionByCompId(contentComponents, comId);
                                    }
                                    if(section)
                                    {
                                        component.sections.push(section[0]);
                                    }
                                    else {
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

            console.log('Specific Step - ');
            console.log(overviewBusiness.templateOverview.steps);
            console.log(stepsBusiness.stepId);
            console.log(specificStep);

            if(specificStep)
            {
                var specificSection = _.find(specificStep.sections, function(section)
                {
                   if(section.itemId === sectionId)
                   {
                       return section;
                   }
                });

                console.log('Specific Section - ');
                console.log(specificSection);

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

            console.log('Mnemonic Table');
            console.log(mnemonicTable);

            if(angular.isUndefined(mnemonicTable))
            {
                console.log('Adding...');
                business.saveTableMnemonics.push({
                    itemId: itemId,
                    mnemonic: mnemonic,
                    table: [row]
                });
				
				console.log(business.saveTableMnemonics);
            }
            else {
				console.log('Updating and checking if row exists');
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
			
			console.log('Inserting save Table Mnemonics --');
            console.log(business.saveTableMnemonics);
            initiateAutoSave();
		}

        //Get ready for auto save.
        function getReadyForAutoSave(itemId, mnemonic, value)
        {
            var mnemonicRow = _.find(business.saveMnemonics, {itemId: itemId, mnemonic: mnemonic});

            console.log('Mnemonic Row');
            console.log(mnemonicRow);

            if(angular.isUndefined(mnemonicRow))
            {
                console.log('Adding...');
                business.saveMnemonics.push({
                    itemId: itemId,
                    mnemonic: mnemonic,
                    uiType: null,
                    value: value
                })
            }
            else {
                console.log('Updating...');
                mnemonicRow.value = value;
            }
            console.log('Inserting save Mnemonics --');
            console.log(business.saveMnemonics);
            initiateAutoSave();
        }
		
		function getReayForAutoSaveHybridTable(itemId, mnemonic, row, action, sequence)
		{
			var mnemonicTable = _.find(business.saveHybridTableMnemonics, {itemId: itemId, mnemonic: mnemonic});

            console.log('Mnemonic Table');
            console.log(mnemonicTable);

            if(angular.isUndefined(mnemonicTable))
            {
                console.log('Adding...');
				row.action = action;
                business.saveHybridTableMnemonics.push({
                    itemId: itemId,
                    mnemonic: mnemonic,
                    table: [row]
                });
				
				console.log(business.saveHybridTableMnemonics);
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
			
			console.log('Inserting save Table Mnemonics --');
            console.log(business.saveHybridTableMnemonics);
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
                console.log('Creating Promise for Template');
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
							console.log(response);
							console.log(addHybrid);
						}
					);
				}
				
				if(updateHybrid && updateHybrid.length > 0){
					templateService.saveDynamicTableData(commonBusiness.projectId, commonBusiness.stepId,
						tableMnemonicId, tableItemId, updateHybrid).then(function(response) {
							console.log(response);
							console.log(updateHybrid);
						}
					);
				}
				
				if(deleteHybrid && deleteHybrid.length > 0){
					templateService.deleteDynamicTableData(commonBusiness.projectId, commonBusiness.stepId,
						tableMnemonicId, tableItemId, deleteHybrid).then(function(response) {
							console.log(response);
							console.log(deleteHybrid);
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
