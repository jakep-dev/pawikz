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
            toolbarButtons : ["fullscreen","bold","italic","underline","strikeThrough","subscript","superscript","fontFamily","fontSize","color","emoticons","inlineStyle","paragraphStyle","paragraphFormat","align","formatOL","formatUL","outdent","indent","quote","insertHR","insertLink","insertImage","insertVideo","insertFile","insertTable","undo","redo","clearFormatting","selectAll","html"],
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
            templateUrl: 'app/core/directives/ms-template/templates/ms-rich-text-editor/ms-rich-text-editor.html'
        };
    }

})();