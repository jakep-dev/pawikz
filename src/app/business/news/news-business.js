/**
 * Created by sherindharmarajan on 1/19/16.
 */
(function() {
    'use strict';

    angular
        .module('app.news.business', [])
        .factory('newsBusiness', newsBusiness);

    /* @ngInject */
    function newsBusiness(newsService, dialog, commonBusiness, clientConfig) {

        var business = {
            selectedArticles : [],
            showArticleContent: showArticleContent,
            bookmarkNewsArticle: bookmarkNewsArticle,
            removeBookmark: removeBookmark
        };

        return business;

        function showArticleContent(title, url) {

            newsService.showArticleContent(url).then(function(response) {
                dialog.notify(title, null,
                    response.htmlContent,
                    null,
                    null, null, false);
            });
        }

        function bookmarkNewsArticle(selectedArticles, onBookmarkNewsArticleStart, onBookmarkNewsArticleComplete, itemId, mnemonicId) {
            
                dialog.confirm(clientConfig.messages.newsArticle.bookmarkNewsItem.title, 
                                clientConfig.messages.newsArticle.bookmarkNewsItem.content , null, {
                    ok: {
                        name: 'yes',
                        callBack: function() {

                            if (onBookmarkNewsArticleStart) {
                                onBookmarkNewsArticleStart();
                            }

                            var selectAttachment = [];
                            var article = _.find(selectedArticles, {itemid: itemId, mnemonicid: mnemonicId, step_id: commonBusiness.stepId}); 

                                if(article){
                                    _.each(article.news_items, function(item) {
                                        if (item.isSelected) {
                                            selectAttachment.push({
                                                step_id: commonBusiness.stepId,
                                                article_id: item.resourceId,
                                                title: item.title,
                                                article_url: item.externalUrl,
                                                dockey: angular.isUndefined(item.dockey) ? '' : item.dockey,
                                                collection: angular.isUndefined(item.collection) ? '' : item.collection,
                                            });
                                        }
                                    });
                                }
                            newsService.attachNewsArticles(commonBusiness.projectId, commonBusiness.userId, selectAttachment).then(
                                function (response) {
                                    onBookmarkNewsArticleComplete(selectAttachment);
                                    //business.selectedNews.push.apply(business.selectedNews, selectAttachment);
                                    //commonBusiness.emitMsg('news-bookmark');
                                }
                            );

                            dialog.close();
                        }
                    },
                    cancel: {
                        name: 'no',
                        callBack: function() {
                            return false;
                        }
                    }
                });
        }

         function removeBookmark(scope, callback) {

            dialog.confirm(clientConfig.messages.newsArticle.deleteNewsItem.title, 
                           clientConfig.messages.newsArticle.deleteNewsItem.content, null, {
                ok: {
                    name: 'yes',
                    callBack: function() {

                        var removeAttachment = [];

                        _.each(scope, function(details) {

                            if(details.isSelected){
                                removeAttachment.push({
                                    bookmarkId: details.bookmarkId,
                                    resourceId: details.resourceId,
                                    stepId: details.stepId
                                });
                            }

                            
                        });

                        console.log(removeAttachment);

                        newsService.deleteAttachedArticles(commonBusiness.projectId, commonBusiness.userId, removeAttachment).then(
                            function(response) {
                                console.log(response);
                                callback();
                            }
                        );

                        dialog.close();

                    }
                },
                cancel: {
                    name: 'no',
                    callBack: function() {
                        return false;
                    }
                }
            });
        }
    }
})();