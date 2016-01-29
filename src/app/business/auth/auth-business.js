/**
 * Created by sherindharmarajan on 1/4/16.
 */
(function() {
    'use strict';

    angular
        .module('app.business')
        .factory('authBusiness', authBusiness);

    /* @ngInject */
    function authBusiness() {

        var business = {
            userInfo: null,
            userFullName: null
        };

        return business;
    }
})();
