(function(logging)
{
    var winston = require('winston');
    require('winston-daily-rotate-file');
    winston.emitErrs = true;
    var logger = null;
    var workerId = 0;

    function getTimestamp() {
        return (new Date()).toISOString();
    }

    function logFormatter(options) {
        if (options.message) {
            //strip out extra \n from morgan log messages
            if (options.message[options.message.length - 1] == '\n') {
                options.message = options.message.replace(/\n$/, '');
            }
        } else {
            //if the message is blank, null or undefined and not a stack trace from an exception then message is most likely a JSON object.
            //attempt to stringify the object
            if (!options.meta || !options.meta.stack) {
                try {
                    options.message = JSON.stringify(options.meta);
                } catch (exception) {}
            }
        }

        //options.timestamp() +' ['+ options.level.toUpperCase() +'] '+ (undefined !== options.message ? options.message : '') + (options.meta && Object.keys(options.meta).length ? '\n\t'+ JSON.stringify(options.meta) : '' );
        return options.timestamp() +' ['+ options.level.toUpperCase() +'][' + workerId + '] '+ (undefined !== options.message ? options.message : '') + (options.meta && options.meta.stack ? '\n' + options.meta.stack : '' );
    }

    function getLogger() {
        return logger;
    }
    logging.getLogger = getLogger;

    function getLoggerStream() {
        if (logger) {
            return {
                write: function (message, encoding) {
                    logger.info(message);
                }
            }
        } else {
            return null;
        }
    }
    logging.getLoggerStream = getLoggerStream;

    logging.init = function (config, id, hostname) {

        workerId = id;

        winston.handleExceptions(
            new winston.transports.DailyRotateFile({
                level: config.logSetting.logLevel,
                dirname: config.logSetting.dirName + '/' + hostname,
                filename: config.logSetting.exceptionLogFilePath,
                datePattern: 'YYYY-MM-DD',
                prepend: true,
                handleExceptions: true,
                humanReadableUnhandledException: true,
                json: false,
                maxsize: config.logSetting.maxSize,
                maxFiles: config.logSetting.maxFiles,
                colorize: false,
                prettyPrint: true,
                timestamp: getTimestamp,
                formatter: logFormatter
            })
        );

        logger = new winston.Logger({
            transports: [
                new winston.transports.DailyRotateFile({
                    level: config.logSetting.logLevel,
                    dirname: config.logSetting.dirName + '/' + hostname,
                    filename: config.logSetting.logFilePath,
                    datePattern: 'YYYY-MM-DD',
                    prepend: true,
                    handleExceptions: true,
                    humanReadableUnhandledException: true,
                    json: false,
                    maxsize: config.logSetting.maxSize,
                    maxFiles: config.logSetting.maxFiles,
                    colorize: false,
                    prettyPrint: true,
                    timestamp: getTimestamp,
                    formatter: logFormatter
                })
            ],
            exitOnError: false
        });
        if (config.environment == 'DEV') {
            logger.add(winston.transports.Console,
                {
                    level: config.logSetting.logLevel,
                    handleExceptions: true,
                    json: false,
                    handleExceptions: true,
                    humanReadableUnhandledException: true,
                    colorize: true,
                    prettyPrint: true,
                    timestamp: getTimestamp,
                    formatter: logFormatter
                }
            );
        }

        function logMessage(loggerFunction, message, object) {
            var context = new Object();
            if(typeof message === 'object') {
                try {
                    context.message = JSON.stringify(message);
                } catch(e) {
                    context.message = message;
                }
            } else {
                context.message = message;
            }
            if(typeof object === 'string') {
                if(object) {
                    loggerFunction('[' + object + ']' + context.message);
                } else {
                    loggerFunction(context.message);
                }
            } else {
                if(object && object.headers && object.headers['x-session-token']) {
                    if(object.headers['x-session-token'] !== 'null') {
                        loggerFunction('[' + object.headers['x-session-token'] + ']' + context.message);
                    } else {
                        loggerFunction(context.message);    
                    }
                } else {
                    loggerFunction(context.message);
                }
            }
            delete context.message;
            context = null;
        }

        logger.infoRequest = function(message, object) {
            logMessage(logger.info, message, object);
        }

        logger.errorRequest = function(message, object) {
            logMessage(logger.error, message, object);
        }

        logger.debugRequest = function(message, object) {
            logMessage(logger.debug, message, object);
        }

        logger.warnRequest = function(message, object) {
            logMessage(logger.warn, message, object);
        }

        logger.logIfHttpErrorRequest = function (url, args, data, response, object) {
            if (response.statusCode >= 400) {
                logger.errorRequest('===================', object);
                logger.errorRequest('HTTP Error occured with status of ' + response.statusCode, object);
                logger.errorRequest('URL = "' + url + '"', object);
                logger.errorRequest('HTTP args =', object);
                logger.errorRequest(args, object);
                if (data) {
                    logger.errorRequest('HTTP data =', object);
                    try {
                        if (typeof (data) == 'object' && data.toString) {
                            logger.errorRequest(data.toString('utf8'), object);
                        } else {
                            logger.errorRequest(data, object);
                        }
                    } catch (error) {
                        logger.errorRequest('Can\'t serialize response data object.', object);
                    }
                }
                logger.errorRequest('HTTP response =', object);
                try {
                    logger.errorRequest(response, object);
                } catch (error) {
                    logger.errorRequest('Can\'t serialize response object.', object);
                }
                logger.errorRequest('===================', object);
            }
        }

        logger.logIfHttpError = function (url, args, data, response) {
            if (response.statusCode >= 400) {
                logger.error('===================');
                logger.error('HTTP Error occured with status of ' + response.statusCode);
                logger.error('URL = "' + url + '"');
                logger.error('HTTP args =');
                logger.error(args);
                if (data) {
                    logger.error('HTTP data =');
                    try {
                        if (typeof (data) == 'object' && data.toString) {
                            logger.error(data.toString('utf8'));
                        } else {
                            logger.error(data);
                        }
                    } catch (error) {
                        logger.error('Can\'t serialize response data object.' );
                    }
                }
                logger.error('HTTP response =');
                try {
                    logger.error(response);
                } catch (error) {
                    logger.error('Can\'t serialize response object.' );
                }
                logger.error('===================');
            }
        }

    }
})(module.exports);
