(function(reportsRoute) {
    var _ = require('underscore');
    var config = null;
    var client = null;
    var logger;

    reportsRoute.init = function(app, c, log) {
        config = c;
        client = config.restcall.client;
        logger = log;

        config.parallel([
            app.post('/api/reports/list', getList)
        ]);

        function getServiceDetails(serviceName) {
            return _.find(config.restcall.service, { name: serviceName });
        }

        function getList(req, res, next) {
            var service = getServiceDetails('reports');

            var methodName = '';

            if (!_.isUndefined(service) && !_.isNull(service)) {
                logger.debug(service.name);
                methodName = service.methods.getList;
            }

            var args = {
                parameters: {
                    company_id: req.body.companyId,
                    user_id: req.body.userId,
                    page_no: req.body.pageNo,
                    results_per_page: req.body.length,
                    ssnid: req.headers['x-session-token']
                }
            };

            var url = config.restcall.url + '/' + service.name + '/' + methodName;
            client.get(url, args, 
                function(data, response) {
                    logger.logIfHttpError(url, args, data, response);
                    res.send(data);
                }
            ).on('error',
                function (err) {
                    logger.error('[getList - Analyst Report]');
                    logger.error(err); 
                }
            );
        }
    };

})(module.exports);