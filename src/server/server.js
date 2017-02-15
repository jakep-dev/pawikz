/*jshint node:true*/
'use strict';

var express = require('express');
var http = require('http');
var app = express();
var bodyParser = require('body-parser');
var compress = require('compression');
var cors = require('cors');
var exception = require('./exception/exception')();
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var csrf = require('csurf');
var port = process.env.PORT || 4000;
var routes;

var environment = process.env.NODE_ENV || 'Dev';
var csrfProtection = csrf(
    {
        cookie: true,
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        ignoreMethods: ['GET']
    }
);

app.use(compress());
app.use(logger('dev'));
app.use(cors());
app.use(exception.init);

//app.use(bodyParser.urlencoded({limit: '200mb',
//  extended: true
//}));
app.use(bodyParser.json({ limit: '100mb' }));
//Cookie secret parameter
app.use(cookieParser('TmN!m9BmqS5x%g8Zdd6p%sqP2G6kft@z5SztHzN##Mc%wk6cL$#?yfUGA=&Xw7rLVB5@WQP7k_+#YWtR2-9u#^&U8fhdDL-Vrjq9%uAt^UfN?ew+SCbcQq&_YZsGmAdx'));
app.use(csrfProtection);

app.use(function (req, res, next) {
    var csrfToken = req.csrfToken();
    res.cookie('XSRF-TOKEN', csrfToken);
    res.locals._csrf = csrfToken;

    res.removeHeader("X-Powered-By");
    res.header('Content-Security-Policy', "script-src 'self' *.advisen.com 'unsafe-eval' 'unsafe-inline'; object-src 'self'");
    res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    res.header('X-Frame-Options', 'SAMEORIGIN') ;
    res.header('X-XSS-Protection', '1; mode=block') ;
    res.header('X-Content-Type-Options', 'nosniff') ;
    return next();
});

routes = require('./routes');

var server = app.listen(port, function() {
  console.log('Express server listening on port ' + port);
  console.log('env = ' + app.get('env') +
      '\n__dirname = ' + __dirname +
      '\nprocess.cwd = ' + process.cwd());


});

routes.init(app, server);
console.log('About to crank up node');
console.log('PORT=' + port);
console.log('NODE_ENV=' + environment);


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




