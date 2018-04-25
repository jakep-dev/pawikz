
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
    var socketIO;
    var keyExprirationTime = 60 * 60;
    const SESSION_PREFIX = 'uwf_session_';

    r.SESSION_PREFIX = SESSION_PREFIX;

    r.init = function(config, log) {
        logger = log;
        keyExprirationTime = config.redisKeyTTL;
        redisClient = new redis.Cluster(
            config.redisCluster,
            {
                scaleReads: 'slave'
            }
        );
        redisClient.on('ready', 
            function(err, reply){
                logger.info('Redis redisClient: Connected');
                redisClientReady = true;
            }
        );
        redisSubscriber = new redis.Cluster(
            config.redisCluster,
            {
                scaleReads: 'slave'
            }
        );
        redisSubscriber.on('ready', 
            function(err, reply){
                logger.info('Redis redisSubscriber: Connected');
                redisSubscriberReady = true;
            }
        );

        var intervalHandle = setInterval(
            function() {
                if(redisClientReady && redisSubscriberReady) {
                    redisClientReady = false;
                    redisSubscriberReady = false;
                    configureRedisAdapter();
                    clearInterval(intervalHandle);
                }
            }, 10
        );
    }

    function configureRedisAdapter() {
        redisAdapter = require('socket.io-redis');
        socketIO.adapter(
            redisAdapter(
                //user redis url if you don't want to build pubClient and subClient
                //redis://:<password>@<ip>:<port>/'
                {
                    pubClient: redisClient, 
                    subClient: redisSubscriber
                }
            )
        );
    }

    function getRedisHost() {
        return redisHost;
    }
    r.getRedisHost = getRedisHost;

    function getRedisPort() {
        return redisPort;
    }
    r.getRedisPort = getRedisPort;

    function getRedisClient() {
        return redisClient;
    }
    r.getRedisClient = getRedisClient;

    function setSocketIO(io) {
        socketIO = io;
    }
    r.setSocketIO = setSocketIO;

    function getValue(key, callback) {
        redisClient.get(key, 
            function (err, reply) {
                if (err) throw err;
                var obj;
                try {
                    obj = JSON.parse(reply);
                } catch(error) {
                    obj = reply;
                }
                callback(obj);
            }
        );
    }
    r.getValue = getValue;

    function getKeyCount(keyPattern, callback) {
        var nodes = redisClient.nodes('master');
        Promise.all(
            nodes.map(
                function(node) {
                    return node.keys(keyPattern);
                }
          )
        ).then(
            function(allKeysLists) {
                var list = new Array();
                allKeysLists.forEach(
                    function(keyList) {
                            keyList.forEach(
                            function(keyValue) {
                                list.push(keyValue);
                            }
                        );
                    }
                );
                callback(list);
            }
        );
    }
    r.getKeyCount = getKeyCount;

    function setValue(key, value) {
        if(typeof value === 'object') {
            value = JSON.stringify(value);
        }
        redisClient.setex(key, keyExprirationTime, value, 
            function(error, reply) {
                if(error) {
                    logger.errorRequest('Error setting value for key = ' + key, key);
                } else {
                    logger.debugRequest('Value set [' + key + ',' + value + ']', key);
                }
            }
        );
    }
    r.setValue = setValue;

    function deleteKey(key) {
        redisClient.del(key);
    }
    r.deleteKey = deleteKey;

})(module.exports);
