(function ()
{
    'use strict';

    angular
        .module('app.core')
        .filter('msDate', msDateFilter);

    /** @ngInject */
    function msDateFilter()
    {
        return function(date)
        {


        };
    }

})();