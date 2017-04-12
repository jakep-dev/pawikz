/*jshint node:true*/
'use strict';

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var compress = require('compression');
var cors = require('cors');
var exception = require('./exception/exception')();
var favicon = require('serve-favicon');
var path = require('path')
var morgan = require('morgan');
var config = require('./server.config');
var security = require('./server.security');
var logging = require('./server.logging');

var port = process.env.PORT || 4000;
var environment = (process.env.NODE_ENV || 'DEV').toUpperCase();
var startupEnvironment = config.environment;
logging.init(config);
var logger = logging.getLogger();

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
var server = security.getServer(app, port, config.clients[startupEnvironment].useCertificate,
        function () {
            logger.info('Express server listening on port ' + port);
            logger.info('NODE_ENV = ' + app.get('env') + '\nRunning ENV = ' + startupEnvironment + '\n__dirname = ' + __dirname + '\nprocess.cwd = ' + process.cwd());
        }
    );

var routes = require('./routes');
routes.init(app, server, config, logger);
logger.info('About to crank up node');
logger.info('PORT=' + port);
logger.info('NODE_ENV=' + environment);
logger.info('STARTUP_ENV=' + startupEnvironment);

app.get('/', function (req, res, next) {
    res.redirect('/pages/auth/login');
});

app.get('/ping', function(req, res, next) {
  logger.info(req.body);
  res.send('pong');
});

switch (environment) {

  case 'build':
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
