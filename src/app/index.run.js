(function ()
{
    'use strict';

    angular
        .module('advisen')
        .run(runBlock);

    /** @ngInject */
    function runBlock($rootScope, commonBusiness, store,
                      logger, clientConfig, Idle, $location, $document, $cookies)
    {
        function setRedisPath() {
            var path;
            var port;
            if($location.protocol() === 'http') {
                path = 'ws';
                port = 80;
            } else {
                path = 'wss';
                port = 443;
            }
            path += '://';
            path += $location.host();
            if($location.port() !==  port) {
                path += ':';
                path += $location.port();
            }
            clientConfig.socketInfo.socketCORSPath = path;
        }

        function setNonRedisPath() {
            var socketCORSPath = $location.protocol() + '://' + $location.host();
			if ($location.port != 80) {
				socketCORSPath += ':' + $location.port();
            }
            clientConfig.socketInfo.socketCORSPath = socketCORSPath;
        }

        function connect(){
            if(!clientConfig.socketInfo.socket || clientConfig.socketInfo.socket.disconnected) {
                var token = store.get('x-session-token');
                if(token) {
                    if(clientConfig.socketInfo.isRedis) {
                        setRedisPath();
                        clientConfig.socketInfo.socket = io(clientConfig.socketInfo.socketCORSPath,
                            {
                                transports: clientConfig.socketInfo.transports,
                                forceNew: true
                            }
                        );
                    } else {
                        setNonRedisPath();
                        clientConfig.socketInfo.socket = io.connect(clientConfig.socketInfo.socketCORSPath);
                    }
                    console.log('socketCORSPath = ' + clientConfig.socketInfo.socketCORSPath);

                    clientConfig.socketInfo.socket.on('connect',
                        function() {
                            clientConfig.socketInfo.socket.emit('room', token);
                        }
                    );
                }
            }
        }

        if(clientConfig.socketInfo.isRedis == undefined) {
            //set to true if the back end is using multi threading / redis, otherwise false
            //for developers debugging the app on local machine without redis installed set this value to false.
            if($cookies.get('isMultiThreading')) {
                clientConfig.socketInfo.isRedis = true;
            } else {
                clientConfig.socketInfo.isRedis = false;
            }
        }

        clientConfig.socketInfo.doConnect = connect;
		if (!clientConfig.socketInfo.socket || clientConfig.socketInfo.socket.disconnected) {
            if(!store.get('x-session-token')) {
                //for create workup or list workups from old advisen.com, we need to manually set the session token from the url
                var pathParts = $location.path().split(/\//);
                if(
                    ((pathParts[1] === 'workup') && (pathParts.length === 7)) || 
                    ((pathParts[1] === 'dashboard') && (pathParts.length === 5))
                ) {
                    store.set('x-session-token', $location.path().split(/\//)[3]);
                }
            }
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

            if(token)
            {
                var userId = '';
                if(toParams && toParams.userId) {
                    userId = toParams.userId;
                } else if(userInfo && userInfo.userId)
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
