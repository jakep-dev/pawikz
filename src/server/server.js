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
var logger = require('morgan');
var config = require('./server.config');
var security = require('./server.security');
var port = process.env.PORT || 4000;
var environment = (process.env.NODE_ENV || 'DEV').toUpperCase();
var startupEnvironment = config.environment;

app.use(favicon(path.join(__dirname, '..', 'favicon.ico')));
app.use(compress());
app.use(logger('dev'));
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
            console.log('Express server listening on port ' + port);
            console.log('NODE_ENV = ' + app.get('env') + '\nRunning ENV = ' + startupEnvironment + '\n__dirname = ' + __dirname + '\nprocess.cwd = ' + process.cwd());
        }
    );

var routes = require('./routes');
routes.init(app, server, config);
console.log('About to crank up node');
console.log('PORT=' + port);
console.log('NODE_ENV=' + environment);
console.log('STARTUP_ENV=' + startupEnvironment);

app.get('/', function (req, res, next) {
    res.redirect('/pages/auth/login');
});


app.get('/ping', function(req, res, next) {
  console.log(req.body);
  res.send('pong');
});

switch (environment) {

  case 'build':
    console.log('** BUILD **');
    app.use(express.static('./dist/'));
    app.use('/*', express.static('./dist/index.html'));
    break;
  default:
    console.log('** DEV **');
    console.log(__dirname);
    app.use('/bower_components', express.static('./bower_components/'));
    app.use('/app', express.static('./src/app/'));
    app.use('/app', express.static('./.tmp/serve/app/'));
    app.use('/assets', express.static('./src/assets/'));
    app.use('/*', express.static('./.tmp/serve/index.html'));
    break;
}
