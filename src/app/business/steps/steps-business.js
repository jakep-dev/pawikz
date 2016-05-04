/**
 * Created by sherindharmarajan on 1/4/16.
 */
(function() {
    'use strict';

    angular
        .module('app.business')
        .service('stepsBusiness', stepsBusiness);

    /* @ngInject */
    function stepsBusiness() {
        this.stepId = null;
        this.stepDetails = null;

        Object.defineProperty(this, 'stepDetails', {
            enumerable: true,
            configurable: false,
            get: function() {
                return stepDetails;
            },
            set: function(value) {
                stepDetails = value;
            }
        });

    }
})();
