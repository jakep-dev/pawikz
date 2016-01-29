(function ()
{
    'use strict';

    angular
        .module('app.core')
        .directive('msRadioButton', msRadioButtonDirective);

    /** @ngInject */
    function msRadioButtonDirective()
    {
        return {
            restrict: 'E',
            scope   : {
                detail: '='
            },
            templateUrl: 'app/core/directives/ms-template/templates/ms-radio-button/ms-radio-button.html',
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