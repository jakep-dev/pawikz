(function(logging)
{
    var winston = require('winston');
    require('winston-daily-rotate-file');
    winston.emitErrs = true;
    var logger = null;

    function getTimestamp() {
        return (new Date()).toISOString();
    }

    function logFormatter(options) {
        if (options.message[options.message.length -1] == '\n') {
            options.message = options.message.replace(/\n$/, '');
        }
        //options.timestamp() +' ['+ options.level.toUpperCase() +'] '+ (undefined !== options.message ? options.message : '') + (options.meta && Object.keys(options.meta).length ? '\n\t'+ JSON.stringify(options.meta) : '' );
        return options.timestamp() +' ['+ options.level.toUpperCase() +'] '+ (undefined !== options.message ? options.message : '') + (options.meta && options.meta.stack ? '\n' + options.meta.stack : '' );
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

    logging.init = function (config) {

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
                timestamp: getTimestamp
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
    }
})(module.exports);
