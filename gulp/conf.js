/**
 *  This file contains the variables used in other gulp files
 *  which defines tasks
 *  By design, we only put there very generic config values
 *  which are used in several places to keep good readability
 *  of the tasks
 */

var gutil = require('gulp-util');

/**
 *  The main paths of your project handle these with care
 */
exports.paths = {
    src : 'src',
    dist: 'dist',
    tmp : '.tmp',
    e2e : 'e2e',
    server: './src/server',
    sass: ['./src/app/core/global-scss/**/*.scss',
            './src/app/**/*.scss',
            './src/app/core/**/*.scss',
            '!./src/app/core/global-scss/partials/**/*.scss',
            '!./src/app/index.scss']
};

/**
 *  Wiredep is the lib which inject bower dependencies in your project
 *  Mainly used to inject script tags in the index.html but also used
 *  to inject css preprocessor deps and js files in karma
 */
exports.wiredep = {
    //exclude: [/jquery/],
    directory: 'bower_components'
};

exports.defaultPort = 7203;


exports.node =
{
    server: './src/server/server.js'
};

/**
 *  Common implementation for an error handler of a Gulp plugin
 */
exports.errorHandler = function (title)
{
    'use strict';

    return function (err)
    {
        gutil.log(gutil.colors.red('[' + title + ']'), err.toString());
        this.emit('end');
    };
};


exports.logMessage = function (msg) {
    if (typeof(msg) === 'object') {
        for (var item in msg) {
            if (msg.hasOwnProperty(item)) {
                gutil.log(gutil.colors.green(msg[item]));
            }
        }
    }
    else {
        gutil.log(gutil.colors.yellow(msg));
    }
};