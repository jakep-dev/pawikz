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
var port = process.env.PORT || 4000;
var routes;

//

var environment = process.env.NODE_ENV || 'Dev';
app.use(bodyParser.urlencoded({limit: '200mb',
  extended: true
}));
//app.use(bodyParser.json());
app.use(bodyParser.json({limit: '100mb'}));
app.use(compress());
app.use(logger('dev'));
app.use(cors());
app.use(exception.init);


routes = require('./routes');

var server = app.listen(port, function() {
  console.log('Express server listening on port ' + port);
  console.log('env = ' + app.get('env') +
      '\n__dirname = ' + __dirname +
      '\nprocess.cwd = ' + process.cwd());


});

routes.init(app,server);

/*var io = require('socket.io')(server);
io.on('connection', function (socket) {
  console.log("socket connected");
  socket.emit('pdfc status progress', {percentage:10,status:'working'});

});*/

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




