(function(newsRoute) {
    var _ = require('underscore');
    var u = require('underscore');
    var config = null;
    var client = null;
    var logger;

    function getServiceDetails(serviceName) {
        return _.find(config.restcall.service, { name: serviceName });
    }

    function attachNewsArticles(mnemonic, callback) {
        var context = new Object();
        context.service = getServiceDetails('news');
        context.methodName = '';
        context.results = {
            data: null,
            error: null
        };

        if (!_.isUndefined(context.service) && !_.isNull(context.service)) {
            context.methodName = context.service.methods.saveChartSettings;
        }

        context.args = {
            data: {
                project_id: mnemonic.data.project_id,
                user_id: 56838,
                ssnid: mnemonic.token,
                articles: mnemonic.data.articles
            },
            headers: { "Content-Type": "application/json" }
        };

        context.url = config.restcall.url + '/' + context.service.name + '/' + context.methodName;

        client.post(context.url, context.args,
            function (data, response) {
                logger.logIfHttpErrorRequest(context.url, context.args, data, response, mnemonic.token);
                context.results.data = data;
                callback(null, context.results);
            }
        ).on('error',
            function(err) {
                logger.errorRequest('[attachNewsArticles]Error', mnemonic.token);
                logger.errorRequest(err, mnemonic.token);
                context.results.error = 'Error saving boormarked articles';
                callback(null, context.results);
            }
        );
    }

    newsRoute.attachNewsArticles = attachNewsArticles;

    newsRoute.init = function(app, c, log) {
        config = c;
        client = config.restcall.client;
        logger = log;

        config.parallel([
            app.post('/api/news/search', search),
            app.post('/api/news/attachNewsArticles', attachNewsArticles),
            app.post('/api/news/getAttachedArticles', getAttachedArticles),
            app.post('/api/news/showArticleContent', showArticleContent),
            app.post('/api/news/deleteAttachedArticles', deleteAttachedArticles)
        ]);

        function getServiceDetails(serviceName) {
            return _.find(config.restcall.service, { name: serviceName });
        }

        function showArticleContent(req, res, next) {
            var service = getServiceDetails('news');

            var methodName = '';

            if (!_.isUndefined(service) && !_.isNull(service)) {
                logger.debugRequest(service.name, req);
                methodName = service.methods.showArticleContent;
            }

            var args = {
                parameters: {
                    url: req.body.url,
                    ssnid: req.headers['x-session-token']
                }
            };
            var url = config.restcall.url + '/' + service.name + '/' + methodName;
            client.get(url, args,
                function (data, response) {
                    logger.logIfHttpErrorRequest(url, args, data, response, args.parameters.ssnid);
                    res.status(response.statusCode).send(data);
                }
            ).on('error',
                function (err) {
                    logger.errorRequest('[showArticleContent]Error', args.parameters.ssnid);
                    logger.errorRequest(err, args.parameters.ssnid);
                }
            );
        }

        function search(req, res, next) {
            var service = getServiceDetails('news');

            var methodName = '';

            if (!_.isUndefined(service) && !_.isNull(service)) {
                logger.debugRequest(service.name, req);
                methodName = service.methods.search;
            }

            var args = {
                parameters: {
                    company_id: req.body.companyId,
                    user_id: req.body.userId,
                    page_no: req.body.pageNo,
                    sort_by: req.body.sortBy,
                    search_within: req.body.searchWithin,
                    num_per_page: req.body.numPerPage,
                    search_name: req.body.searchName,
                    ssnid: req.headers['x-session-token']
                }
            };
            var url = config.restcall.url + '/' + service.name + '/' + methodName;
            client.get(url, args,
                function (data, response) {
                    logger.logIfHttpErrorRequest(url, args, data, response, args.parameters.ssnid);
                    res.status(response.statusCode).send(data);
                }
            ).on('error',
                function (err) {
                    logger.errorRequest('[search]Error', args.parameters.ssnid);
                    logger.errorRequest(err, args.parameters.ssnid);
                }
            );
        }

        function attachNewsArticles(req, res, next) {
            var service = getServiceDetails('news');

            var methodName = '';

            if (!_.isUndefined(service) && !_.isNull(service)) {
                methodName = service.methods.attachNewsArticles;
            }

            var args = {
                data: {
                    user_id: req.body.user_id, //user_id,
                    ssnid: req.headers['x-session-token'],
                    project_id: req.body.project_id,
                    articles: req.body.articles
                },
                headers: { 'Content-Type': 'application/json' }
            };
            var url = config.restcall.url + '/' + service.name + '/' + methodName;
            client.post(url, args,
                function (data, response) {
                    logger.logIfHttpErrorRequest(url, args, data, response, args.data.ssnid);
                    res.send(data);
                }
            ).on('error',
                function (err) {
                    logger.errorRequest('[attachNewsArticles]Error', args.data.ssnid);
                    logger.errorRequest(err, args.data.ssnid);
                }
            );
        }

        function getAttachedArticles(req, res, next) {
            var service = getServiceDetails('news');

            var methodName = '';

            if (!_.isUndefined(service) && !_.isNull(service)) {
                logger.debugRequest(service.name, req);
                methodName = service.methods.getAttachedArticles;
            }

            var args = {
                parameters: {
                    project_id: req.body.projectId,
                    step_id: req.body.stepId,
                    ssnid: req.headers['x-session-token']
                }
            };
            var url = config.restcall.url + '/' + service.name + '/' + methodName;
            client.get(url, args,
                function (data, response) {
                    logger.logIfHttpErrorRequest(url, args, data, response, args.parameters.ssnid);
                    res.status(response.statusCode).send(data);
                }
            ).on('error',
                function (err) {
                    logger.errorRequest('[getAttachedArticles]Error', args.parameters.ssnid);
                    logger.errorRequest(err, args.parameters.ssnid);
                }
            );
        }

        function deleteAttachedArticles(req, res, next) {

            var service = getServiceDetails('news');

            var methodName = '';

            if (!_.isUndefined(service) && !_.isNull(service)) {
                methodName = service.methods.deleteAttachedArticles;
            }

            var args = {
                data: {
                    project_id: req.body.project_id,
                    user_id: req.body.user_id,
                    ssnid: req.headers['x-session-token'],
                    bookmarks: req.body.bookmarks
                },
                headers: { 'Content-Type': 'application/json' }
            };
            var url = config.restcall.url + '/' + service.name + '/' + methodName;
            client.post(url, args,
                function (data, response) {
                    logger.logIfHttpErrorRequest(url, args, data, response, args.data.ssnid);
                    res.send(data);
                }
            ).on('error',
                function (err) {
                    logger.errorRequest('[deleteAttachedArticles]Error', args.data.ssnid);
                    logger.errorRequest(err, args.data.ssnid);
                }
            );
        }
    };

})(module.exports);