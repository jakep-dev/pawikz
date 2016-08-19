(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('MsRichTextEditorController', MsRichTextEditorController)
        .directive('msRichTextEditor', msRichTextEditorDirective);


    /** @ngInject */
    function MsRichTextEditorController($scope, templateBusiness, clientConfig)
    {
        $scope.myHtml = "";
        $scope.froalaOptions = {
            toolbarButtons: [
                  "fullscreen"
                , "bold"
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
                if(newValue !== oldValue)
                {
                    templateBusiness.getReadyForAutoSave($scope.itemid, $scope.mnemonicid, newValue);
                }
            }
        );
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
            link: function (scope, element, attibutes) {
                element.find('#textEditor')
                    .on('froalaEditor.commands.before', function (e, editor, cmd, param1, param2) {
                        if (cmd == 'fullscreen') {
                            var obj = $(this).parents('[ms-scroll]')[0];
                            if (!(obj === undefined) && !$(this).froalaEditor('fullscreen.isActive')) {
                                scope.offset = $(obj).scrollTop();
                                $(obj).scrollTop(0);
                            }
                        }
                    });
                element.find('#textEditor')
                    .on('froalaEditor.commands.after', function (e, editor, cmd, param1, param2) {
                        if (cmd == 'fullscreen') {
                            var obj = $(this).parents('[ms-scroll]')[0];
                            if (!(obj === undefined) && !$(this).froalaEditor('fullscreen.isActive')) {
                                $(obj).scrollTop(scope.offset);
                            }
                        }
                    });

                var html = '';

                if(scope.prompt && scope.prompt !== '')
                {
                    html += '<div><ms-label value="' + scope.prompt + '"></ms-label></div>';
                }

                html += '<div id="textEditor" froala="froalaOptions" ng-model="value"></div>';
                element.find('#textEditorContent').append($compile(html)(scope));
            }
        };
    }

})();