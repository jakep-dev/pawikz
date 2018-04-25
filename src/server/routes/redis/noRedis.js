
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
        logger.debugRequest('getKeyCount for ' + keyPattern + ' has ' + list.length + ' elements', keyPattern);
        callback(list);
    }
    r.getKeyCount = getKeyCount;

    function setValue(key, value) {
        userInfo[key] = value;
        if(typeof value === 'object') {
            value = JSON.stringify(value);
        }
        logger.debugRequest('Value set [' + key + ',' + value + ']', key);
    }
    r.setValue = setValue;

    function deleteKey(key) {
        logger.debugRequest(userInfo[key], key);
        delete userInfo[key];
        logger.debugRequest(userInfo[key], key);
    }
    r.deleteKey = deleteKey;

})(module.exports);
