
(function(loggingRoute)
{
    var fs = require('fs');

    var log = require('minilog')('advisen-template-app');
    require('minilog').enable();


    loggingRoute.init = function(app, config)
    {
        initializeLogging(config);

        config.parallel([
            app.post('/api/errorLog', errorLog),
            app.post('/api/debugLog', debugLog)
        ]);

        function errorLog(req, res, next)
        {
            log.error('-------');
            log.error(new Date());
            log.error(req.body);
            log.error('-------');
        }

        function debugLog(req, res, next)
        {
            log.debug('-------');
            log.debug(new Date());
            log.debug(req.body);
            log.debug('-------');
        }

    };

    function initializeLogging(config)
    {
        if (!fs.existsSync(config.log.directory)){
            fs.mkdirSync(config.log.directory);
        }

        var fileDirectory = config.log.directory + config.log.fileDirectory;

        if (!fs.existsSync(fileDirectory)){
                fs.mkdirSync(fileDirectory);
                require('minilog').pipe(fs.createWriteStream(fileDirectory + config.log.fileName));
            }
    }


})(module.exports);

