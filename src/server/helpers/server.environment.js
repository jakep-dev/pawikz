(function (environment) {
    var Client = require('node-rest-client').Client;
    var config = require('../server.config');
    var env = (process.env.STARTUP_ENV || 'DEV').toUpperCase().trim();

    if (env === 'PROD') {
        environment.webService = config.prod.webService;
        environment.client = config.prod.client;
        environment.logSetting = config.prod.log;
    } else if (env === 'INT') {
        environment.webService = config.int.webService;
        environment.client = config.int.client;
        environment.logSetting = config.int.log;
    } else {
        environment.webService = config.dev.webService;
        environment.client = config.dev.client;
        environment.logSetting = config.dev.log;
        if (env != 'DEV') {
            env = 'DEV';
        }
    }
    environment.environment = env;
    environment.restcall = config.modules.restcall;
    environment.restcall.client = new Client();
    environment.restcall.url = environment.webService.protocol.concat('://', environment.webService.url, ':', environment.webService.port, '/', environment.webService.service);
    environment.userSocketInfo = config.modules.userSocketInfo;
    environment.socketIO = config.modules.socketIO;
    environment.socketIO.host = environment.client.protocol.concat('://', environment.client.domain, ':', environment.client.port);
    environment.socketData = config.modules.socketData;

    //existing log is in use by server/routes/logging/logging.route.js
    environment.log = config.modules.log;

    function parallel(middlewares) {
        return function (req, res, next) {
            async.each(middlewares, function (mw, cb) {
                mw(req, res, cb);
            }, next);
        };
    };
    environment.parallel = parallel;
})(module.exports);
