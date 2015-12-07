/**
 * Created by sherindharmarajan on 12/5/15.
 */
(function ()
{
    'use strict';

    angular
        .module('app.core')
        .directive('msTable', msTableDirective);

    /** @ngInject */
    function msTableDirective()
    {
        return {
            restrict: 'E',
            scope   : {
            }
        };
    }
})();