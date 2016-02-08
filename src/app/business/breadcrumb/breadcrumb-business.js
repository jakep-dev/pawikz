/**
 * Created by sherindharmarajan on 1/4/16.
 */
(function() {
    'use strict';

    angular
        .module('app.business')
        .service('breadcrumbBusiness', breadcrumbBusiness);

    /* @ngInject */
    function breadcrumbBusiness($rootScope, commonBusiness) {
        var title = null;
        Object.defineProperty(this, 'title', {
            enumerable: true,
            configurable: false,
            get: function() {
                console.log('get!');
                return title;
            },
            set: function(value) {
                title = value;
                commonBusiness.emitMsg('Dashboard');
                console.log('set!');
            }
        });
    }
})();
