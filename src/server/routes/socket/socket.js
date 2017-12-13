
(function(socket)
{
    var _ = require('underscore');
    var workupBusiness;
    var logger;

    socket.init = function(server, config, workupBiz, log)
    {
        workupBusiness = workupBiz;
        logger = log;

        //Configure the websocket
        var io = require('socket.io').listen(server);
        io.set('origins', config.socketIO.host);
        io.set('transports', config.client.transports);
//        io.set('log level', config.client.logLevel);

        config.socketIO.socket = io;

        io.sockets.on('connection', function (socket) {
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
                logger.debug('Token - ' + data.token);
                if(data.token in config.userSocketInfo)
                {
                    logger.debug('Already In');
                    callback(false);
                }
                else {
                    callback(true);
                    socket.nickname = data.token;
                    socket.userid = data.userId;
                    socket.join('workup-room');
                    config.userSocketInfo[socket.nickname] = socket;
                    logger.debug('Adding to userSocketInfo');
                }
            });
        }

        ///Disconnect the socket when user logout or connection lost.
        ///Leave the room as well.
        function disConnectionSocket(socket)
        {
            socket.on('disconnect', function(data)
            {
                logger.debug('Disconnected Socket');
                if(!socket.nickname)
                    return;

                releaseWorkUp(socket.userid, socket.nickname);
                socket.leave('workup-room');
                delete config.userSocketInfo[socket.nickname];
                logger.debug(config.userSocketInfo);
            });
        }

        function checkWorkUpInfo(socket)
        {
            logger.debug('checkWorkUpInfo Socket');
            socket.on('init-workup', function (data, callback)
            {
                if(data.token in config.userSocketInfo)
                {
                    callback(config.socketData.workup)
                }
                else {
                    callback(false);
                }
            })
        }

        function releaseWorkUp(userId, token)
        {
            logger.debug('Release Workup - ');
            logger.debug('UserId - ' + userId);
            if(userId && config.socketData.workup &&
                config.socketData.workup.length > 0 )
            {
                var availableWorkUp = [];
                var unLock = [];

                _.each(config.socketData.workup, function(work)
                {
                    if(parseInt(work.userId) === parseInt(userId)
                        && work.status !== 'delete')
                    {
                        work.status = 'complete';
                        unLock.push(work, token);
                    }
                    else {
                        availableWorkUp.push(work);
                    }
                });

                broadcastWorkUpRelease();
                unlock(unLock, token);
                deleteWorkUp(availableWorkUp);
            }
        }

        /*
        * Unlock the workup
        * */
        function unlock(unlockWorkUp, token)
        {
            logger.debug('Unlock');
            logger.debug(unlockWorkUp);
            logger.debug(token);
            _.each(unlockWorkUp, function(workup)
            {
                if(workup.projectId)
                {
                    workupBusiness.unlock(workup.projectId, workup.userId, token);
                }
            });
        }

        /*
        * Delete work-up details from the saved workup
        * */
        function deleteWorkUp(availableWorkUp)
        {
            logger.debug('AvailableWorkup after release - ');
            logger.debug(availableWorkUp);
            config.socketData.workup = [];
            config.socketData.workup.push.apply(config.socketData.workup, availableWorkUp);
        }

        /*
        * Broadcast release work-ups
        * */
        function broadcastWorkUpRelease()
        {
            logger.debug('broadcastWorkUpRelease');
            logger.debug(config.socketData.workup);
            config.socketIO.socket.sockets.in('workup-room').emit('workup-room-message', {
                type: 'workup-info',
                data: config.socketData.workup
            });
        }

    }

})(module.exports);

