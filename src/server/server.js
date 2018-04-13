/*jshint node:true*/
'use strict';

var numCPUs = require('os').cpus().length;
var cluster = require('cluster');
var config = require('./helpers/server.environment');
var logging = require('./helpers/server.logging');
var logger;

var port = process.env.PORT || 4000;
const isMultiThreading = parseInt(process.env.USE_MULTITHREADING) || 0;

console.log('isMultiThreading = ' + isMultiThreading);
if(isMultiThreading) {
    if (cluster.isMaster) {
        var i;
        for (i = 0; i < numCPUs; i++) {
            cluster.fork();
        }
        logging.init(config, 0);
        logger = logging.getLogger();
        cluster.on('online', function(worker) {
            logger.info('Worker ' + worker.process.pid + ' is online');
        });

        cluster.on('exit', function(worker, code, signal) {
            logger.error('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
            logger.error('Starting a new worker');
            cluster.fork();
        });

        process.on("SIGTERM", function () {
            process.exit(0);
        });
        process.on("SIGINT", function () {
            process.exit(0);
        });        
    } else {
        logging.init(config, cluster.worker.id);
        logger = logging.getLogger();
        appStart(config, logging, logger, port);
    }
} else {
    logging.init(config, 0);
    logger = logging.getLogger();
    appStart(config, logging, logger, port);
}

function appStart(config, logging, logger, port) {
    var express = require('express');
    var app = express();
    var bodyParser = require('body-parser');
    var compress = require('compression');
    var cors = require('cors');
    var exception = require('./exception/exception')();
    var favicon = require('serve-favicon');
    var path = require('path')
    var morgan = require('morgan');
    
    var security = require('./helpers/server.security');
    
    app.use(favicon(path.join(__dirname, '..', 'favicon.ico')));
    app.use(compress());
    app.use(morgan('":method :url HTTP/:http-version" :status :response-time ms :res[content-length] ":referrer" ":user-agent" :remote-addr :remote-user', { stream: logging.getLoggerStream() }));
    app.use(cors());
    app.use(exception.init);
    
    //app.use(bodyParser.urlencoded({limit: '200mb',
    //  extended: true
    //}));
    app.use(bodyParser.json({ limit: '100mb' }));
    
    security.setupSecurity(app);
    //false for http
    //true for https
    var server = security.getServer(app, port, config.client.useCertificate,
            function () {
                logger.info('Express server listening on port ' + port);
                logger.info('STARTUP_ENV = ' + process.env['STARTUP_ENV']);
                logger.info('NODE_ENV = ' + config.environment);
                logger.info('__dirname = ' + __dirname);
                logger.info('process.cwd = ' + process.cwd());
            }
        );
    
    var routes = require('./routes');
    routes.init(app, server, config, logger);

    app.get('/', function (req, res, next) {
        res.redirect('/pages/auth/login');
    });

    var environment = (process.env.STARTUP_ENV || 'DEV').toUpperCase().trim();
    switch (environment) {
    
      case 'BUILD':
        logger.info('** BUILD **');
        app.use(express.static('./dist/'));
        app.use('/*', express.static('./dist/index.html'));
        break;
      default:
        logger.info('** DEV **');
        logger.info(__dirname);
        app.use('/bower_components', express.static('./bower_components/'));
        app.use('/app', express.static('./src/app/'));
        app.use('/app', express.static('./.tmp/serve/app/'));
        app.use('/assets', express.static('./src/assets/'));
        app.use('/*', express.static('./.tmp/serve/index.html'));
        break;
    }
}
