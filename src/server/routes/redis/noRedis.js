
(function(r)
{
    var logger;
    var redis = require('ioredis');
    var redisAdapter;
    var redisHost;
    var redisPort;
    var redisClient;
    var redisClientReady = false;
    var redisSubscriber;
    var redisSubscriberReady = false;
    const SESSION_PREFIX = 'uwf_session_';
    var userInfo = [];

    r.SESSION_PREFIX = SESSION_PREFIX;

    r.init = function(config, log) {
        logger = log;
    }

    function getValue(key, callback) {
        if(userInfo[key]) {
            var value = new Object(userInfo[key]);
            callback(value);
        } else {
            callback(null);
        }
    }
    r.getValue = getValue;

    function getKeyCount(keyPattern, callback) {
        var list = new Array();
        var keys = Object.keys(userInfo);
        keys.forEach(
            function(keyValue) {
                if(keyValue.match(keyPattern)) {
                    list.push(keyValue);
                }
            }
        );
        logger.debug('getKeyCount for ' + keyPattern + ' has ' + list.length + ' elements');
        callback(list);
    }
    r.getKeyCount = getKeyCount;

    function setValue(key, value) {
        userInfo[key] = value;
        logger.debug('Value set [' + key + ',' + value + ']');
    }
    r.setValue = setValue;

    function deleteKey(key) {
        logger.debug(userInfo[key]);
        delete userInfo[key];
        logger.debug(userInfo[key]);
    }
    r.deleteKey = deleteKey;

})(module.exports);
