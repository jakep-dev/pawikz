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
            listenToPDFDownloadStatus: listenToPDFDownloadStatus,
            listenToWorkUpStatus: listenToWorkUpStatus,
            pushNotification: pushNotification,
            clearNotifications: clearNotifications,
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

        function clearNotifications() {
            business.notifications.length = 0;
        }

        //Push the notification details
        function pushNotification(data) {
            var returnObj = data;
            if (data) {
                business.notifications.push(data);
            }
            return returnObj;
        }

        function listenToPDFDownloadStatus(userId) {

            clientConfig.socketInfo.socket.on('pdf-download-status', function (response) {
                if (response) {

                    var notification = _.find(business.notifications, function (not) {
                        if (not.id === response.projectId &&
                            not.requestId === response.requestId && 
                            not.type === 'PDF-Download') {
                            return not;
                        }
                    });

                    if (notification) {
                        notification.requestId = response.requestId;
                        notification.progress = response.progress;
                    } else {
                        business.pushNotification({
                            id: response.projectId,
                            title: decodeURIComponent(response.project_name),
                            type: 'PDF-Download',
                            icon: 'file-pdf-o',
                            progress: response.progress,
                            disabled: true,
                            tooltip: 'PDF Generation still in-progress',
                            status: 'in-process',
                            userId: userId,
                            istrackable: true,
                            requestId: response.requestId
                        });
                    }
                    if (notification.progress === 100) {
                        dialog.close();
                        notification.status = 'complete';
                        notification.tooltip = 'PDF Generation complete';
                        notification.disabled = false;
                    } else if (response.progress === -1) {
                        dialog.close();
                        notification.status = 'error';
                        notification.tooltip = 'PDF Generation error';
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
                            icon: 'plus',
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
                        dialog.close();
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
                            icon: 'refresh',
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