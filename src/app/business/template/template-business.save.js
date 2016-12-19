(function() {
    'use strict';

    angular
        .module('app.template.business.save', [])
        .service('templateBusinessSave', templateBusinessSave);

    /* @ngInject */
    function templateBusinessSave(commonBusiness, clientConfig, templateService, toast, $interval) {
        var business = {
            saveMnemonics: [],
            autoSavePromise: [],

            save: save,
            cancelPromise: cancelPromise,

            getReadyForAutoSave: getReadyForAutoSave
        };

        return business;

        //Save template details
        function save()
        {   if(business.saveMnemonics.length > 0){
                var input = {
                    userId: commonBusiness.userId,
                    data: business.saveMnemonics
                };
                console.log('SaveMenmonics - ');
                console.log(business.saveMnemonics);

                templateService.saveAll(input).then(function(response)
                {
                    if(response && response.data) {
                        angular.forEach( response.data, function(stepResponse){
                            if(stepResponse.interactiveChart) {
                                angular.forEach(stepResponse.interactiveChart, function(chartPerStep){
                                    if(chartPerStep.data) {
                                        console.log('call emit');
                                        commonBusiness.emitWithArgument('updateInteractiveFinancialChartIds', chartPerStep.data);
                                    }
                                });
                            }
                        });
                    }

                    //temp message
                    toast.simpleToast('Saved successfully');
                });

                business.saveMnemonics = [];
            }
            else {
                toast.simpleToast('No changes to save');
            }
        }

        //Get ready for auto save.
        function getReadyForAutoSave(itemId, mnemonic, data, type)
        {
            //Get the step related mnemonic
            var stepMnemonic = _.find(business.saveMnemonics, {projectId: commonBusiness.projectId, companyId: commonBusiness.companyId, stepId: commonBusiness.stepId});
            switch (type.toLowerCase()) {
                case clientConfig.uiType.general:
                    buildGeneralAutoSave(itemId, mnemonic, type, stepMnemonic, data);
                    break;

                case clientConfig.uiType.tableLayout:
                    buildTableLayoutAutoSave(itemId, mnemonic, type, stepMnemonic, data);
                    break;

                case clientConfig.uiType.interactiveChart:
                    buildInteractiveChartAutoSave(itemId, mnemonic, type, stepMnemonic, data);
                    break;
            }

            initiateAutoSave();
        }

        //Build auto save for generic mnemonic items
        function buildGeneralAutoSave(itemId, mnemonic, type, stepMnemonic, data) {

            if(stepMnemonic) {
                var mnemonicRow = _.find(stepMnemonic.mnemonic, {itemId: itemId, mnemonic: mnemonic, type: type});
                if (!mnemonicRow) {
                    stepMnemonic.mnemonic.push({
                        itemId: itemId,
                        mnemonic: mnemonic,
                        type: type,
                        data: data
                    });
                }
                else {
                    mnemonicRow.data = data;
                }
            }
            else{
                business.saveMnemonics.push({
                    projectId: commonBusiness.projectId,
                    stepId: commonBusiness.stepId,
                    companyId: commonBusiness.companyId,
                    mnemonic: [{
                        itemId: itemId,
                        mnemonic: mnemonic,
                        type: type,
                        data: data
                    }]
                });
            }
        }

        /**
         * Build table layout mnemonic items
         * Merge with Hybrid Tablelayout, uses same webservice, normal Table only uses Update Action
         */
        function buildTableLayoutAutoSave(itemId, mnemonic, type, stepMnemonic, data) {
            if(stepMnemonic) {
                var mnemonicTable = _.find(stepMnemonic.mnemonic, {itemId: itemId, mnemonic: mnemonic, type: type});
                if (!mnemonicTable) {
                    stepMnemonic.mnemonic.push({
                        itemId: itemId,
                        mnemonic: mnemonic,
                        type: type,
                        data: [data]
                    });
                }
                else {
                    switch(data.action)
                    {
                        case 'added':
                            mnemonicTable.data.push(data);
                            break;
                        case 'updated':
                            hybridUpdateRules(mnemonicTable.data, data, data.sequence);
                            break;
                        case 'deleted':
                            hybridDeleteRules(mnemonicTable.data, data, data.sequence);
                            break;
                        default: break;
                    }
                }
            }
            else {
                business.saveMnemonics.push({
                    projectId: commonBusiness.projectId,
                    stepId: commonBusiness.stepId,
                    companyId: commonBusiness.companyId,
                    mnemonic: [{
                        itemId: itemId,
                        mnemonic: mnemonic,
                        type: type,
                        data: [data]
                    }]
                });
            }
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
			
			if(!isExist){
				newRow.action = 'deleted';
				table.push(newRow);
			}
		}
        
        //Build auto save for generic mnemonic items
        function buildInteractiveChartAutoSave(itemId, mnemonic, type, stepMnemonic, data) {
            if(stepMnemonic) {
                var mnemonicRow = _.find(stepMnemonic.mnemonic, {itemId: itemId, mnemonic: mnemonic, type: type});
                if (!mnemonicRow) {
                    stepMnemonic.mnemonic.push({
                        itemId: itemId,
                        mnemonic: mnemonic,
                        type: type,
                        data: getSaveChartInputObject(commonBusiness.projectId, commonBusiness.stepId, commonBusiness.companyId, mnemonic, itemId, data)
                    });
                }
                else {
                    mnemonicRow.data = getSaveChartInputObject(commonBusiness.projectId, commonBusiness.stepId, commonBusiness.companyId, mnemonic, itemId, data);
                }
            }
            else {
                business.saveMnemonics.push({
                    projectId: commonBusiness.projectId,
                    stepId: commonBusiness.stepId,
                    companyId: commonBusiness.companyId,
                    mnemonic: [{
                        itemId: itemId,
                        mnemonic: mnemonic,
                        type: type,
                        data: getSaveChartInputObject(commonBusiness.projectId, commonBusiness.stepId, commonBusiness.companyId, mnemonic, itemId, data)
                    }]
                });
            }
        }

        function getSaveChartInputObject(projectId, stepId, companyId, mnemonicId, itemId, value) {
            var saveObject = new Object;
            var startDate;
            var endDate;
            
            saveObject.projectImageCode = value.projectImageCodes;
            saveObject.ifChartSettings = [];
            if (value.newCharts && value.newCharts.length > 0) {
                value.newCharts.forEach(function (item) {
                    if (item.filterState.isCustomDate === true) {
                        startDate = item.filterState.startDate;
                        endDate = item.filterState.endDate;
                    } else {
                        startDate = '';
                        endDate = '';
                    }
                    saveObject.ifChartSettings.push({
                        chart_title: item.filterState.chartTitle,
                        compare_name: item.filterState.compareNames,
                        short_name: item.filterState.shortNames,
                        compare_id: item.filterState.compareIds,
                        single_multi: item.filterState.chartMode,
                        ratioselect: item.filterState.chartType,
                        time_period: item.filterState.chartPeriod,
                        is_custom_date: item.filterState.isCustomDate,
                        startdate: startDate,
                        enddate: endDate
                    });
                });
            }
            return saveObject;
        }

        //Initiate auto-save
        function initiateAutoSave()
        {
            if(_.size(business.autoSavePromise) === 0)
            {
                business.autoSavePromise = $interval(function()
                {
                    save();
                    cancelPromise();
                }, clientConfig.appSettings.autoSaveTimeOut);
            }
        }

        //Cancel the auto-save promise.
        function cancelPromise()
        {
            $interval.cancel(business.autoSavePromise);
            business.autoSavePromise = [];
        }
    }
})();