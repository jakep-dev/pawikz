(function(chartRoutes)
{
    var u = require('underscore');
    var fs = require('fs');
    var config;
    var client;
    var logger;

    function getServiceDetails(serviceName) {
        return u.find(config.restcall.service, { name: serviceName });
    }

    function saveInteractiveFinancialChart(mnemonic, callback) {
        var context = new Object();
        context.service = getServiceDetails('charts');
        context.methodName = '';
        context.results = {
            data: null,
            error: null
        };

        if (!u.isUndefined(context.service) && !u.isNull(context.service)) {
            context.methodName = context.service.methods.saveFinancialChartSettings;
        }
        context.args = {
            data: {
                project_id: mnemonic.data.project_id,
                step_id: mnemonic.data.step_id,
                company_id: mnemonic.data.company_id,
                mnemonic: mnemonic.data.mnemonic,
                item_id: mnemonic.data.item_id,
                token: mnemonic.token,
                projectImageCode: mnemonic.data.projectImageCode,
                ifChartSettings: mnemonic.data.ifChartSettings
            },
            headers: { "Content-Type": "application/json" }
        };
        var url = config.restcall.url + '/' + context.service.name + '/' + context.methodName;
        client.post(url, context.args,
            function (data, response) {
                logger.logIfHttpErrorRequest(url, context.args, data, response, mnemonic.token);
                context.results.data = data.chartSettings;
                callback(null, context.results);
            }
        ).on('error',
            function (err) {
                logger.errorRequest('[saveInteractiveFinancialChart]Error', mnemonic.token);
                logger.errorRequest(err, mnemonic.token);
                context.results.error = 'Error saving interactive financial chart';
                callback(null, context.results);
            }
        );
    }

    chartRoutes.saveInteractiveFinancialChart = saveInteractiveFinancialChart;

    chartRoutes.init = function (app, c, log)
    {
        config = c;
        client = config.restcall.client;
        logger = log;

        config.parallel([
            app.post('/api/getFinancialChartRatioTypes', getFinancialChartRatioTypes),
            app.post('/api/getSavedFinancialChartData', getSavedFinancialChartData),
            app.post('/api/getFinancialChartData', getFinancialChartData),
            app.post('/api/getFinancialChartPeerAndIndustries', getFinancialChartPeerAndIndustries)
        ]);

        function getFinancialChartRatioTypes(req, res, next) {
            var service = getServiceDetails('charts');
            var methodName = '';

            if (!u.isUndefined(service) && !u.isNull(service)) {
                methodName = service.methods.getFinancialChartRatioTypes;
            }

            var ssnid = req.headers['x-session-token'];
            var url = config.restcall.url + '/' + service.name + '/' + methodName + '?ssnid=' + ssnid;
            logger.debugRequest(url, req);
            client.get(url,
                function (data, response) {
                    logger.logIfHttpErrorRequest(url, null, data, response, req);
                    res.status(response.statusCode).send(data.data);
                }
            ).on('error',
                function (err) {
                    logger.errorRequest('[getFinancialChartRatioTypes]Error', req);
                    logger.errorRequest(err, req);
                }
            );
        }

        function getFinancialChartPeerAndIndustries(req, res, next) {
            var service = getServiceDetails('charts');
            var methodName = '';

            if (!u.isUndefined(service) && !u.isNull(service)) {
                methodName = service.methods.getFinancialChartPeerAndIndustries;
            }

            var url = config.restcall.url + '/' + service.name + '/' + methodName + '?company_id='
                + req.body.company_id + '&ssnid=' + req.headers['x-session-token'];
            logger.debugRequest(url, req);
            client.get(url,
                function (data, response) {
                    logger.logIfHttpErrorRequest(url, null, data, response, req);
                    res.status(response.statusCode).send(data.data);
                }
            ).on('error',
                function (err) {
                    logger.errorRequest('[getFinancialChartPeerAndIndustries]Error', req);
                    logger.errorRequest(err, req);
                }
            );
        }

        function getSavedFinancialChartData(req, res, next) {
            var service = getServiceDetails('charts');
            var methodName = '';

            if (!u.isUndefined(service) && !u.isNull(service)) {
                methodName = service.methods.getSavedFinancialChartData;
            }

            var url = config.restcall.url + '/' + service.name + '/' + methodName + '?project_id='
                + req.body.project_id + '&step_id=' + req.body.step_id + '&mnemonic=' + req.body.mnemonic + '&item_id=' 
                + req.body.item_id + '&ssnid=' + req.headers['x-session-token'];
            logger.debugRequest(url, req);
            client.get(url,
                function (data, response) {
                    logger.logIfHttpErrorRequest(url, null, data, response, req);
                    res.status(response.statusCode).send(data);
                }
            ).on('error',
                function (err) {
                    logger.errorRequest('[getSavedFinancialChartData]Error', req);
                    logger.errorRequest(err, req);
                }
            );
        }

        function getFinancialChartData(req, res, next) {
            var service = getServiceDetails('charts');
            var methodName = '';

            if (!u.isUndefined(service) && !u.isNull(service)) {
                methodName = service.methods.getFinancialChartData;
            }

            var args = {
                data: {
                    compare_name: req.body.compare_name,
                    short_name: req.body.short_name,
                    compare_id: req.body.compare_id,
                    company_id: req.body.company_id,
                    single_multi: req.body.single_multi,
                    ratioselect: req.body.ratioselect,
                    time_period: req.body.time_period,
                    is_custom_date: req.body.is_custom_date,
                    startdate: req.body.startdate,
                    enddate: req.body.enddate,
                    token: req.headers['x-session-token']
                },
                headers: { "Content-Type": "application/json" }
            };

            var url = config.restcall.url + '/' + service.name + '/' + methodName;
            client.post(url, args,
                function (data, response) {
                    logger.logIfHttpErrorRequest(url, args, data, response, req);
                    if (data) {
                        if (data.data) {
                            logger.debugRequest('[getFinancialChartData]Return data size: ' + data.data.length, req);
                        } else {
                            logger.warnRequest('[getFinancialChartData]Return data.data is null', req);
                        }
                    } else {
                        logger.warnRequest('[getFinancialChartData]Return data is null', req);
                    }                
                    res.send(data.data);
                }
            ).on('error',
                function (err) {
                    logger.errorRequest('[getFinancialChartData]Error', req);
                    logger.errorRequest(err, req);
                }
            );
        }

    };

})(module.exports);