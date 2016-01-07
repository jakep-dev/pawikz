/**
 * Created by sherindharmarajan on 1/4/16.
 */
(function() {
    'use strict';

    angular
        .module('app.data')
        .factory('toolbarService', toolbarService);

    toolbarService.$inject = ['$http', '$location', '$q', 'clientConfig'];

    /* @ngInject */
    function toolbarService($http, $location, $q, clientConfig) {
        var readyPromise;

        var service = {
            get: get
        };

        return service;


        //Get User Details
        function get(token)
        {
            var url = clientConfig.endpoints.toolBarEndPoint.get.concat(token);

            return $http.get(url)
                .then(function(data, status, headers, config)
                {
                    return data.data;
                })
                .catch(function(message) {
                    $location.url('/');
                });
        }

    }
})();
