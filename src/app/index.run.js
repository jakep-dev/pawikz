(function ()
{
    'use strict';

    angular
        .module('advisen')
        .run(runBlock);

    /** @ngInject */
    function runBlock($rootScope, commonBusiness, store,
                      logger, clientConfig, Idle, $location)
    {
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams)
        {
            ///Removing the token if user is at login page.
            if(fromState && fromState.name === '' &&
                toState &&
                toState.name === 'app.pages_auth_login')
            {
                store.remove('x-session-token');
            }

            console.log('toParams - ');
            console.log(toParams);

            ///Initiate the socket for the client based on token.
            ///Placing it on the state change. b'coz for each state change and complete reload
            ///We need to make sure the user has a single socket available.
            ///If its already created we won't create it again.
            var token = store.get('x-session-token');
            var userInfo = store.get('user-info');
            logger.log(token, 'info');
            if(token)
            {

                console.log('UserInfo');
                console.log(userInfo);
                var userId = '';

                if(userInfo && userInfo.userId)
                {
                    userId = userInfo.userId;
                }
                else if(toParams && toParams.userId) {
                    userId = toParams.userId;
                }

                console.log('userId--');
                console.log(userId);


                if(clientConfig.socketInfo.socket.disconnected)
                {
                    clientConfig.socketInfo.socket.connect();
                }

                var type = commonBusiness.socketType(toState);
                Idle.watch();
                clientConfig.socketInfo.socket.emit('init-socket',{
                    token: token,
                    userId: userId
                }, function(data) {
                    if(data)
                    {
                        logger.log('Socket created for specific user', 'debug');
                    }
                    else {

                        logger.log('Socket already created for specific user', 'debug');
                    }
                });
            }

            commonBusiness.resetBottomSheet();
        });
    }
})();
