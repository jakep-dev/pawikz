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
            var stepMnemonic = _.find(business.saveMnemonics, {projectId: commonBusiness.projectId, stepId: commonBusiness.stepId});

            switch (type.toLowerCase()) {
                case 'general':
                    buildGeneralAutoSave(itemId, mnemonic, type, stepMnemonic, data);
                    break;

                case 'table-layout':
                    buildTableLayoutAutoSave(itemId, mnemonic, type, stepMnemonic, data);
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
                    mnemonic: [{
                        itemId: itemId,
                        mnemonic: mnemonic,
                        type: type,
                        data: data
                    }]
                });
            }
        }

        //Build table layout mnemonic items
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
                   var mnemonicRow = _.find(mnemonicTable, {condition: data.condition});
                   if(!mnemonicRow) {
                       mnemonicTable.data.push(data);
                   }
                    else{
                       mnemonicTable.data = data;
                   }
                }
            }
            else{
                business.saveMnemonics.push({
                    projectId: commonBusiness.projectId,
                    stepId: commonBusiness.stepId,
                    mnemonic: [{
                        itemId: itemId,
                        mnemonic: mnemonic,
                        type: type,
                        data: [data]
                    }]
                });
            }
        }

        //Build hybrid auto save mnemonic items
        function buildHybridTableAutoSave(itemId, mnemonic, type, stepMnemonic, data, action, sequence){
            if(stepMnemonic) {
                var mnemonicTable = _.find(stepMnemonic.mnemonic, {itemId: itemId, mnemonic: mnemonic, type: type});
                switch (action)
                {

                }
            }
            else{
                data.action = action;
                business.saveMnemonics.push({
                    projectId: commonBusiness.projectId,
                    stepId: commonBusiness.stepId,
                    mnemonic: [{
                        itemId: itemId,
                        mnemonic: mnemonic,
                        type: type,
                        data: [data]
                    }]
                });
            }
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