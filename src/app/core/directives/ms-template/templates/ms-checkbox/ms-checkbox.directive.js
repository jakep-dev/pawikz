(function ()
{
    'use strict';

    angular
        .module('app.core')
        .directive('msCheckbox', msCheckboxDirective);

    /** @ngInject */
    function msCheckboxDirective()
    {
        return {
            restrict: 'E',
            scope   : {
                detail: '='
            },
            templateUrl: 'app/core/directives/ms-template/templates/ms-checkbox/ms-checkbox.html',
            compile: function(el, attr)
            {
                angular.extend({
                    values: [{
                        id: 0,
                        shortName: 'All'
                    }],
                    isdisabled:false
                }, detail);
            }
        };
    }

})();