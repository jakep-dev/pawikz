(function ()
{
    'use strict';

    angular
        .module('app.core')
        .directive('msExport', msExportDirective);

    /** @ngInject */
    function msExportDirective(toast)
    {
        return {
            restrict: 'A',
            link:function(scope, el, attr)
            {

                scope.$on('export-pdf', function(e, d){
                    toast.simpleToast('Downloading Pdf!');

                    el.tableExport({type:'pdf', pdfFontSize:'7',escape:'false', htmlContent:'false'
                    });
                });

                scope.$on('export-excel', function(e, d){
                    toast.simpleToast('Downloading Excel!');

                    el.tableExport({type:'excel', escape:false});
                });

                scope.$on('export-doc', function(e, d){

                    toast.simpleToast('Downloading Doc!');

                    el.tableExport({type: 'doc', escape:false});
                });
            }
        }
    }

})();