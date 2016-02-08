
(function(loggingRoute)
{
    var fs = require('fs');
    var moment = require('moment');
    var log = require('minilog')('advisen-app');
    require('minilog').enable();

    //var fileName = moment().format('L');
    //require('minilog').pipe(fs.createWriteStream('./temp.log'));

    loggingRoute.init = function(app, config)
    {
        config.parallel([
            app.post('/api/errorLog', errorLog),
            app.post('/api/debugLog', debugLog)
        ]);

        function errorLog(req, res, next)
        {
            log.error(req.body);
        }

        function debugLog(req, res, next)
        {
            log.debug(req.body);
        }

    };

})(module.exports);

