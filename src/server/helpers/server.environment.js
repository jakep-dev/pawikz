(function (environment) {
    var Client = require('node-rest-client').Client;
    var config = require('../server.config');
    var env = (process.env.NODE_ENV || 'DEV').toUpperCase().trim();

    if (env === 'PROD') {
        environment.webService = config.prod.webService;
        environment.client = config.prod.client;
        environment.logSetting = config.prod.log;
        environment.redisKeyTTL = config.prod.redisKeyTTL;
        environment.redisCluster = config.prod.redisCluster;
    } else if (env === 'INT') {
        environment.webService = config.int.webService;
        environment.client = config.int.client;
        environment.logSetting = config.int.log;
        environment.redisKeyTTL = config.int.redisKeyTTL;
        environment.redisCluster = config.int.redisCluster;
    } else {
        environment.webService = config.dev.webService;
        environment.client = config.dev.client;
        environment.logSetting = config.dev.log;
        environment.redisKeyTTL = config.dev.redisKeyTTL;
        environment.redisCluster = config.dev.redisCluster;
        if (env != 'DEV') {
            env = 'DEV';
        }
    }
    environment.environment = env;
    environment.restcall = config.modules.restcall;
    environment.restcall.client = new Client();
    environment.restcall.url = environment.webService.protocol.concat('://', environment.webService.url, ':', environment.webService.port, '/', environment.webService.service);
    environment.socketIO = config.modules.socketIO;
    environment.socketIO.host = environment.client.protocol.concat('://', environment.client.domain, ':', environment.client.port);
    if(environment.client.protocol === 'https') {
        if( environment.client.port === '443') {
            environment.connectSrc = 'wss: ' + environment.client.domain;
        } else {
            environment.connectSrc = 'wss: ' + environment.client.domain + ':' + environment.client.port;
        }
    } else if(environment.client.protocol === 'http') {
        if( environment.client.port === '80') {
            environment.connectSrc = 'ws: ' + environment.client.domain;
        } else {
            environment.connectSrc = 'ws: ' + environment.client.domain + ':' + environment.client.port;
        }
    } else {
        environment.connectSrc = '';
    }

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
