(function ()
{
    'use strict';

    angular
        .module('app.core')
        .directive('msDropdown', msDropDownDirective);

    /** @ngInject */
    function msDropDownDirective()
    {
        return {
            restrict: 'E',
            scope   : {
                tearsheet: '='
            },
            templateUrl: 'app/core/directives/ms-template/templates/ms-dropdown/ms-dropdown.html',
            link: function(scope, el, attrs)
            {
            }
        };
    }

})();