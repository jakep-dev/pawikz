/**
 * Created by sherindharmarajan on 1/19/16.
 */
(function() {
    'use strict';

    angular
        .module('app.workup.business', [])
        .factory('workupBusiness', workupBusiness);

    /* @ngInject */
    function workupBusiness($location, navConfig, workupService, authService, toast, store, dialog,
                            clientConfig, notificationBusiness, commonBusiness) {

        var business = {
                initialize: initialize,
                renew: renew,
                createWorkUp: createWorkUp,
                renewFromDashboard: renewFromDashboard,
                refresh : refresh
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

        //Renew the workup details from dashboard.
        function renewFromDashboard(userId, projectId, projectName)
        {
            notificationBusiness.notifyNotificationCenter({
                id: projectId,
                title: projectName,
                type: 'Renewal',
                icon: 'refresh',
                progress: 15,
                disabled: true,
                tooltip: 'Renewal still in-progress',
                status: 'in-process',
                userId: userId,
                istrackable: false,
                url: projectId
            }, 'notify-renewal-workup-notification-center');
            workupService.renew(userId, projectId, 'fromDashboard');
            dialog.notify('Renewing Workup', 'Go to Notification Center ',
                '<md-icon md-font-icon="icon-bell"></md-icon> <span> to open</span>',
                null, null, null, false);
        }

        //Add create workup details to notification center and show dialog box to user.
        function createWorkUp(userId, companyId, templateId)
        {
            workupService.create(userId, companyId, templateId).then(function(response)
            {
                if(response) {
                    notificationBusiness.notifyNotificationCenter({
                        id: response.projectId,
                        title: response.project_name || ('Project - ' + response.projectId),
                        type: 'Create-WorkUp',
                        icon: 'plus',
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
            var token =  store.get('x-session-token');
            $location.url('/dashboard/'+ userId +'/'+token+'/'+ true);
            dialog.notify('Creating Workup', 'Go to Notification Center ',
                '<md-icon md-font-icon="icon-bell"></md-icon> <span> to open</span>',
                null,
                {
                    ok: {
                        callBack: function() {
                            dialog.close();
                        }
                    }
                }, null, false);
        }

        //Add renew workup details to notification center and show dialog box to user.
        function renew(userId, projectId, projectName, reloadEvent)
        {
            notificationBusiness.notifyNotificationCenter({
                id: projectId,
                title: projectName,
                type: 'Renewal',
                icon: 'refresh',
                progress: 15,
                disabled: true,
                tooltip: 'Renewal still in-progress',
                status: 'in-process',
                userId: userId,
                istrackable: false,
                url: projectId
            }, 'notify-renewal-workup-notification-center');
            workupService.renew(userId, projectId, reloadEvent);

            dialog.notify('Renewing Workup', 'Go to Notification Center ',
                '<md-icon md-font-icon="icon-bell"></md-icon> <span> to open</span>',
                null,
                {
                    ok: {
                        callBack: function() {
                            navConfig.sideNavItems.splice(0, _.size(navConfig.sideNavItems));
                            $location.url('/dashboard/'+ commonBusiness.userId );
                        }
                    }
                }, null, false);
        }

        //Add refresh workup details to notification center and show dialog box to user.
        function refresh(userId, projectId, projectName, reloadEvent)
        {
            notificationBusiness.notifyNotificationCenter({
                id: projectId,
                title: projectName,
                type: 'Refresh',
                icon: 'refresh',
                progress: 15,
                disabled: true,
                tooltip: 'Refreshing still in-progress',
                status: 'in-process',
                userId: userId,
                istrackable: false,
                url: projectId
            }, 'notify-refresh-workup-notification-center');
            workupService.refresh(userId, projectId, projectName, reloadEvent);

            dialog.notify('Refreshing Workup', 'Go to Notification Center ',
                '<md-icon md-font-icon="icon-bell"></md-icon> <span> to open</span>',
                null,
                {
                    ok: {
                        callBack: function() {
                            navConfig.sideNavItems.splice(0, _.size(navConfig.sideNavItems));
                            $location.url('/dashboard/'+ commonBusiness.userId );
                        }
                    }
                }, null, false);
        }
    }
})();
