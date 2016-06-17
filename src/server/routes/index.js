/**
 * Created by sherindharmarajan on 11/13/15.
 */
(function(routes)
{
    delete require.cache[require.resolve('./template/template.route')];

    var dashboardRoute = require('./dashboard/dashboard.route');
    var overviewRoute = require('./overview/overview.route');
    var authenticateRoute = require('./authenticate/authenticate.route');
    var templateRoute = require('./template/template.route');
    var loggingRoute = require('./logging/logging.route');
    var chartRoute = require('./chart/chart.route');

    var config = require('../server.config');

    routes.init = function(app,server)
    {
        dashboardRoute.init(app, config);
        overviewRoute.init(app, config);
        authenticateRoute.init(app, config);
        templateRoute.init(app, config);
        loggingRoute.init(app, config);
        chartRoute.init(app, config,server);
    }

})(module.exports);