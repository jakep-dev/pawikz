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
        var socketCORSPath = $location.protocol() + '://' + $location.host();
        if ($location.port != 80) {
            socketCORSPath += ':' + $location.port();
        }

		if (!clientConfig.socketInfo.socket) {
			console.log('socketCORSPath = ' + socketCORSPath);
			clientConfig.socketInfo.socket = io.connect(socketCORSPath);
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
            logger.log(token, 'info');

            if(token)
            {
                var userId = '';
                if(toParams && toParams.userId) {
                    userId = toParams.userId;
                }else if(userInfo && userInfo.userId)
                {
                    userId = userInfo.userId;
                }

                if(clientConfig.socketInfo.socket.disconnected)
                {
                    //clientConfig.socketInfo.socket.connect();
                    clientConfig.socketInfo.socket = io.connect(socketCORSPath);
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
