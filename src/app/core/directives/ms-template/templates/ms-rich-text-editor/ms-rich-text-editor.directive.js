(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('MsRichTextEditorController', MsRichTextEditorController)
        .controller('MsRichTextEditorDialogController', MsRichTextEditorDialogController)
        .directive('msRichTextEditor', msRichTextEditorDirective);


    /** @ngInject */
    function MsRichTextEditorDialogController($scope, templateBusinessSave, clientConfig, commonBusiness, dialog)
    {
        var vm = this;
        vm.close = close;
        var mainHeight = $('#main').height();
        vm.myHtml = "";
        vm.value = $scope.value;
        vm.froalaOptions = {
            toolbarButtons: [
                "bold"
                , "italic"
                , "underline"
                , "strikeThrough"
                , "subscript"
                , "superscript"
                , "fontFamily"
                , "fontSize"
                , "color"
                , "inlineStyle"
                , "paragraphStyle"
                , "paragraphFormat"
                , "align"
                , "formatOL"
                , "formatUL"
                , "outdent"
                , "indent"
                , "quote"
                , "insertHR"
                , "insertLink"
                , "insertImage"
                , "insertTable"
                , "undo"
                , "redo"
                , "clearFormatting"
                , "selectAll"
            ],
            toolbarInline: false,
            height: mainHeight * .9,
            charCounterCount: false,
            placeholderText: $scope.answer || 'Enter text here',
            key: clientConfig.appSettings.textEditorApiKey
        };
        $scope.$watch(
            "vm.value",
            function handleAutoSave(newValue, oldValue) {
                if(newValue !== oldValue) {
                    commonBusiness.emitWithArgument('RichTextEditor_' + $scope.itemid, newValue);
                    templateBusinessSave.getReadyForAutoSave($scope.itemid, $scope.mnemonicid, newValue, clientConfig.uiType.general);
                }
            }
        );

        function close()
        {
            dialog.close();
        }
    }

    /** @ngInject */
    function MsRichTextEditorController($scope, templateBusinessSave, clientConfig, $mdDialog, commonBusiness)
    {
        $scope.newScope = $scope.$new();
        $scope.newScope.itemid = $scope.itemid;
        $scope.newScope.mnemonicid = $scope.mnemonicid;
        $scope.newScope.prompt = $scope.prompt;
        $scope.newScope.value = $scope.value;
        $scope.newScope.isdisabled = $scope.isdisabled;
        $scope.newScope.answer = $scope.answer;
        $scope.textDialogScope = MsRichTextEditorDialogController;

        var textEditorId = 'textEditor_' + $scope.itemid;

        $.FroalaEditor.DefineIconTemplate('full_screen_icon_template', '<i class="icon-fullscreen s18"></i>');
        $.FroalaEditor.DefineIcon('custom-fullscreen-icon', {NAME: 'full_screen_custom', template: 'full_screen_icon_template'});
        $.FroalaEditor.RegisterCommand('custom-fullscreen', {
            title: 'Full Screen',
            icon: 'custom-fullscreen-icon',
            focus: false,
            undo: false,
            refreshAfterCallback: true,
            callback: function () {
                var editor = this,
                    obj = $(this.selection.element()).closest('#textEditor'),
                    itemid = obj[0].attributes['itemid'].value,
                    mnemonicid = obj[0].attributes['mnemonicid'].value,
                    answer = obj[0].attributes['answer'].value;
                $scope.newScope.itemid = itemid;
                $scope.newScope.mnemonicid = mnemonicid;
                $scope.newScope.value = this.html.get();
                $scope.newScope.answer = answer;
                commonBusiness.onMsg('RichTextEditor_' + itemid, $scope.newScope, function(ev, data) {
                    editor.html.set(data);
                });
                $mdDialog.show({
                    scope: $scope.newScope,
                    controller: MsRichTextEditorDialogController,
                    preserveScope:true,
                    animate: 'full-screen-dialog',
                    controllerAs: 'vm',
                    templateUrl: 'app/core/directives/ms-template/templates/ms-rich-text-editor/dialog/ms-rich-text-editor.dialog.html',
                    //parent: angular.element(document.body),
                    //targetEvent: ev,
                    clickOutsideToClose:true,
                    fullscreen: true
                });
            }
        });

        $scope.myHtml = "";
        $scope.froalaOptions = {
            toolbarButtons: [
                  "custom-fullscreen"
                ,  "bold"
                , "italic"
                , "underline"
                , "strikeThrough"
                , "subscript"
                , "superscript"
                , "fontFamily"
                , "fontSize"
                , "color"
                , "inlineStyle"
                , "paragraphStyle"
                , "paragraphFormat"
                , "align"
                , "formatOL"
                , "formatUL"
                , "outdent"
                , "indent"
                , "quote"
                , "insertHR"
                , "insertLink"
                , "insertImage"
                , "insertTable"
                , "undo"
                , "redo"
                , "clearFormatting"
                , "selectAll"
            ],
            toolbarInline: false,
            placeholderText: $scope.answer || 'Enter text here',
            key: clientConfig.appSettings.textEditorApiKey
        };



        $scope.$watch(
            "value",
            function handleAutoSave(newValue, oldValue) {
                // check history logs unnecessary updates
                newValue = removeHtmlTags(newValue);
                oldValue = removeHtmlTags(oldValue);
                if(newValue !== oldValue) {
                    templateBusinessSave.getReadyForAutoSave($scope.itemid, $scope.mnemonicid, newValue, clientConfig.uiType.general);
                }
            }
        );
    }

    // check for default Text value purposed
    function removeHtmlTags(value){
        value = value.replace(/<p[^>]*>/g, "").replace(/<\/?p[^>]*>/g, ""); 
        return value;
    }

    /** @ngInject */
    function msRichTextEditorDirective($compile)
    {
        return {
            restrict: 'E',
            scope   : {
                itemid: '@',
                mnemonicid: '@',
                prompt: '@',
                value: '@',
                isdisabled: '=?',
                answer: '@'
            },
            controller: 'MsRichTextEditorController',
            templateUrl: 'app/core/directives/ms-template/templates/ms-rich-text-editor/ms-rich-text-editor.html',
            compile: function(el, attrs)
            {
                return function($scope)
                {
                    var html = '',
                        textEditorId = 'textEditor_' + $scope.itemid;

                    if($scope.prompt && $scope.prompt !== '') {
                        html += '<div><ms-label value="' + $scope.prompt + '"></ms-label></div>';
                    }
                    html += '<div id="textEditor" froala="froalaOptions" itemid="'+ $scope.itemid +'" ' +
                        'mnemonicid="' + $scope.mnemonicid + '" answer="'+ $scope.answer +'"  ng-model="value"></div>';
                    el.find('#textEditorContent').append($compile(html)($scope));
                };
            }
        };
    }

})();