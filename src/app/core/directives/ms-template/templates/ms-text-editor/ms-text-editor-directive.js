(function ()
{
    'use strict';

    angular
        .module('app.core')
        .directive('msTextEditor', msTextEditorDirective);

    /** @ngInject */
    function msTextEditorDirective()
    {
        return {
            restrict: 'E',
            scope   : {
                detail: '='
            },
            templateUrl: 'app/core/directives/ms-template/templates/ms-text-editor/ms-text-editor.html',
            compile: function(el, attr)
            {

            }
        };
    }

})();