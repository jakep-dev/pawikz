(function(chartRoutes)
{
    var async = require('async');
    var u = require('underscore');
    var fs = require('fs');

    chartRoutes.init = function (app, config)
    {
        var client = config.restcall.client;
        var config = config;

        config.parallel([
            app.post('/api/getFinancialChartRatioTypes', getFinancialChartRatioTypes),
            app.post('/api/getSavedFinancialChartData', getSavedFinancialChartData),
            app.post('/api/getFinancialChartData', getFinancialChartData),
            app.post('/api/saveFinancialChartSettings', saveFinancialChartSettings),
            app.post('/api/getFinancialChartPeerAndIndustries', getFinancialChartPeerAndIndustries)
        ]);

        function getFinancialChartRatioTypes(req, res, next) {
            var service = getServiceDetails('charts');
            var methodName = '';

            if (!u.isUndefined(service) && !u.isNull(service)) {
                methodName = service.methods.getFinancialChartRatioTypes;
            }

            var ssnid = req.headers['x-session-token'];
            var url = config.restcall.url + '/' + service.name + '/' + methodName + '?ssnid=' + ssnid
            console.log(url);
            client.get(url, function (data, response) {
                res.status(response.statusCode).send(data.data);
            });
        }

        function getFinancialChartPeerAndIndustries(req, res, next) {
            var service = getServiceDetails('charts');
            var methodName = '';

            if (!u.isUndefined(service) && !u.isNull(service)) {
                methodName = service.methods.getFinancialChartPeerAndIndustries;
            }

            var url = config.restcall.url + '/' + service.name + '/' + methodName + '?company_id='
                + req.body.company_id + '&ssnid=' + req.headers['x-session-token'];
            console.log(url);
            client.get(url, function (data, response) {
                res.status(response.statusCode).send(data.data);
            });
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
            console.log(url);
            client.get(url, function (data, response) {
                res.status(response.statusCode).send(data);
            });
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
            console.log('[getFinancialChartData]' + url);
            console.log('[getFinancialChartData][compart_name]' + args.data.compare_name);
            console.log('[getFinancialChartData][short_name]' + args.data.short_name);
            console.log('[getFinancialChartData][compare_id]' + args.data.compare_id);
            console.log('[getFinancialChartData][company_id]' + args.data.company_id);
            console.log('[getFinancialChartData][single_multi]' + args.data.single_multi);
            console.log('[getFinancialChartData][ratioselect]' + args.data.ratioselect);
            console.log('[getFinancialChartData][time_period]' + args.data.time_period);
            console.log('[getFinancialChartData][is_custom_date]' + args.data.is_custom_date);
            console.log('[getFinancialChartData][startdate]' + args.data.startdate);
            console.log('[getFinancialChartData][enddate]' + args.data.enddate);
            console.log('[getFinancialChartData][token]' + args.data.token);
            client.post(url, args, function (data, response) {
                if (data) {
                    if (data.data) {
                        console.log('[getFinancialChartData]Return data size: ' + data.data.length);
                    } else {
                        console.log('[getFinancialChartData]Return data.data is null');
                    }
                } else {
                    console.log('[getFinancialChartData]Return data is null');
                }                
                res.send(data.data);
            });
        }

        function saveFinancialChartSettings(req, res, next) {
            var service = getServiceDetails('charts');
            var methodName = '';

            if (!u.isUndefined(service) && !u.isNull(service)) {
                methodName = service.methods.saveFinancialChartSettings;
            }

            var args = {
                data: {
                    project_id: req.body.project_id,
                    step_id: req.body.step_id,
                    mnemonic: req.body.mnemonic,
                    item_id: req.body.item_id,
                    company_id: req.body.company_id,
                    token: req.headers['x-session-token'],
                    ifChartSettings: req.body.ifChartSettings
                },
                headers: { "Content-Type": "application/json" }
            };

            var url = config.restcall.url + '/' + service.name + '/' + methodName;
            console.log(url);
            console.log(args.data);
            client.post(url, args, function (data, response) {
                console.log(data.chartSettings);
                res.send(data.chartSettings);
            });
        }

        function getServiceDetails(serviceName) {
            return u.find(config.restcall.service, { name: serviceName });
        }
    };

})(module.exports);