(function ()
{
    'use strict';

    angular
        .module('app.core')
        .directive('msHeader', msHeaderDirective);

    /** @ngInject */
    function msHeaderDirective($compile)
    {
        return {
            restrict: 'E',
            scope:
            {
                tearsheet: '='
            },
            link:function(scope, el, attrs)
            {
                switch(scope.tearsheet.type)
                {
                    case 'header1':
                        el.append($compile('<ms-Header1 value="'+ scope.tearsheet.value +'"></ms-Header1>')(scope));
                        break;
                    case 'header2':
                        el.append($compile('<ms-Header2 value="'+ scope.tearsheet.value +'"></ms-Header2>')(scope));
                        break;
                    case 'header3':
                        el.append($compile('<ms-Header3 value="'+ scope.tearsheet.value +'"></ms-Header3>')(scope));
                        break;
                    case 'header4':
                        el.append($compile('<ms-Header4 value="'+ scope.tearsheet.value +'"></ms-Header4>')(scope));
                        break;
                    case 'header5':
                        el.append($compile('<ms-Header5 value="'+ scope.tearsheet.value +'"></ms-Header5>')(scope));
                        break;
                    case 'header6':
                        el.append($compile('<ms-Header6 value="'+ scope.tearsheet.value +'"></ms-Header6>')(scope));
                        break;
                }
            }
        };
    }

})();