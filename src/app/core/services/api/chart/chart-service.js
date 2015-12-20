/**
 * Created by sherindharmarajan on 12/20/15.
 */

(function() {
    'use strict';

    angular
        .module('app.core')
        .factory('chartService', chartService);

    chartService.$inject = ['$http', '$location', '$q', 'clientConfig'];

    /* @ngInject */
    function chartService($http, $location, $q, clientConfig) {
        var readyPromise;

        var service = {
            get: get,
            ready: ready
        };

        return service;


        function get() {

          return '';
        }



        function getReady() {
            if (!readyPromise) {
                // Apps often pre-fetch session data ("prime the app")
                // before showing the first view.
                // This app doesn't need priming but we add a
                // no-op implementation to show how it would work.

                readyPromise = $q.when(service);
            }
            return readyPromise;
        }

        function ready(promisesArray) {
            return getReady()
                .then(function() {
                    return promisesArray ? $q.all(promisesArray) : readyPromise;
                })
                .catch();
        }
    }
})();
