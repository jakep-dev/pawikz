/**
 * Created by sherindharmarajan on 1/19/16.
 */
(function() {
    'use strict';

    angular
        .module('app.business')
        .factory('templateBusiness', templateBusiness);

    /* @ngInject */
    function templateBusiness($interval, toast, clientConfig, commonBusiness, templateService) {

        var business = {
           mnemonics: null,
           saveMnemonics: [],
           autoSavePromise: [],
           save: save,
           getMnemonicValue: getMnemonicValue,
           getTemplateElement: getTemplateElement,
           getReadyForAutoSave: getReadyForAutoSave,
           getTableLayoutMnemonicValue: getTableLayoutMnemonicValue
        };

        return business;

        //
        function getTableLayoutMnemonicValue(itemId, mnemonic)
        {

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
                    cancelPromise();
                }, clientConfig.appSettings.autoSaveTimeOut);
            }
        }

        //Save template details
        function save()
        {
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

        //Cancel the auto-save promise.
        function cancelPromise()
        {
            $interval.cancel(business.autoSavePromise);
            business.autoSavePromise = [];
        }
    }
})();
