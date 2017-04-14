(function(logging)
{
    var winston = require('winston');
    require('winston-daily-rotate-file');
    winston.emitErrs = true;
    var logger = null;

    function getTimestamp() {
        return (new Date()).toISOString();
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
                    timestamp: getTimestamp
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
                    colorize: true,
                    prettyPrint: true,
                    timestamp: getTimestamp
                }
            );
        }
    }
})(module.exports);
