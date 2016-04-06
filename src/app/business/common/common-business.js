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
        this.companyId = null;

        var isTemplateExpandAll = false;
        Object.defineProperty(this, 'isTemplateExpandAll', {
            enumerable: true,
            configurable: false,
            get: function() {
                console.log('get!');
                return isTemplateExpandAll;
            },
            set: function(value) {
                isTemplateExpandAll = value;
                this.emitMsg('IsTemplateExpanded');
                console.log('set!');
            }
        });


        this.emitMsg = function(msg) {
            console.log("Emitting changed event");
            $rootScope.$emit(msg);
        };

        this.onMsg = function(msg, scope, func) {
            var unbind = $rootScope.$on(msg, func);
            scope.$on('$destroy', unbind);
        };

    }
})();
