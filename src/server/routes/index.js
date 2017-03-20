/**
 * Created by sherindharmarajan on 11/13/15.
 */
(function(routes)
{
    //delete require.cache[require.resolve('./template/template.route')];

    var dashboardRoute = require('./dashboard/dashboard.route');
    var overviewRoute = require('./overview/overview.route');
    var authenticateRoute = require('./authenticate/authenticate.route');
    var templateRoute = require('./template/template.route');
    var loggingRoute = require('./logging/logging.route');
    var chartRoute = require('./chart/chart.route');
    var financialChartRoute = require('./chart/financial-chart.route.js');
    var pdfRoute = require('./chart/pdf.route.js');
    var workupRoute = require('./workup/workup.route');
    var socket = require('./socket/socket');
    var newsRoute = require('./news/news.route');

    routes.init = function (app, server, config)
    {
        socket.init(server, config);
        dashboardRoute.init(app, config);
        overviewRoute.init(app, config);
        authenticateRoute.init(app, config);
        templateRoute.init(app, config);
        loggingRoute.init(app, config);
        workupRoute.init(app, config);
        chartRoute.init(app, config);
        financialChartRoute.init(app, config);
        pdfRoute.init(app, config);
        newsRoute.init(app, config);
    };

})(module.exports);