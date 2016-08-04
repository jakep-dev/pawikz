
(function(socket)
{
    socket.init = function(server, config)
    {
        var io = require('socket.io').listen(server);

        io.sockets.on('connection', function (socket) {
           initializeSocket(socket);
           disConnectionSocket(socket);
        });


        ///Initialize the socket.
        ///Each user will have a specific socket based on token
        ///All communication related to individual updates should be done through that specific socket.
        ///Should not create multiple socket based on request.
        function initializeSocket(socket)
        {
            socket.on('init-socket', function(data, callback)
            {
                if(data in config.userSocketInfo)
                {
                    callback(false);
                }
                else {
                    callback(true);
                    socket.nickname = data;
                    config.userSocketInfo[socket.nickname] = socket;
                }
            });
        }

        ///Disconnect the socket when user logout.
        function disConnectionSocket(socket)
        {
            socket.on('disconnect', function(data)
            {
                if(!socket.nickname)
                    return;
                delete config.userSocketInfo[socket.nickname];
            });
        }

    }

})(module.exports);

