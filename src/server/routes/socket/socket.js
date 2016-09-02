
(function(socket)
{
    var _ = require('underscore');

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


        ///Initialize the socket.
        ///Each user will have a specific socket based on token
        ///All communication related to individual updates should be done through that specific socket.
        ///Should not create multiple socket based on request.
        ///Join the workup-room to broadcast workup related updates to all users.
        function initializeSocket(socket)
        {
            console.log('Init socket');
            socket.on('init-socket', function(data, callback)
            {
                console.log(data);
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
                    console.log(config.userSocketInfo);
                }
            });
        }

        ///Disconnect the socket when user logout or connection lost.
        ///Leave the room as well.
        function disConnectionSocket(socket)
        {
            console.log('Disconnected Socket');
            socket.on('disconnect', function(data)
            {
                if(!socket.nickname)
                    return;

                releaseWorkUp(socket.userid);
                socket.leave('workup-room');
                delete config.userSocketInfo[socket.nickname];
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

        function releaseWorkUp(userId)
        {
            if(userId && config.socketData.workup &&
                config.socketData.workup.length > 0 )
            {
                var availableWorkUp = [];

                _.each(config.socketData.workup, function(work)
                {
                    if(parseInt(work.userId) === parseInt(userId))
                    {
                        work.status = 'complete';
                    }
                    else {
                        availableWorkUp.push(work);
                    }

                });
                broadcastWorkUpRelease();
                deleteWorkUp(availableWorkUp);
            }
        }

        function deleteWorkUp(availableWorkUp)
        {
            config.socketData.workup = [];
            config.socketData.workup.push.apply(config.socketData.workup, availableWorkUp);
        }

        function broadcastWorkUpRelease()
        {
            console.log('broadcastWorkUpRelease');
            config.socketIO.socket.sockets.in('workup-room').emit('workup-room-message', {
                type: 'workup-info',
                data: config.socketData.workup
            });
        }

    }

})(module.exports);

