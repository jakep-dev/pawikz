
(function(socket)
{
    var _ = require('underscore');
    var workupBusiness;
    var logger;
    var redis;

    socket.init = function(server, config, workupBiz, log)
    {
        workupBusiness = workupBiz;
        redis = config.redis;
        logger = log;

        //Configure the websocket
        var io;
        if(redis.setSocketIO) {
            io = require('socket.io')(server);
            redis.setSocketIO(io);
            io.set('origins', config.socketIO.host);
            io.set('transports', config.client.transports);
        } else {
            io = require('socket.io').listen(server);
            io.set('origins', config.socketIO.host);
            io.set('transports', config.client.transports);
        }

        config.socketIO.socket = io;

        io.sockets.on('connection', function (socket) {

            //join individual room between user and all the servers in the cluster
            socket.on('room', function(room) {
                logger.debug('room message for ' + room);
                socket.join(room);
            });

           initializeSocket(socket);
           checkWorkUpInfo(socket);
           disConnectionSocket(socket);
        });

        /*Initialize the socket.
        *Each user will have a specific socket based on token
        *All communication related to individual updates should be done through that specific socket.
        *Should not create multiple socket based on request.
        *Join the workup-room to broadcast workup related updates to all users.*/
        function initializeSocket(socket)
        {
            logger.debug('Init socket');
            socket.on('init-socket', function(data, callback)
            {
                redis.getKeyCount(redis.SESSION_PREFIX + data.token, 
                    function(keys) {
                        logger.debug('[initializeSocket] init-socket:' + keys.length);
                        if(keys.length == 0) {
                            redis.setValue(redis.SESSION_PREFIX + data.token, { userId: data.userId, workups: []});
                            logger.debug('Adding to redis[' + data.token + ',' + data.userId + ']');
                            callback(true);
                        } else {
                            callback(false);
                        }
                    }
                );
            });
        }

        ///Disconnect the socket when user logout or connection lost.
        ///Leave the room as well.
        function disConnectionSocket(socket)
        {
            socket.on('disconnect', 
                function(data) {
                    logger.debug('Disconnected Socket');
                }
            );

            socket.on('client-disconnect', 
                function(data) {
                    if(data) {
                        releaseWorkUp(data.userId, data.token);
                        socket.leave(data.token);
                    }
                }
            );
        }

        function checkWorkUpInfo(socket)
        {
            logger.debug('checkWorkUpInfo Socket');
            socket.on('init-workup', function (data, callback)
            {
                redis.getValue(redis.SESSION_PREFIX + data.token, 
                    function(userContext) {
                        if(userContext) {
                            callback(userContext.workups);
                        } else {
                            callback(false);
                        }
                    }
                );
            })
        }

        function releaseWorkUp(userId, token)
        {
            logger.debug('releaseWorkUp - started');
            logger.debug('Release Workup - ');
            logger.debug('UserId - ' + userId);
            redis.getValue(redis.SESSION_PREFIX + token, 
                function(userContext) {
                    if(userContext) {
                        //userContext.workups
                        if(userContext.workups.length > 0) {
                            var availableWorkUp = [];
                            var unLock = [];
                            _.each(userContext.workups, function(work)
                            {
                                if(work.status !== 'delete') {
                                    work.status = 'complete';
                                    unLock.push(work, token);
                                }
                                else {
                                    availableWorkUp.push(work);
                                }
                            });
            
                            broadcastWorkUpRelease(userContext.workups);
                            unlock(unLock, token);
                            deleteWorkUp(userId, token, availableWorkUp);
                        }
                    }
                    logger.debug('Removing key ' + token + ' started');
                    redis.deleteKey(redis.SESSION_PREFIX + token);
                    logger.debug('Removing key ' + token + ' finished');
                }
            );
            logger.debug('releaseWorkUp - finished');
        }

        /*
        * Unlock the workup
        * */
        function unlock(unlockWorkUp, token)
        {
            logger.debug('unlock - started');
            logger.debug(unlockWorkUp);
            logger.debug(token);
            _.each(unlockWorkUp, function(workup)
            {
                if(workup.projectId)
                {
                    workupBusiness.unlock(workup.projectId, workup.userId, token);
                }
            });
            logger.debug('unlock - finished');
        }

        /*
        * Delete work-up details from the saved workup
        * */
        function deleteWorkUp(userId, token, availableWorkUp)
        {
            logger.debug('deleteWorkUp - started');
            logger.debug('AvailableWorkup after release - ');
            logger.debug(availableWorkUp);
            var workups = [];
            workups.push.apply(workups, availableWorkUp);
            redis.setValue(redis.SESSION_PREFIX + token, { userId:userId, workups: workups});
            logger.debug('deleteWorkUp - finished');
        }

        /*
        * Broadcast release work-ups
        * */
        function broadcastWorkUpRelease(workups)
        {
            logger.debug('broadcastWorkUpRelease - started');
            logger.debug(workups);
            config.socketIO.socket.sockets.emit('workup-room-message', {
                type: 'workup-info',
                data: workups
            });
            logger.debug('broadcastWorkUpRelease - finished');
        }
    }
})(module.exports);
