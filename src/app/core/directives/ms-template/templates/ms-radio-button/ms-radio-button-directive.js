(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('MsRadioButtonController', MsRadioButtonController)
        .directive('msRadioButton', msRadioButtonDirective);

    /** @ngInject */
    function MsRadioButtonController($scope, templateBusiness)
    {
        var isAutoSaveEnabled = false;
        $scope.$watch(
            "tearsheet.value",
            function handleAutoSave(value) {
                if(isAutoSaveEnabled)
                {
                    templateBusiness.getReadyForAutoSave($scope.itemid, $scope.mnemonicid, value);
                    //console.log( "$watch() -- Radio Button Outer: ", value);
                }
                isAutoSaveEnabled = true;
            }
        );

    }

    /** @ngInject */
    function msRadioButtonDirective()
    {
        return {
            restrict: 'E',
            scope   : {
                itemid: '@',
                mnemonicid: '@',
                tearsheet: '='
            },
            controller: 'MsRadioButtonController',
            templateUrl: 'app/core/directives/ms-template/templates/ms-radio-button/ms-radio-button.html',
            link:function(scope)
            {
                console.log('Radio Button Scope');
                console.log(scope);
                console.log('Radio Button Scope End');
            }
        };
    }

})();