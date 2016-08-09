
(function(socket)
{
    var _ = require('underscore');

    socket.init = function(server, config)
    {
        var io = require('socket.io').listen(server);
        config.socketIO = io;

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
            socket.on('init-socket', function(data, callback)
            {
                console.log(data);
                if(data.token in config.userSocketInfo)
                {
                    callback(false);
                }
                else {
                    callback(true);
                    socket.nickname = data.token;
                    socket.userid = data.userId;
                    socket.join('workup-room');
                    config.userSocketInfo[socket.nickname] = socket;
                }
            });
        }

        ///Disconnect the socket when user logout or connection lost.
        ///Leave the room as well.
        function disConnectionSocket(socket)
        {
            socket.on('disconnect', function(data)
            {
                console.log('Disconnecting app');
                console.log(socket.userid);

                if(!socket.nickname)
                    return;

                releaseWorkUp(socket.userid);
                socket.leave('workup-room');
                delete config.userSocketInfo[socket.nickname];
            });
        }

        function checkWorkUpInfo(socket)
        {
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
            console.log('Releasing workup');
            if(userId && config.socketData.workup &&
                config.socketData.workup.length > 0 )
            {
                _.each(config.socketData.workup, function(work)
                {
                    if(parseInt(work.userId) === parseInt(userId))
                    {
                        work.status = 'complete';
                    }
                });
                console.log('After delete');
                console.log(config.socketData.workup);
                broadcastWorkUpRelease();
            }
        }

        function broadcastWorkUpRelease()
        {
            config.socketIO.sockets.in('workup-room').emit('workup-room-message', {
                type: 'workup-info',
                data: config.socketData.workup
            });
        }

    }

})(module.exports);

