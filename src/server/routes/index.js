/**
 * Created by sherindharmarajan on 11/13/15.
 */
(function(routes)
{
    var dashboardRoute = require('./dashboard/dashboard.route');
    var overviewRoute = require('./overview/overview.route');
    var authenticateRoute = require('./authenticate/authenticate.route');
    var templateRoute = require('./template/template.route');
    var loggingRoute = require('./logging/logging.route');

    var config = require('../server.config');

    routes.init = function(app)
    {
        dashboardRoute.init(app, config);
        overviewRoute.init(app, config);
        authenticateRoute.init(app, config);
        templateRoute.init(app, config);
        loggingRoute.init(app, config);
    }

})(module.exports);