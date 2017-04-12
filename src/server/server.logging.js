(function(logging)
{
    var winston = require('winston');
    winston.emitErrs = true;
    var logger = null;

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

        logger = new winston.Logger({
            transports: [
                new winston.transports.File({
                    level: config.serverConfig.logLevel,
                    filename: config.serverConfig.logFilePath,
                    handleExceptions: true,
                    humanReadableUnhandledException: true,
                    json: false,
                    maxsize: config.serverConfig.maxSize,
                    maxFiles: config.serverConfig.maxFiles,
                    tailable: true,
                    colorize: false,
                    prettyPrint: true,
                    timestamp: function () {
                        return (new Date()).toISOString();
                    }
                }),
                new winston.transports.Console({
                    level: config.serverConfig.logLevel,
                    handleExceptions: true,
                    json: false,
                    colorize: true,
                    prettyPrint: true,
                    timestamp: function () {
                        return (new Date()).toISOString();
                    }
                })
            ],
            exitOnError: false
        });
    }
})(module.exports);
