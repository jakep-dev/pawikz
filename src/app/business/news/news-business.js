/**
 * Created by sherindharmarajan on 1/19/16.
 */
(function() {
    'use strict';

    angular
        .module('app.news.business', [])
        .factory('newsBusiness', newsBusiness);

    /* @ngInject */
    function newsBusiness(newsService, dialog) {

        var business = {
            selectedNews: [],
            showArticleContent: showArticleContent
        };

        return business;

        function showArticleContent(title, url) {
            newsService.downloadNews(url).then(function(data) {
                //console.log(data.data) 
                dialog.notify(title, null,
                    data,
                    null,
                    null, null, false);
            });
        }
    }
})();