(function() {
    'use strict';

    angular
        .module('blocks.trace')
        .factory('trace', trace);

    /* @ngInject */
    function trace() {
        var service = {
            print: printStackTrace
        }

        return service;
    }
}());
