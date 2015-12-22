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
            get: get
        };

        return service;


        function get() {

          return '';
        }

    }
})();
