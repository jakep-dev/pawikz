(function ()
{
    'use strict';

    angular
        .module('advisen')
        .run(runBlock);

    /** @ngInject */
    function runBlock($rootScope, commonBusiness, store, logger, clientConfig, Idle)
    {
        var socket = clientConfig.socketInfo;
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
            var token = store.get('x-session-token');
            logger.log(token, 'info');
            if(token)
            {
                Idle.watch();
                socket.emit('init-socket',token, function(data) {
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
