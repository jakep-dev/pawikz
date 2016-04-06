/**
 * Created by sherindharmarajan on 1/19/16.
 */
(function() {
    'use strict';

    angular
        .module('app.business')
        .factory('menuBusiness', menuBusiness);

    /* @ngInject */
    function menuBusiness() {

        var business = {
            breadcrumb: null,
            toolbar: null,
            sidenav: null
        };

        return business;
    }
})();
