
(function(chartRoutes)
{

    var u = require('underscore');
    chartRoutes.init = function(app, config)
    {
        var client = config.restcall.client;
        var config = config;

        config.parallel([
            app.post('/api/getChartData', getChartData),
            app.post('/api/findTickers', findTickers),
            app.post('/api/getIndices', findIndices),
            app.post('/api/getSavedChartData', getSavedChartData)
        ]);

        function getChartData(req, res, next) {
            var service = getServiceDetails('charts');
            console.log('Parameters -');
            console.log(req.body);

            var methodName = '';

            if (!u.isUndefined(service) && !u.isNull(service)) {
                console.log(service.name);
                methodName = service.methods.getStockData;
            }

            var  tickers= req.body.tickers,
                period= req.body.period,
                ssnid= req.headers['x-session-token'],
                splits= req.body.splits,
                dividends= req.body.dividends,
                earnings= req.body.earnings,
                end_date = req.body.end_date,
                start_date = req.body.start_date;
             console.log('------------',config.restcall.url + '/' + service.name + '/' + methodName
                +'?company_id=3009774&peers='+encodeURIComponent(tickers)
                + '&period=' +period
                + '&ssnid=' +ssnid
                +'&splits='+splits
                +'&dividends='+dividends
                +'&earnings='+earnings
                +'&date_start='+start_date
                +'&date_end='+end_date);
            client.get(config.restcall.url + '/' + service.name + '/' + methodName
                +'?company_id=3009774&peers='+encodeURIComponent(tickers)
                + '&period=' +period
                + '&ssnid=' +ssnid
                +'&splits='+splits
                +'&dividends='+dividends
                +'&earnings='+earnings
                +'&date_start='+start_date
                +'&date_end='+end_date
                , function (data, response) {
                    res.send(data);
                });
        }

        function findTickers(req, res, next) {
            var service = getServiceDetails('templateSearch');
            console.log('Parameters -');
            console.log(req.body);

            var methodName = '';

            if (!u.isUndefined(service) && !u.isNull(service)) {
                console.log(service.name);
                methodName = service.methods.findTickers;
            }

            console.log(methodName);
            var  keyword= req.body.keyword,
                ssnid= req.headers['x-session-token'];

            client.get(config.restcall.url + '/' + service.name + '/' + methodName
                +'?keyword='+keyword +'&ssnid=' +ssnid, function (data, response) {
                res.send(data);
            });
        }

        function findIndices (req, res , next ) {
            var service = getServiceDetails('charts');
            var methodName = '';

            if (!u.isUndefined(service) && !u.isNull(service)) {
                console.log(service.name);
                methodName = service.methods.getIndices;
            }

            console.log(methodName);
            var  ssnid= req.headers['x-session-token'];
            console.log('service.name  + methodName------------------->',config.restcall.url + '/' +service.name + '/' + methodName);
            client.get(config.restcall.url + '/' + service.name + '/' + methodName
                +'?ssnid=' +ssnid, function (data, response) {
                console.log('service.name  + methodName------------------->',service.name + '/' + methodName);
                res.send(data);
            });

        }

        function getSavedChartData  (req, res , next ) {
            var service = getServiceDetails('charts');
            var methodName = '';

            if (!u.isUndefined(service) && !u.isNull(service)) {
                methodName = service.methods.getSavedChartData;
            }

            var  ssnid= req.headers['x-session-token'];
            var  stepId= req.body.stepId;
            var  projectId= req.body.projectId;
            var  mnemonic= req.body.mnemonic;
            var  itemId= req.body.itemId;

            console.log('service.name  + methodName------------------->',config.restcall.url + '/' + service.name + '/' + methodName
                +'?project_id='+projectId+'&step_id='+stepId+ '&mnemonic='+mnemonic+ '&item_id='+ itemId + '&ssnid=' +ssnid);
            client.get(config.restcall.url + '/' + service.name + '/' + methodName
                +'?project_id='+projectId+'&step_id='+stepId+ '&mnemonic='+mnemonic+ '&item_id='+ itemId + '&ssnid=' +ssnid, function (data, response) {
                res.send(data);
            });

        }

        function getServiceDetails(serviceName) {
            return u.find(config.restcall.service, {name: serviceName});
        }

    };

})(module.exports);

