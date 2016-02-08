/**
 * Created by sherindharmarajan on 1/4/16.
 */
(function() {
    'use strict';

    angular
        .module('app.business')
        .service('authBusiness', authBusiness);

    /* @ngInject */
    function authBusiness(commonBusiness, store) {
        this.userInfo = null;
        var userName = null;

        Object.defineProperty(this, 'userName', {
            enumerable: true,
            configurable: false,
            get: function() {
                console.log('auth get!');
                return userName || store.get('x-session-user');;
            },
            set: function(value) {
                userName = value;
                store.set('x-session-user', userName);
                commonBusiness.emitMsg('UserName');
                console.log('auth set!');
            }
        });
    }
})();
