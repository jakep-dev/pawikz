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
    var workupBusiness = require('./workup/workup.business.js');
    var socket = require('./socket/socket');
    var newsRoute = require('./news/news.route');

    routes.init = function (app, server, config, logger)
    {
        workupBusiness.init(config, logger);
        socket.init(server, config, workupBusiness, logger);
        dashboardRoute.init(app, config, logger);
        overviewRoute.init(app, config, workupBusiness, logger);
        authenticateRoute.init(app, config, logger);
        templateRoute.init(app, config, logger);
        loggingRoute.init(app, config);
        workupRoute.init(app, config, logger);
        chartRoute.init(app, config, logger);
        financialChartRoute.init(app, config, logger);
        pdfRoute.init(app, config, logger);
        newsRoute.init(app, config, logger);
    };

})(module.exports);