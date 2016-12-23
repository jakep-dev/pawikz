(function() {
    'use strict';

    angular
        .module('app.template.business.save', [])
        .service('templateBusinessSave', templateBusinessSave);

    /* @ngInject */
    function templateBusinessSave(commonBusiness, templateBusinessFormat, clientConfig, templateService, toast, $interval) {
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
                            if (stepResponse.interactiveStockChart) {
                                angular.forEach(stepResponse.interactiveStockChart, function (chartPerStep) {
                                    if (chartPerStep.data) {
                                        //console.log('call emit');
                                        commonBusiness.emitWithArgument('updateInteractiveStockChartIds', chartPerStep.data);
                                    }
                                });
                            }
                            if (stepResponse.interactiveFinancialChart) {
                                angular.forEach(stepResponse.interactiveFinancialChart, function (chartPerStep) {
                                    if(chartPerStep.data) {
                                        //console.log('call emit');
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

                case clientConfig.uiType.interactiveStockChart:
                    buildInteractiveStockChartAutoSave(itemId, mnemonic, type, stepMnemonic, data);
                    break;

                case clientConfig.uiType.significantDevelopmentItems:
                    buildSignificantDevelopmentItemAutoSave(itemId, mnemonic, type, stepMnemonic, data);
                    break;

                case clientConfig.uiType.interactiveFinancialChart:
                    buildInteractiveFinancialChartAutoSave(itemId, mnemonic, type, stepMnemonic, data);
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
		function buildInteractiveStockChartAutoSave(itemId, mnemonic, type, stepMnemonic, data) {
		    if (stepMnemonic) {
		        var mnemonicRow = _.find(stepMnemonic.mnemonic, { itemId: itemId, mnemonic: mnemonic, type: type });
		        if (!mnemonicRow) {
		            stepMnemonic.mnemonic.push({
		                itemId: itemId,
		                mnemonic: mnemonic,
		                type: type,
		                data: getSaveStockChartInputObject(commonBusiness.projectId, commonBusiness.stepId, commonBusiness.companyId, mnemonic, itemId, data)
		            });
		        }
		        else {
		            mnemonicRow.data = getSaveStockChartInputObject(commonBusiness.projectId, commonBusiness.stepId, commonBusiness.companyId, mnemonic, itemId, data);
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
		                data: getSaveStockChartInputObject(commonBusiness.projectId, commonBusiness.stepId, commonBusiness.companyId, mnemonic, itemId, data)
		            }]
		        });
		    }
		}

		function getSaveStockChartInputObject(projectId, stepId, companyId, mnemonicId, itemId, value) {
		    /** INPUT
            {
                projectId: projectId,
                stepId: stepId,
                companyId: companyId,
                mnemonicId: mnemonicId,
                itemId: itemId,
                value: { 
                    newCharts: jsCharts,
                    oldCharts: oldCharts
                }
            }
            */
		    /** OUTPUT
                data: {
                    //Changing keynames as per jake plaras email on 26/5/2016
                    company_id: companyId,
                    step_id: stepId,
                    project_id: projectId,
                    //ssnid: ssnid,
                    chartSettings: chartSettings
                }
            */
		    var saveObject = new Object;
		    //Changing keynames as per jake plaras email on 26/5/2016
		    saveObject.company_id = companyId;
		    saveObject.step_id = stepId;
		    saveObject.project_id = projectId;
		    saveObject.chartSettings = new Array();

		    if (value.newCharts != null) {
		        value.newCharts.forEach(function (chart) {
		            var stockString = '';
		            var jsChart = chart.filterState;
		            var tearsheet = chart.tearsheet;
		            // if (!tearsheet.isMainChart) {
		            if (jsChart.selectedPeers) {
		                jsChart.selectedPeers.forEach(function (stock) {
		                    stockString = stockString + stock + ',';
		                });
		            }
		            if (jsChart.selectedIndices) {
		                jsChart.selectedIndices.forEach(function (indics) {
		                    stockString = stockString + '^' + indics + ',';
		                });
		            }
		            if (jsChart.selectedCompetitors) {
		                jsChart.selectedCompetitors.forEach(function (competitors) {
		                    stockString = stockString + '@' + competitors + ',';
		                });
		            }
		            if (stockString && stockString !== '') {
		                stockString = stockString.slice(0, -1);
		            }

		            jsChart.chartType = chart.chartType;
		            var obj = {
		                chart_title: jsChart.title ? jsChart.title : null,
		                peers: stockString,
		                period: jsChart.interval ? jsChart.interval : null,
		                date_start: templateBusinessFormat.formatDate(jsChart.startDate, 'YYYY-MM-DD'),
		                date_end: templateBusinessFormat.formatDate(jsChart.endDate, 'YYYY-MM-DD'),
		                dividends: jsChart.dividends ? "Y" : "N",
		                earnings: jsChart.earnings ? "Y" : "N",
		                splits: jsChart.splits ? "Y" : "N",
		                chartType: jsChart.chartType ? jsChart.chartType : 'JSCHART',
		                mnemonic: jsChart.mnemonic,
		                item_id: jsChart.item_id,
		                isDefault: jsChart.isDefault
		            };
		            saveObject.chartSettings.push(obj);
		        });
		    }

		    if (value.oldCharts != null) {
		        value.oldCharts.forEach(function (chart) {
		            var obj = {
		                chart_title: chart.title ? chart.title : null,
		                peers: chart.stockString ? chart.stockString : null,
		                period: chart.interval ? chart.interval : null,
		                date_start: chart.date_start ? chart.date_start : "",
		                date_end: chart.date_end ? chart.date_end : "",
		                chartType: chart.chartType,
		                dividends: chart.dividends ? "Y" : "N",
		                earnings: chart.earnings ? "Y" : "N",
		                splits: chart.splits ? "Y" : "N",
		                project_image_code: chart.tearsheet.project_image_code,
		                url: chart.tearsheet.url
		            };
		            saveObject.chartSettings.push(obj);
		        });
		    }
		    return saveObject;
		}

		function buildSignificantDevelopmentItemAutoSave(itemId, mnemonic, type, stepMnemonic, data) {
		    if (stepMnemonic) {
		        var mnemonicRow = _.find(stepMnemonic.mnemonic, { itemId: itemId, mnemonic: mnemonic, type: type });
		        if (!mnemonicRow) {
		            stepMnemonic.mnemonic.push({
		                itemId: itemId,
		                mnemonic: mnemonic,
		                type: type,
		                data: getSaveSigDevInputObject(commonBusiness.projectId, commonBusiness.stepId, commonBusiness.companyId, mnemonic, itemId, data)
		            });
		        }
		        else {
		            mnemonicRow.data = getSaveSigDevInputObject(commonBusiness.projectId, commonBusiness.stepId, commonBusiness.companyId, mnemonic, itemId, data);
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
		                data: getSaveSigDevInputObject(commonBusiness.projectId, commonBusiness.stepId, commonBusiness.companyId, mnemonic, itemId, data)
		            }]
		        });
		    }
		}

		function getSaveSigDevInputObject(projectId, stepId, companyId, mnemonicId, itemId, value) {
		    /** INPUT
            {
                companyId: companyId,
                projectId: projectId,
                stepId: stepId,
                mnemonicId: mnemonicId,
                itemId: itemId,
                value: jsCharts
            }
            */
		    /** OUTPUT
                data: {
                    project_id: projectId,
                    step_id: stepId,
                    mnemonic: mnemonic,
                    item_id: itemId,
                    items: sigDevItems
                }
            */
		    var saveObject = new Object;
		    saveObject.project_id = projectId;
		    saveObject.step_id = stepId;
		    saveObject.mnemonic = mnemonicId;
		    saveObject.item_id = itemId;
		    saveObject.items = new Array();

		    if (value != null) {
		        value.forEach(function (chart) {
		            var jsChart = chart.filterState;
		            if (jsChart.isDefault === 'N') {
		                var perChart = {
		                    sigdevId: [],
		                    mascadId: [],
		                };
		                angular.forEach(chart.tableInfo, function (table) {

		                    switch (table.source.value) {
		                        case 'SIGDEV':
		                            if (table.rows && table.rows.length > 0) {
		                                perChart.sigdevId = _.map(table.rows, function (row) {
		                                    return row.sigDevId;
		                                });
		                            }
		                            break;
		                        case 'MASCAD':
		                            if (table.rows && table.rows.length > 0) {
		                                perChart.mascadId = _.map(table.rows, function (row) {
		                                    return row.mascadId;
		                                });
		                            }
		                            break;
		                    }

		                });

		                //As per WS team, add null if empty
		                if (perChart.sigdevId.length === 0) {
		                    perChart.sigdevId.push(null);
		                }
		                if (perChart.mascadId.length === 0) {
		                    perChart.mascadId.push(null);
		                }

		                saveObject.items.push(perChart);
		            }
		        });
		    }
		    return saveObject;
		}

		function buildInteractiveFinancialChartAutoSave(itemId, mnemonic, type, stepMnemonic, data) {
            if(stepMnemonic) {
                var mnemonicRow = _.find(stepMnemonic.mnemonic, {itemId: itemId, mnemonic: mnemonic, type: type});
                if (!mnemonicRow) {
                    stepMnemonic.mnemonic.push({
                        itemId: itemId,
                        mnemonic: mnemonic,
                        type: type,
                        data: getSaveFinancialChartInputObject(commonBusiness.projectId, commonBusiness.stepId, commonBusiness.companyId, mnemonic, itemId, data)
                    });
                }
                else {
                    mnemonicRow.data = getSaveFinancialChartInputObject(commonBusiness.projectId, commonBusiness.stepId, commonBusiness.companyId, mnemonic, itemId, data);
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
                        data: getSaveFinancialChartInputObject(commonBusiness.projectId, commonBusiness.stepId, commonBusiness.companyId, mnemonic, itemId, data)
                    }]
                });
            }
        }

        function getSaveFinancialChartInputObject(projectId, stepId, companyId, mnemonicId, itemId, value) {
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