
(function(socket)
{
    var _ = require('underscore');
    var workupBusiness = require('../workup/workup.business');

    socket.init = function(server, config)
    {
        //Configure the websocket
        var io = require('socket.io').listen(server);
        io.set('origins', config.socketIO.host);
        io.set('transports', config.client.transports);
        io.set('log level', config.client.logLevel);

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
            console.log('Init socket');
            socket.on('init-socket', function(data, callback)
            {
                console.log('Token - ' + data.token);
                if(data.token in config.userSocketInfo)
                {
                    console.log('Already In');
                    callback(false);
                }
                else {
                    callback(true);
                    socket.nickname = data.token;
                    socket.userid = data.userId;
                    socket.join('workup-room');
                    config.userSocketInfo[socket.nickname] = socket;
                    console.log('Adding to userSocketInfo');
                }
            });
        }

        ///Disconnect the socket when user logout or connection lost.
        ///Leave the room as well.
        function disConnectionSocket(socket)
        {
            socket.on('disconnect', function(data)
            {
                console.log('Disconnected Socket');
                if(!socket.nickname)
                    return;

                releaseWorkUp(socket.userid, socket.nickname);
                socket.leave('workup-room');
                delete config.userSocketInfo[socket.nickname];
                console.log(config.userSocketInfo);
            });
        }

        function checkWorkUpInfo(socket)
        {
            console.log('checkWorkUpInfo Socket');
            socket.on('init-workup', function(data, callback)
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
            console.log('Release Workup - ');
            console.log('UserId - ' + userId);
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
            console.log('Unlock');
            console.log(unlockWorkUp);
            console.log(token);
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
            console.log('AvailableWorkup after release - ');
            console.log(availableWorkUp);
            config.socketData.workup = [];
            config.socketData.workup.push.apply(config.socketData.workup, availableWorkUp);
        }

        /*
        * Broadcast release work-ups
        * */
        function broadcastWorkUpRelease()
        {
            console.log('broadcastWorkUpRelease');
            console.log(config.socketData.workup);
            config.socketIO.socket.sockets.in('workup-room').emit('workup-room-message', {
                type: 'workup-info',
                data: config.socketData.workup
            });
        }

    }

})(module.exports);

