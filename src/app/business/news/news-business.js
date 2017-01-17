/**
 * Created by sherindharmarajan on 1/19/16.
 */
(function() {
    'use strict';

    angular
        .module('app.news.business', [])
        .factory('newsBusiness', newsBusiness);

    /* @ngInject */
    function newsBusiness() {

        var business = {
           selectedNews: []
        };

        return business;
    }
})();
