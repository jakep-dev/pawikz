(function(environment){
    var config = require('../server.config');
    var settings = config.getSettings();
    var env = (process.env.STARTUP_ENV || 'DEV').toUpperCase().trim();

    function parallel(middlewares) {
        return function (req, res, next) {
            async.each(middlewares, function (mw, cb) {
                mw(req, res, cb);
            }, next);
        };
    };

    function getConfig() {
        var object = new Object();
        if (env === 'PROD') {
            object.webService = settings.environment.prod.webService;
            object.client = settings.environment.prod.client;
            object.logSetting = settings.environment.prod.log;
        } else if (env === 'INT') {
            object.webService = settings.environment.int.webService;
            object.client = settings.environment.int.client;
            object.logSetting = settings.environment.int.log;
        } else {
            object.webService = settings.environment.dev.webService;
            object.client = settings.environment.dev.client;
            object.logSetting = settings.environment.dev.log;
            if (env != 'DEV') {
                env = 'DEV';
            }
        }
        object.environment = env;
        object.restcall = settings.modules.restcall;
        object.restcall.url = object.webService.protocol.concat('://', object.webService.url, ':', object.webService.port, '/', object.webService.service);
        object.userSocketInfo = settings.modules.userSocketInfo;
        object.socketIO = settings.modules.socketIO;
        object.socketIO.host = object.client.protocol.concat('://', object.client.domain, ':', object.client.port);
        object.socketData = settings.modules.socketData;

        //existing log is in use by server/routes/logging/logging.route.js
        object.log = settings.modules.log;
        
        object.parallel = parallel;
        return object;
    }
    environment.getConfig = getConfig;

})(module.exports);
