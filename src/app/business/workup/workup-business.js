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
                renew: renew,
                createWorkUp: createWorkUp,
                renewFromDashboard: renewFromDashboard
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

        function NotifyNotificationCenter(notification, message)
        {
            commonBusiness.emitWithArgument(message, notification);
        }

        function renewFromDashboard(userId, projectId, projectName)
        {
            workupService.renew(userId, projectId);
            toast.simpleToast(projectName + ' getting ready for renewal');
            NotifyNotificationCenter({
                id: projectId,
                title: projectName,
                type: 'Renewal',
                icon: 'icon-rotate-3d',
                progress: 15,
                disabled: true,
                tooltip: 'Renewal still in-progress',
                status: 'in-process',
                userId: userId,
                istrackable: false,
                url: projectId
            }, 'notify-renewal-workup-notification-center');
        }

        function createWorkUp(userId, companyId, templateId)
        {
            workupService.create(userId, companyId, templateId);

            NotifyNotificationCenter({
                id: companyId + '_' + templateId,
                title: 'Create Work-Up - ' + companyId,
                type: 'Create-WorkUp',
                icon: 'icon-library-plus',
                progress: 15,
                disabled: true,
                tooltip: 'Create work-up still in-progress',
                status: 'in-process',
                userId: userId,
                istrackable: false,
                url: ''
            }, 'notify-create-workup-notification-center');
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
                    commonBusiness.emitMsg(reloadEvent);
                }
            });
        }
    }
})();
