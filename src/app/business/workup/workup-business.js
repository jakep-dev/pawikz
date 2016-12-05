/**
 * Created by sherindharmarajan on 1/19/16.
 */
(function() {
    'use strict';

    angular
        .module('app.workup.business', [])
        .factory('workupBusiness', workupBusiness);

    /* @ngInject */
    function workupBusiness(workupService, authService, toast, store, dialog, clientConfig, commonBusiness, templateBusiness) {

        var business = {
                initialize: initialize,
                renew: renew,
                createWorkUp: createWorkUp,
                renewFromDashboard: renewFromDashboard,
                setDashboardCallback: setDashboardCallback,
                backgroudRenewStatusListener: backgroudRenewStatusListener
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

        var dashboardCallback = undefined;
        function setDashboardCallback(obj) {
            dashboardCallback = obj;
        }

        function renewFromDashboard(userId, projectId, projectName)
        {
            //renewComplete(null);
            workupService.renew(userId, projectId, 'fromDashboard');
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
            workupService.create(userId, companyId, templateId).then(function(response)
            {
                console.log('CreateWorkUp-');
                console.log(response);
                if(response) {
                    NotifyNotificationCenter({
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
            //renewComplete(reloadEvent);
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
            workupService.renew(userId, projectId, reloadEvent);
            dialog.status('app/main/components/workup/dialog/workup.dialog.html', false, false);
        }

        //function renewComplete(reloadEvent)
        //{
        //    if (dashboardCallback) {
        //        clientConfig.socketInfo.socket.on('notify-renew-workup-status', dashboardCallback);
        //    } else {
        //        clientConfig.socketInfo.socket.on('notify-renew-workup-status', function (data) {
        //            dialog.close();
        //            if (reloadEvent !== '') {
        //                commonBusiness.emitWithArgument(reloadEvent, data);
        //            }
        //        });
        //    }
        //}

        function backgroudRenewStatusListener(userId) {
            clientConfig.socketInfo.socket.on('notify-renew-workup-status', function (response) {
                if (response) {
                    var notification = _.find(templateBusiness.notifications, function (not) {
                        if (not.type === 'Renewal' &&
                            not.id === parseInt(response.old_project_id)) {
                            return not;
                        }
                    });
                    if (notification) {
                        notification.status = 'complete';
                        notification.progress = 100;
                        notification.disabled = false;
                        notification.url = parseInt(response.projectId);
                        if (response.project_name && response.project_name != '') {
                            notification.title = response.project_name;
                        }
                    } else {
                        templateBusiness.pushNotification({
                            id: parseInt(response.old_project_id),
                            title: decodeURIComponent(response.project_name),
                            type: 'Renewal',
                            icon: 'icon-rotate-3d',
                            progress: 100,
                            disabled: false,
                            tooltip: 'Renewal work-up still in-progress',
                            status: 'complete',
                            userId: userId,
                            istrackable: false,
                            url: parseInt(response.projectId)
                        });
                    }
                    if (response.source && response.source === 'fromDashboard' && dashboardCallback) {
                        dashboardCallback(response);
                    } else if (response.source && ((response.source === 'reload-overview') || (response.source === 'reload-steps'))) {
                        dialog.close();
                    }
                    commonBusiness.emitMsg('update-notification-binding');
                }
            });
        }

    }
})();
