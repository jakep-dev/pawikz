/**
 * Created by sherindharmarajan on 11/18/15.
 */
(function() {
    'use strict';

    angular
        .module('blocks.error')
        .factory('myInterceptor', error);


    /* @ngInject */
    function error(logger) {
        logger.info('$log is here to show you that this is a regular factory with injection');

        var myInterceptor = { };

        return myInterceptor;
    }
})();
