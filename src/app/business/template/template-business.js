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
           autoSavePromise: [],
           isExpandAll: false,
           save: save,
           cancelPromise: cancelPromise,
           getMnemonicValue: getMnemonicValue,
           getTemplateElement: getTemplateElement,
           getReadyForAutoSave: getReadyForAutoSave,
		   getReayForAutoSaveTableLayout: getReayForAutoSaveTableLayout,
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
           unParseJsonToCsv: unParseJsonToCsv
        };

        return business;

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

            return (( parseInt(premium) * 100000) / parseInt(limit)).toFixed(2);
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

            return ((parseInt(currentRate) * 100) / parseInt(previousRate)).toFixed(2);
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
                    business.saveMnemonics = [];
					saveTable();
					business.saveTableMnemonics = [];
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
					toast.simpleToast('Saved successfully');
				});
			}
        }
		
		 //Save table layout template details
        function saveTable()
        {
			angular.forEach(business.saveTableMnemonics, function(tableMnemonic){
				
				templateService.saveDynamicTableData(commonBusiness.projectId, commonBusiness.stepId,
					tableMnemonic.mnemonic, tableMnemonic.itemId, tableMnemonic.table).then(function(response)
				{
					toast.simpleToast('Table saved successfully');
				});
			});
        }

        //Cancel the auto-save promise.
        function cancelPromise()
        {
            $interval.cancel(business.autoSavePromise);
            business.autoSavePromise = [];
        }
    }
})();
