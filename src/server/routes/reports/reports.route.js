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
            app.post('/api/reports/list', getList),
            app.post('/api/reports/getPDFLink', getPDFLink),
            app.post('/api/reports/getPreviewReport', getPreviewReport)
        ]);

        function getServiceDetails(serviceName) {
            return _.find(config.restcall.service, { name: serviceName });
        }

        function getList(req, res, next) {
            var service = getServiceDetails('reports');

            var methodName = '';

            if (!_.isUndefined(service) && !_.isNull(service)) {
                logger.debugRequest(service.name, req);
                methodName = service.methods.getList;
            }

            var args = {
                parameters: {
                    company_id: req.body.companyId,
                    user_id: req.body.userId,
                    ssnid: req.headers['x-session-token']
                }
            };

            var url = config.restcall.url + '/' + service.name + '/' + methodName;
            client.get(url, args, 
                function(data, response) {
                    logger.logIfHttpErrorRequest(url, args, data, response, args.parameters.ssnid);
                    res.send(data);
                }
            ).on('error',
                function (err) {
                    logger.errorRequest('[getList - Analyst Report]', args.parameters.ssnid);
                    logger.errorRequest(err, args.parameters.ssnid); 
                }
            );
        }

        function getPDFLink(req, res, next) {
            var service = getServiceDetails('reports');

            var methodName = '';

            if (!_.isUndefined(service) && !_.isNull(service)) {
                logger.debugRequest(service.name, req);
                methodName = service.methods.getPDFLink;
            }

            var args = {
                parameters: {
                    user_id: req.body.userId,
                    company_id: req.body.companyId,
                    identifier_id: req.body.identifierId,
                    identifier_type: req.body.identifierType,
                    report_id: req.body.report.documentId,
                    report_title: encodeURIComponent(req.body.report.headline),
                    report_date: req.body.report.storyDate,
                    report_price: req.body.report.price,
                    number_of_pages: req.body.report.pages, 
                    author_id: req.body.report.analystCodes,
                    contributor_id: req.body.report.brokerCode,
                    doc_url: encodeURIComponent(req.body.report.docURL),
                    billing_type: req.body.report.billingType,
                    purchase_info: encodeURIComponent(req.body.report.purchaseInfo),
                    ssnid: req.headers['x-session-token']
               }
            };

            var url = config.restcall.url + '/' + service.name + '/' + methodName;
            var params = [];

            _.mapObject(args.parameters, function(val, key){
                params.push(key + '=' + val);
            });

            res.send({
                url: url + '?' + params.join('&')
            });
        }

        function getPreviewReport(req, res, next) {
            var service = getServiceDetails('reports');

            var methodName = '';

            if (!_.isUndefined(service) && !_.isNull(service)) {
                logger.debugRequest(service.name, req);
                methodName = service.methods.getPreviewReport;
            }

            var args = {
                data: {
                    preview_url: req.body.url,
                    user_id: req.body.userId,
                    ssnid: req.headers['x-session-token']
                },
                headers: { "Content-Type": "application/json" }
            };

            var url = config.restcall.url + '/' + service.name + '/' + methodName;
            client.post(url, args, 
                function(data, response) {
                    logger.logIfHttpErrorRequest(url, args, data, response, args.data.ssnid);
                    res.send(data);
                }
            ).on('error',
                function (err) {
                    logger.errorRequest('[getPreviewReport - Analyst Report]', args.data.ssnid);
                    logger.errorRequest(err, args.data.ssnid); 
                }
            );
        }
    };

})(module.exports);