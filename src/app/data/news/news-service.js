(function() {
    'use strict';

    angular
        .module('app.news.service', [])
        .factory('newsService', newsService);

    /* @ngInject */
    function newsService($http, $q, clientConfig, logger) {
        var readyPromise;

        var service = {
            search: search,
            attachNewsArticles: attachNewsArticles,
            getAttachedArticles: getAttachedArticles,
            showArticleContent: showArticleContent,
            downloadNews: downloadNews
        };

        return service;


        function showArticleContent(url) {
            var input = {
                url: url
            }

            return $http({
                    url: clientConfig.endpoints.newsEndPoint.showArticleContent,
                    method: "POST",
                    data: input,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json"
                })
                .then(function(data, status, headers, config) {
                    return data.data;
                })
                .catch(function(error) {
                    logger.error(JSON.stringify(error));
                });
        }

        function downloadNews(url) {
            return $http({
                    url: url,
                    method: "GET",
                    contentType: "application/xml; charset=utf-8",
                    dataType: "xml"
                })
                .then(function(data, status, headers, config) {
                    console.log(data);
                    return data;
                })
                .catch(function(error) {
                    logger.error(JSON.stringify(error));
                });
        }

        function getArticle(url) {
            var input = {
                url: url
            };

            return $http({
                    url: clientConfig.endpoints.newsEndPoint.search,
                    method: "POST",
                    data: input,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json"
                })
                .then(function(data, status, headers, config) {
                    return data.data;
                })
                .catch(function(error) {
                    logger.error(JSON.stringify(error));
                });
        }

        function search(companyId, userId, pageNo, sortBy, searchWithin, numPerPage, searchName) {
            var input = {
                companyId: companyId,
                userId: userId,
                pageNo: pageNo,
                sortBy: sortBy,
                searchWithin: searchWithin,
                numPerPage: numPerPage,
                searchName: searchName
            };

            return $http({
                    url: clientConfig.endpoints.newsEndPoint.search,
                    method: "POST",
                    data: input,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json"
                })
                .then(function(data, status, headers, config) {
                    return data.data;
                })
                .catch(function(error) {
                    logger.error(JSON.stringify(error));
                });
        }

        function attachNewsArticles(projectId, userId, articles) {
            return $http({
                    method: "POST",
                    url: "/api/news/attachNewsArticles",
                    data: {
                        user_id: userId,
                        project_id: projectId,
                        articles: articles
                    }
                })
                .then(function(data, status, headers, config) {
                    return data.data;
                })
                .catch(function(error) {
                    logger.error(JSON.stringify(error));
                });
        }

        function getAttachedArticles(projectId, stepId) {
            var input = {
                projectId: projectId,
                stepId: stepId
            };

            return $http({
                    url: clientConfig.endpoints.newsEndPoint.getAttachedArticles,
                    method: "POST",
                    data: input,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json"
                })
                .then(function(data, status, headers, config) {
                    return data.data;
                })
                .catch(function(error) {
                    logger.error(JSON.stringify(error));
                });
        }
    }
})();