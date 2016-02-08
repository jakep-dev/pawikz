(function() {
    'use strict';

    angular
        .module('blocks.exception')
        .factory('exception', exception);

    /* @ngInject */
    function exception($log, $window, traceService) {

        var service = {
            error: error
        };

        return service;

        function error(exception, cause){

            $log.error.apply($log, arguments);

            // now try to log the error to the server side.
            try
            {
                var errorMessage = exception.toString();

                // use our traceService to generate a stack trace
                var stackTrace = traceService.print({e: exception});

                // use AJAX (in this example jQuery) and NOT
                // an angular service such as $http
                $.ajax({
                    type: "POST",
                    url: "/logger",
                    contentType: "application/json",
                    data: angular.toJson({
                        url: $window.location.href,
                        message: errorMessage,
                        type: "exception",
                        stackTrace: stackTrace,
                        cause: ( cause || "")
                    })
                });
            } catch (loggingError){
                $log.warn("Error server-side logging failed");
                $log.log(loggingError);
            }
        }

    }
})();
