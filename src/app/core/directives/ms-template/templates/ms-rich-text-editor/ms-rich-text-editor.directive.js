(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('MsRichTextEditorController', MsRichTextEditorController)
        .controller('MsRichTextEditorDialogController', MsRichTextEditorDialogController)
        .directive('msRichTextEditor', msRichTextEditorDirective);


    /** @ngInject */
    function MsRichTextEditorDialogController($scope, $element, templateBusinessSave, clientConfig, commonBusiness, dialog)
    {
        var vm = this;
        vm.close = close;

        //keep track if the dialog is in a closed state
        vm.isDialogClosed = false;

        var mainHeight = $('#main').height();
        vm.froalaOptions = {
            toolbarButtons: [
                "bold",
                "italic",
                "underline",
                "strikeThrough",
                "subscript",
                "superscript",
                "fontFamily",
                "fontSize",
                "color",
                "inlineStyle",
                "paragraphStyle",
                "paragraphFormat",
                "align",
                "formatOL",
                "formatUL",
                "outdent",
                "indent",
                "quote",
                "insertHR",
                "insertLink",
                "insertImage",
                "insertTable",
                "undo",
                "redo",
                "clearFormatting",
                "selectAll"
            ],
            toolbarSticky: false,
            toolbarInline: false,
            height: mainHeight * .9,
            charCounterCount: false,
            placeholderText: $scope.answer || 'Enter text here',
            pluginsEnabled: ['align', 'colors', 'draggable', 'entities', 'fontFamily',
                'fontSize', 'fullscreen', 'image', 'inlineStyle', 'lineBreaker', 'link', 'lists', 'paragraphFormat',
                'paragraphStyle', 'quickInsert', 'quote', 'save', 'table', 'url', 'wordPaste'],
            key: clientConfig.appSettings.textEditorApiKey
        };
        $element.find('#textEditorDialog').froalaEditor(vm.froalaOptions);
        //get parent text and set it in popup dialog text box
        $element.find('#textEditorDialog').froalaEditor('html.set', $scope.getValue());
        //Clear out parent text box to free up memory
        $scope.setValue('');
        $element.find('#textEditorDialog').on('froalaEditor.blur',
            function (e, editor) {
                //console.log('Save from dialog popup');
                templateBusinessSave.getReadyForAutoSave($scope.itemid, $scope.mnemonicid, editor.html.get(), clientConfig.uiType.general);
            }
        );

        function close()
        {
            if (!vm.isDialogClosed) {
                vm.isDialogClosed = true;
                //On exit of dialog box, set parent text box with text from popup dialog
                $scope.setValue($element.find('#textEditorDialog').froalaEditor('html.get'));
                //Clear text in popup dialog
                $element.find('#textEditorDialog').froalaEditor('html.set', '');
                $scope.updateCharacterCount();
            }
            dialog.close();
        }
        $scope.registerDialogClose(close);
    }

    /** @ngInject */
    function MsRichTextEditorController($scope, $mdDialog, clientConfig, commonBusiness, templateBusinessSave)
    {
        $scope.newScope = $scope.$new();
        $scope.newScope.itemid = $scope.itemid;
        $scope.newScope.mnemonicid = $scope.mnemonicid;
        $scope.newScope.prompt = $scope.prompt;
        $scope.newScope.value = $scope.value;
        $scope.newScope.isdisabled = $scope.isdisabled;
        $scope.newScope.answer = $scope.answer;
        $scope.textDialogScope = MsRichTextEditorDialogController;

        //Holds the function to call when user clicks outside the popup dialog
        var dialogClose = null;
        //The popup dialog controller calls this to pass in close function so the $mdDialog can call the close method inside itself
        function registerDialogClose(closeHandler) {
            dialogClose = closeHandler;
        }

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

                //pass function to allow popup close method to update character count
                $scope.newScope.updateCharacterCount = updateCharacterCount;

                function updateCharacterCount() {
                    templateBusinessSave.getReadyForAutoSave($scope.editor[0].attributes['itemid'].value, $scope.editor[0].attributes['mnemonicid'].value, $scope.editor.froalaEditor('html.get'), clientConfig.uiType.general);
                    $scope.editor.froalaEditor('events.trigger', 'charCounter.update');
                }

                //pass functions to get and set html text of parent text box to avoid passing large block of text
                $scope.newScope.getValue = this.html.get;
                $scope.newScope.setValue = this.html.set;
                $scope.editor = obj;

                //pass in the registerDialogClose so the popup dialog could pass the close function to the $mdDialog to call when user clicks outside it
                $scope.newScope.registerDialogClose = registerDialogClose;

                $scope.newScope.answer = answer;
                $mdDialog.show({
                    scope: $scope.newScope,
                    controller: MsRichTextEditorDialogController,
                    preserveScope:true,
                    animate: 'full-screen-dialog',
                    controllerAs: 'vm',
                    templateUrl: 'app/core/directives/ms-template/templates/ms-rich-text-editor/dialog/ms-rich-text-editor.dialog.html',
                    //parent: angular.element(document.body),
                    //targetEvent: ev,
                    clickOutsideToClose: true,
                    onRemoving: function() {
                        if (dialogClose) {
                            dialogClose();
                        }
                    },
                    fullscreen: true
                });
            }
        });

        $scope.froalaOptions = {
            toolbarButtons: [
                "custom-fullscreen",
                "bold",
                "italic",
                "underline",
                "strikeThrough",
                "subscript",
                "superscript",
                "fontFamily",
                "fontSize",
                "color",
                "inlineStyle",
                "paragraphStyle",
                "paragraphFormat",
                "align",
                "formatOL",
                "formatUL",
                "outdent",
                "indent",
                "quote",
                "insertHR",
                "insertLink",
                "insertImage",
                "insertTable",
                "undo",
                "redo",
                "clearFormatting",
                "selectAll"
            ],
            toolbarSticky: false,
            toolbarInline: false,
            placeholderText: $scope.answer || 'Enter text here',
            pluginsEnabled: ['align', 'colors', 'draggable', 'entities', 'fontFamily',
                'fontSize', 'fullscreen', 'image', 'inlineStyle', 'lineBreaker', 'link', 'lists', 'paragraphFormat',
                'paragraphStyle', 'quickInsert', 'quote', 'save', 'table', 'url', 'wordPaste'],
            key: clientConfig.appSettings.textEditorApiKey
        };
    }

    // check for default Text value purposed
    function removeHtmlTags(value){
        value = value.replace(/<p[^>]*>/g, "").replace(/<\/?p[^>]*>/g, ""); 
        return value;
    }

    /** @ngInject */
    function msRichTextEditorDirective($compile, clientConfig, templateBusinessSave)
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
                return function ($scope)
                {
                    if (!$scope.value) {
                        $scope.value = $scope.$parent.value;
                    }
                    var html = '',
                        textEditorId = 'textEditor_' + $scope.itemid;

                    if($scope.prompt && $scope.prompt !== '') {
                        html += '<div><ms-label value="' + $scope.prompt + '"></ms-label></div>';
                    }
                    html += '<div id="textEditor" itemid="'+ $scope.itemid +'" ' +
                        'mnemonicid="' + $scope.mnemonicid + '" answer="' + $scope.answer + '"  "></div>';
                    el.find('#textEditorContent').append($compile(html)($scope));
                    el.find('#textEditor').froalaEditor($scope.froalaOptions);
                    el.find('#textEditor').froalaEditor('html.set', $scope.value);
                    el.find('#textEditor').froalaEditor()
                    .on('froalaEditor.image.beforeUpload', function (e, editor, files) {
                        if (files.length) {
                        // Create a File Reader.
                        var reader = new FileReader();
                    
                        // Set the reader to insert images when they are loaded.
                        reader.onload = function (e) {
                            var result = e.target.result;
                            editor.image.insert(result, null, null, editor.image.get());
                        };
                        
                        // Read image as base64.
                        reader.readAsDataURL(files[0]);
                        }

                        // Stop default upload chain.
                        return false;
                        })
                    //free up memory on client side
                    $scope.value = '';

                    //manually setting text doesn't update the character count
                    el.find('#textEditor').froalaEditor('events.trigger', 'charCounter.update');

                    el.find('#textEditor').on('froalaEditor.blur',
                        function (e, editor) {
                            //console.log('Save from content area');
                            templateBusinessSave.getReadyForAutoSave($scope.itemid, $scope.mnemonicid, editor.html.get(), clientConfig.uiType.general);
                        }
                    );
                };
            }
        };
    }

})();