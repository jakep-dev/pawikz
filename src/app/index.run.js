(function ()
{
    'use strict';

    angular
        .module('advisen')
        .run(runBlock);

    /** @ngInject */
    function runBlock($rootScope, commonBusiness, store,
                      logger, clientConfig, Idle, $location, $document)
    {
        var path;
        var port;
        if($location.protocol() === 'http') {
            path = 'http';
            port = 80;
        } else {
            path = 'https';
            port = 443;
        }
        path += '://';
        path += $location.host();
        if($location.port() !==  port) {
            path += ':';
            path += $location.port();
        }
        clientConfig.socketInfo.socketCORSPath = path;

        function connect(){
            if(!clientConfig.socketInfo.socket || clientConfig.socketInfo.socket.disconnected) {
                var token = store.get('x-session-token');
                if(token) {
                    console.log('socketCORSPath = ' + clientConfig.socketInfo.socketCORSPath);
                    clientConfig.socketInfo.socket = io(clientConfig.socketInfo.socketCORSPath,
                        {
                            transports: clientConfig.socketInfo.transports,
                            forceNew: true
                        }
                    );
                    clientConfig.socketInfo.socket.on('connect',
                        function() {
                            //console.log('connected - emit room number ' + token);
                            clientConfig.socketInfo.socket.emit('room', token);
                        }
                    );
                }
            }
        }

        clientConfig.socketInfo.doConnect = connect;
		if (!clientConfig.socketInfo.socket || clientConfig.socketInfo.socket.disconnected) {
            clientConfig.socketInfo.doConnect();
		}

        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams)
        {
            ///Removing the token if user is at login page.
            if(fromState && fromState.name === '' &&
                toState &&
                toState.name === 'app.pages_auth_login')
            {
                store.remove('x-session-token');
            }

            ///Initiate the socket for the client based on token.
            ///Placing it on the state change. b'coz for each state change and complete reload
            ///We need to make sure the user has a single socket available.
            ///If its already created we won't create it again.

            if(toParams &&
                toParams.token)
            {
                logger.log('Setting Token', 'info');
                logger.log(toParams.token, 'info');
                store.remove('x-session-token');
                store.set('x-session-token',toParams.token);
            }


            var token = store.get('x-session-token');
            var userInfo = store.get('user-info');
            //logger.log(token, 'info');

            if(token)
            {
                var userId = '';
                if(toParams && toParams.userId) {
                    userId = toParams.userId;
                }else if(userInfo && userInfo.userId)
                {
                    userId = userInfo.userId;
                }

                if(!clientConfig.socketInfo.socket || clientConfig.socketInfo.socket.disconnected)
                {
                    clientConfig.socketInfo.doConnect();
                }

                var type = commonBusiness.socketType(toState);
                $document[0].title = 'insite20twenty';
                Idle.watch();
                clientConfig.socketInfo.context = {
                    token: token,
                    userId: userId
                };
                clientConfig.socketInfo.socket.emit('init-socket', clientConfig.socketInfo.context,
                    function(data) {
                        if(data)
                        {
                            logger.log('Socket created for specific user', 'debug');
                        }
                        else {
                            logger.log('Socket already created for specific user', 'debug');
                        }
                    }
                );
            }

            commonBusiness.resetBottomSheet();
        });
    }
})();
