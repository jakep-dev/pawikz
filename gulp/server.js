'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');
var port = process.env.PORT || conf.defaultPort;


var browserSync = require('browser-sync');
var browserSyncSpa = require('browser-sync-spa');
var p = require('gulp-load-plugins')({lazy: true});

var util = require('util');

function browserSyncInit(baseDir, browser)
{
    browser = browser === undefined ? 'default' : browser;

    var routes = null;
    if ( baseDir === conf.paths.src || (util.isArray(baseDir) && baseDir.indexOf(conf.paths.src) !== -1) )
    {
        routes = {
            '/bower_components': 'bower_components'
        };
    }

    var server = {
        baseDir: baseDir,
        routes : routes
    };

    console.log('SERVER ---- ');
    console.log(server);

    console.log('BROWSER -----');
    console.log(browser);

    /*
     * You can add a proxy to your backend by uncommenting the line bellow.
     * You just have to configure a context which will we redirected and the target url.
     * Example: $http.get('/users') requests will be automatically proxified.
     *
     * For more details and option, https://github.com/chimurai/http-proxy-middleware/blob/v0.0.5/README.md
     */
    // server.middleware = proxyMiddleware('/users', {target: 'http://jsonplaceholder.typicode.com', proxyHost:
    // 'jsonplaceholder.typicode.com'});

    browserSync.instance = browserSync.init({
        startPath: '/',
        server   : server,
        browser  : browser
    });
}

browserSync.use(browserSyncSpa({
    selector: '[ng-app]'// Only needed for angular apps
}));

gulp.task('serve', ['watch'], function ()
{
   browserSyncInit([path.join(conf.paths.tmp, '/serve'), conf.paths.src]);
});

gulp.task('serve:dist', ['build'], function ()
{
    browserSyncInit(conf.paths.dist);
});

gulp.task('serve:e2e', ['inject'], function ()
{
    browserSyncInit([conf.paths.tmp + '/serve', conf.paths.src, conf.paths.server], []);
});

gulp.task('serve:e2e-dist', ['build'], function ()
{
    browserSyncInit(conf.paths.dist, []);
});

gulp.task('serve-dev',['clean', 'watch'], function()
{
    console.log('PORT-- ' + port);

    var nodeOption = {
        script: './src/server/server.js',
        delayTime: 1,
        env:{
            'PORT': port,
            'NODE_ENV': 'dev'
        },
        watch: ['./src/server/']
    };

    return p.nodemon(nodeOption)
        .on('restart', function(ev) {
            console.log('Restarted');
            console.log('Files changed on restart:\n' + ev);

            setTimeout(function(){
               browserSync.notify('Reloading now..');
               browserSync.reload({stream: false});
            }, 5000);
        })
        .on('start', function() {
            console.log('Started');
            startBrowserSync();
        })
        .on('crash', function() {
            console.log('Crashed');
        })
        .on('exit', function() {
            console.log('Exited');
        });
});

function startBrowserSync()
{
    if(browserSync.active)
    {
        return;
    }

    var watchFiles = [conf.paths.src + '/app/**/*',
                      '!' + conf.paths.src, '/app/**/*.scss',
        conf.paths.tmp + '**/*.css'];

    var options = {
            proxy: 'localhost:' + port,
            port: 3000,
            files:watchFiles,
            ghostMode:{
                clicks: true,
                location: true,
                forms: true,
                scroll: true
            },
            injectChanges: true,
            logFileChanges: true,
            logLevel: 'debug',
            logPrefix: 'gulp-pattern',
            notify: true,
            reloadDelay: 100
    };

    browserSync(options);
}
