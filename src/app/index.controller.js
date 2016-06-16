(function ()
{
    'use strict';

    angular
        .module('advisen')
        .controller('AppController', AppController);

    /** @ngInject */
    function AppController(fuseTheming)
    {
        var vm = this;

        // Data
        vm.themes = fuseTheming.themes;

        //////////
    }
})();