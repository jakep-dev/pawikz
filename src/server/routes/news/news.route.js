(function(newsRoute) {
    var _ = require('underscore');
    var u = require('underscore');
    var config = null;
    var client = null;

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

        client.post(context.url, context.args, function(data, response) {
            context.results.data = data;
            callback(null, context.results);
        }).on('error',
            function(err) {
                context.results.error = 'Error saving boormarked articles';
                callback(null, context.results);
            }
        );
    }

    newsRoute.attachNewsArticles = attachNewsArticles;

    newsRoute.init = function(app, c) {
        config = c;
        client = config.restcall.client;

        config.parallel([
            app.post('/api/news/search', search),
            app.post('/api/news/attachNewsArticles', attachNewsArticles),
            app.post('/api/news/getAttachedArticles', getAttachedArticles),
            app.post('/api/news/showArticleContent', showArticleContent)
        ]);

        function getServiceDetails(serviceName) {
            return _.find(config.restcall.service, { name: serviceName });
        }

        function showArticleContent(req, res, next) {
            var service = getServiceDetails('news');

            var methodName = '';

            if (!_.isUndefined(service) && !_.isNull(service)) {
                console.log(service.name);
                methodName = service.methods.showArticleContent;
            }

            var args = {
                parameters: {
                    url: req.body.url,
                    ssnid: req.headers['x-session-token']
                }
            };

            client.get(config.restcall.url + '/' + service.name + '/' + methodName, args, function(data, response) {
                res.status(response.statusCode).send(data);
            });
        }

        function search(req, res, next) {
            var service = getServiceDetails('news');

            var methodName = '';

            if (!_.isUndefined(service) && !_.isNull(service)) {
                console.log(service.name);
                methodName = service.methods.search;
            }

            var args = {
                parameters: {
                    company_id: req.body.companyId,
                    user_id: req.body.userId,
                    sort_by: req.body.sortBy,
                    search_within: req.body.searchWithin,
                    num_per_page: req.body.numPerPage,
                    ssnid: req.headers['x-session-token']
                }
            };

            client.get(config.restcall.url + '/' + service.name + '/' + methodName, args, function(data, response) {
                res.status(response.statusCode).send(data);
            });
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

            client.post(config.restcall.url + '/' + service.name + '/' + methodName, args,
                function(data, response) {
                    res.send(data);
                });
        }

        function getAttachedArticles(req, res, next) {
            var service = getServiceDetails('news');

            var methodName = '';

            if (!_.isUndefined(service) && !_.isNull(service)) {
                console.log(service.name);
                methodName = service.methods.getAttachedArticles;
            }

            var args = {
                parameters: {
                    project_id: req.body.projectId,
                    step_id: req.body.stepId,
                    ssnid: req.headers['x-session-token']
                }
            };

            client.get(config.restcall.url + '/' + service.name + '/' + methodName, args, function(data, response) {
                res.status(response.statusCode).send(data);
            });
        }
    };

})(module.exports);