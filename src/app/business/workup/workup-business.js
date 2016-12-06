/**
 * Created by sherindharmarajan on 1/19/16.
 */
(function() {
    'use strict';

    angular
        .module('app.workup.business', [])
        .factory('workupBusiness', workupBusiness);

    /* @ngInject */
    function workupBusiness(workupService, authService, toast, store, dialog, clientConfig, commonBusiness, notificationBusiness) {

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

        function renewFromDashboard(userId, projectId, projectName)
        {
            workupService.renew(userId, projectId, 'fromDashboard');
            toast.simpleToast(projectName + ' getting ready for renewal');
            notificationBusiness.notifyNotificationCenter({
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
            workupService.create(userId, companyId, templateId).then(function(response)
            {
                console.log('CreateWorkUp-');
                console.log(response);
                if(response) {
                    notificationBusiness.notifyNotificationCenter({
                        id: response.projectId,
                        title: response.project_name || ('Project - ' + response.projectId),
                        type: 'Create-WorkUp',
                        icon: 'icon-library-plus',
                        progress: 15,
                        disabled: true,
                        tooltip: 'Create work-up still in-progress',
                        status: 'in-process',
                        userId: userId,
                        istrackable: true,
                        url: ''
                    }, 'notify-create-workup-notification-center');
                }
            });
        }

        function renew(userId, projectId, projectName, reloadEvent)
        {
            notificationBusiness.notifyNotificationCenter({
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
            workupService.renew(userId, projectId, reloadEvent);
            dialog.status('app/main/components/workup/dialog/workup.dialog.html', false, false);
        }

    }
})();
