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

    logging.init = function (config, id) {

        workerId = id;

        winston.handleExceptions(
            new winston.transports.DailyRotateFile({
                level: config.logSetting.logLevel,
                dirname: config.logSetting.dirName,
                filename: config.logSetting.exceptionLogFilePath,
                datePattern: 'yyyy-MM-dd',
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
                    dirname: config.logSetting.dirName,
                    filename: config.logSetting.logFilePath,
                    datePattern: 'yyyy-MM-dd',
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

        logger.logIfHttpError = function (url, args, data, response) {
            if (response.statusCode >= 400) {
                logger.error('===================');
                logger.error('HTTP Error occured with status of ' + response.statusCode);
                logger.error('URL = "' + url + '"');
                logger.error('HTTP args =');
                logger.error(args);
                if (data) {
                    logger.error('HTTP data =');
                    if (typeof (data) == 'object' && data.toString) {
                        logger.error(data.toString('utf8'));
                    } else {
                        logger.error(data);
                    }
                }
                logger.error('HTTP response =');
                logger.error(response);
                logger.error('===================');
            }
        }
    }
})(module.exports);
