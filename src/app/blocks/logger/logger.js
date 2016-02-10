(function() {
    'use strict';

    angular
        .module('blocks.logger')
        .factory('logger', logger);

    /* @ngInject */
    function logger($log, $window, $location) {
        var service = {
            error: error,
            debug: debug
        }

        return service;

        function error(message)
        {
            $location.url('/');
            // preserve default behaviour
            $log.error.apply($log, arguments);


            // use AJAX (in this example jQuery) and NOT
            // an angular service such as $http
            $.ajax({
                type: "POST",
                url: "/api/errorLog",
                contentType: "application/json",
                data: angular.toJson({
                    url: $window.location.href,
                    message: message,
                    type: "error"
                })
            });
        }

        function debug(message)
        {
            $log.log.apply($log, arguments);

            // use AJAX (in this example jQuery) and NOT
            // an angular service such as $http
            $.ajax({
                type: "POST",
                url: "/api/debugLog",
                contentType: "application/json",
                data: angular.toJson({
                    url: $window.location.href,
                    message: message,
                    type: "debug"
                })
            });
        }
    }
}());
