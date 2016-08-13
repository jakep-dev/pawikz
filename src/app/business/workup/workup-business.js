/**
 * Created by sherindharmarajan on 1/19/16.
 */
(function() {
    'use strict';

    angular
        .module('app.workup.business', [])
        .factory('workupBusiness', workupBusiness);

    /* @ngInject */
    function workupBusiness(workupService, authService, toast,  store, dialog, clientConfig, commonBusiness) {

        var business = {
                initialize: initialize,
                renew: renew
        };

        return business;

        ///Initialize the authentication service
        function initialize(token)
        {
            store.set('x-session-token', token);
            authService.getUserInfo().then(function(response)
            {
                response.token = token;
                store.set('user-info', response);
            });
        }

        function renew(userId, projectId, reloadEvent)
        {
            renewComplete(reloadEvent);
            workupService.renew(userId, projectId);
            dialog.status('app/main/components/workup/dialog/workup.dialog.html', false, false);
        }

        function renewComplete(reloadEvent)
        {
            clientConfig.socketInfo.socket.on('notify-renew-workup-status', function(data)
            {
                dialog.close();
                if(reloadEvent !== '')
                {
                    console.log('Emit Msg - ' + reloadEvent);
                    commonBusiness.emitMsg(reloadEvent);
                }
            });
        }
    }
})();
