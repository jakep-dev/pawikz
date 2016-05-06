/**
 * Created by sherindharmarajan on 1/19/16.
 */
(function() {
    'use strict';

    angular
        .module('app.business')
        .service('templateBusiness', templateBusiness);

    /* @ngInject */
    function templateBusiness($interval, toast, clientConfig, commonBusiness, templateService) {
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
           getEvalMnemonicValue: getEvalMnemonicValue
        };

        return business;

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
                        value = eachrow.value || '';
                        return value;
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
