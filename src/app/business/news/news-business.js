/**
 * Created by sherindharmarajan on 1/19/16.
 */
(function() {
    'use strict';

    angular
        .module('app.news.business', [])
        .factory('newsBusiness', newsBusiness);

    /* @ngInject */
    function newsBusiness(newsService, dialog, commonBusiness) {

        var business = {
            selectedNews: [],
            showArticleContent: showArticleContent,
            bookmarkNewsArticle: bookmarkNewsArticle,
            alertMessage: alertMessage
                // loadData: loadData
        };

        return business;

        function showArticleContent(title, url) {

            newsService.showArticleContent(url).then(function(response) {
                console.log(response.htmlContent);
                dialog.notify(title, null,
                    response.htmlContent,
                    null,
                    null, null, false);
            });
        }


        function alertMessage(scope) {
            var val = false;

            _.filter(scope, function(article) {
                if (article.isSelected) {
                    val = article.isSelected;
                }
            });

            if (!val) {
                dialog.alert("Bookmark News", "Please select news item(s)",
                    null, {
                        ok: {
                            name: 'ok',
                            callBack: function() {}
                        }
                    }, '', null, null);
                dialog.close();
            }
        }

        function existingArticle(scope) {

            var verification = _.find(scope, function(details) {

            });
            return '';
        }


        function bookmarkNewsArticle(scope, validation) {
            if (validation) {
                dialog.confirm('Bookmark News', 'Are you sure you want to include the full text of the checked article(s) in your work-up?', null, {
                    ok: {
                        name: 'yes',
                        callBack: function() {

                            // toggleCollapse();

                            commonBusiness.emitMsg('-Collapsed');

                            var selectAttachment = [];
                            _.each(scope, function(article) {

                                if (article.isSelected) {

                                    selectAttachment.push({
                                        step_id: commonBusiness.stepId,
                                        article_id: article.resourceId,
                                        title: article.title,
                                        article_url: article.externalUrl,
                                        dockey: angular.isUndefined(article.dockey) ? '' : article.dockey,
                                        collection: angular.isUndefined(article.collection) ? '' : article.collection,
                                    });
                                }

                            });

                            newsService.attachNewsArticles(commonBusiness.projectId, commonBusiness.userId, selectAttachment).then(
                                function(response) {
                                    business.selectedNews.push.apply(business.selectedNews, selectAttachment);
                                    commonBusiness.emitMsg('news-bookmark');
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
            } else {
                alertMessage(scope);
            }
        }
    }
})();