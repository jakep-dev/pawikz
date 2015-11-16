/**
 * Created by sherindharmarajan on 11/13/15.
 */
(function(routes)
{
    var dashboardRoute = require('./dashboard/dashboard.route')
    var config = require('../server.config');

    routes.init = function(app)
    {
        dashboardRoute.init(app, config);
    }

})(module.exports);