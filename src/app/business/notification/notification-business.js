(function () {
    'use strict';

    angular
        .module('app.notification.business', [])
        .service('notificationBusiness', notificationBusiness);

    /* @ngInject */
    function notificationBusiness(toast, dialog,
                                  $rootScope, $mdToast, 
                                  clientConfig, commonBusiness) {
        var business = {
            notifications: [],
            initializeMessages: initializeMessages,
            addNotification: addNotification,
            listenToPDFDownloadStatus: listenToPDFDownloadStatus,
            listenToWorkUpStatus: listenToWorkUpStatus,
            pushNotification: pushNotification,
            setDashboardCallback: setDashboardCallback,
            notifyNotificationCenter: notifyNotificationCenter,
            listenToRenewStatus: listenToRenewStatus
        };

        return business;

        var dashboardCallback = undefined;
        function setDashboardCallback(obj) {
            dashboardCallback = obj;
        }

        function notifyNotificationCenter(notification, message) {
            commonBusiness.emitWithArgument(message, notification);
        }

        function initializeMessages(scope) {
            commonBusiness.onMsg('notify-renewal-workup-notification-center', scope, function (ev, data) {
                business.pushNotification(data);
            });
        }

        ///Id - Needs to be unique.
        ///title - Which displays on the notification center
        ///type - PDF-Download, Renew, CreateWorkUp - will expand in future
        ///icon - To display for actions icon-file-pdf-box (PDF Download), icon-rotate-3d (Renew)
        ///progress - To show the progress of actions initiated
        function addNotification(id, title, type, icon, progress, disabled, tooltip, status, userId, istrackable, requestId) {
            return {
                id: id,
                title: title,
                type: type,
                icon: icon,
                progress: progress,
                disabled: disabled,
                tooltip: tooltip,
                status: status,
                userId: userId,
                istrackable: istrackable,
                requestId: requestId
            };
        }

        //Push the notification details
        function pushNotification(data) {
            console.log('Push Notification-');
            console.log(data);
            var returnObj = data;
            if (data) {
                var notification = _.find(business.notifications, function (not) {
                    if (not.id === data.id &&
                       not.type === data.type) {
                        return not;
                    }
                });

                if (notification) {
                    notification.status = data.status;
                    notification.progress = data.progress;
                    notification.disabled = data.disabled;
                    notification.istrackable = data.istrackable;
                    returnObj = notification;
                }
                else {
                    business.notifications.push(data);
                }
            }
            return returnObj;
        }

        function listenToPDFDownloadStatus(userId) {

            clientConfig.socketInfo.socket.on('pdf-download-status', function (response) {
                if (response) {

                    var notification = _.find(business.notifications, function (not) {
                        if (not.status === 'in-process' &&
                            not.type === 'PDF-Download' &&
                            not.requestId === response.requestId) {
                            return not;
                        }
                    });

                    if (notification) {
                        notification.requestId = response.requestId;
                        notification.progress = response.progress;
                    } else {
                        notification = addNotification(response.projectId, decodeURIComponent(response.projectName), 'PDF-Download', 'icon-file-pdf-box', response.progress, true, '', 'in-process', userId, true, 0);
                        notification.requestId = response.requestId;
                        business.notifications.push(notification);
                    }
                    if (notification.progress === 100) {
                        notification.status = 'complete';
                        notification.disabled = false;
                    } else if (response.progress === -1) {
                        notification.status = 'error';
                        notification.progress = 100;
                        notification.disabled = false;
                        toast.simpleToast("Issue with PDF Download. Please try again.");
                    }
                    commonBusiness.emitMsg('update-notification-binding');
                }
            });
        }

        function listenToWorkUpStatus(userId) {
            clientConfig.socketInfo.socket.on('create-workup-status', function (response) {
                if (response) {

                    var notification = _.find(business.notifications, function (not) {
                        if (not.status === 'in-process' &&
                            not.type === 'Create-WorkUp' &&
                            not.id === response.projectId) {
                            return not;
                        }
                    });

                    if (notification) {
                        notification.progress = response.progress;
                    } else {
                        notification = business.pushNotification({
                            id: response.projectId,
                            title: decodeURIComponent(response.project_name) || ('Project - ' + response.projectId),
                            type: 'Create-WorkUp',
                            icon: 'icon-library-plus',
                            progress: response.progress,
                            disabled: true,
                            tooltip: 'Create work-up still in-progress',
                            status: 'in-process',
                            userId: userId,
                            istrackable: true,
                            url: ''
                        });
                    }
                    if (notification.progress === 100) {
                        notification.status = 'complete';
                        notification.disabled = false;
                        notification.url = response.projectId;
                        $rootScope.toastTitle = 'WorkUp Creation Completed!';
                        $rootScope.toastProjectId = response.projectId;
                        $mdToast.show({
                            hideDelay: 8000,
                            position: 'bottom right',
                            controller: 'WorkUpToastController',
                            templateUrl: 'app/main/components/workup/toast/workup.toast.html'
                        });
                    }
                    commonBusiness.emitMsg('update-notification-binding');
                }
            });
        }

        function listenToRenewStatus(userId) {
            clientConfig.socketInfo.socket.on('notify-renew-workup-status', function (response) {
                if (response) {
                    var notification = _.find(business.notifications, function (not) {
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
                        business.pushNotification({
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