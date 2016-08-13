(function ()
{
    'use strict';

    angular
        .module('app.core')
        .filter('msCurrency', msCurrencyFilter);

    /** @ngInject */
    function msCurrencyFilter()
    {
        return function(currency)
        {


        };
    }

})();