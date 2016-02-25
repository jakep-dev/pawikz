/**
 * Created by sherindharmarajan on 1/4/16.
 */
(function() {
    'use strict';

    angular
        .module('app.business')
        .service('commonBusiness', commonBusiness);

    /* @ngInject */
    function commonBusiness($rootScope) {
        this.projectId = null;
        this.userId = null;
        this.stepId = null;


        this.emitMsg = function(msg) {
            console.log("Emitting changed event");
            $rootScope.$emit("chartDataChanged");
        };

        this.onMsg = function(msg, scope, func) {
            var unbind = $rootScope.$on(msg, func);
            scope.$on('$destroy', unbind);
        };

    }
})();
