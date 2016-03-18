(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('MsRichTextEditorController', MsRichTextEditorController)
        .directive('msRichTextEditor', msRichTextEditorDirective);


    /** @ngInject */
    function MsRichTextEditorController($scope, templateBusiness)
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
            placeholderText: $scope.prompt || 'Enter text here',
            key: 'VqsaF-10kwI2A-21yhvsdlH3gjk=='
        }

        var isAutoSaveEnabled = false;
        $scope.$watch(
            "value",
            function handleAutoSave(value) {
                if(isAutoSaveEnabled)
                {
                    templateBusiness.getReadyForAutoSave($scope.itemid, $scope.mnemonicid, value);
                }
                isAutoSaveEnabled = true;
            }
        );
    }

    /** @ngInject */
    function msRichTextEditorDirective()
    {
        return {
            restrict: 'E',
            scope   : {
                itemid: '@',
                mnemonicid: '@',
                prompt: '@',
                value: '@',
                isdisabled: '=?'
            },
            controller: 'MsRichTextEditorController',
            templateUrl: 'app/core/directives/ms-template/templates/ms-rich-text-editor/ms-rich-text-editor.html',
            link: function (scope, element, attibutes) {
                var id = scope.mnemonicid + '__' + scope.itemid;
                element[0].firstChild.id = id;
                $('#' + id).each(function (index, value) {
                    $(this).on('froalaEditor.commands.before', function (e, editor, cmd, param1, param2) {
                        if (cmd == 'fullscreen') {
                            console.log('Before Full Screen button.');
                            var obj = $(this).parent();
                            while ($(obj).attr('ms-scroll') === undefined) {
                                obj = $(obj).parent();
                            }
                            if (!$(this).froalaEditor('fullscreen.isActive')) {
                                scope.offset = $(obj).scrollTop();
                                $(obj).scrollTop(0);
                                console.log(scope.offset);
                            }
                        }
                    });
                    $(this).on('froalaEditor.commands.after', function (e, editor, cmd, param1, param2) {
                        if (cmd == 'fullscreen') {
                            console.log('After Full Screen button.');
                            var obj = $(this).parent();
                            while ($(obj).attr('ms-scroll') === undefined) {
                                obj = $(obj).parent();
                            }
                            if (!$(this).froalaEditor('fullscreen.isActive')) {
                                $(obj).scrollTop(scope.offset);
                                console.log(scope.offset);
                            }
                        }
                    });
                });
            }
        };
    }

})();