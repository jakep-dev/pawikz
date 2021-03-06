(function () {
    'use strict';

    angular
        .module('app.notification.business', [])
        .service('notificationBusiness', notificationBusiness);

    /* @ngInject */
    function notificationBusiness(toast, dialog,
                                  $rootScope, $mdToast, $interval,
                                  clientConfig, logger, commonBusiness, workupService) {
        var business = {
            notifications: [],
            initializeMessages: initializeMessages,
            listenToPDFDownloadStatus: listenToPDFDownloadStatus,
            listenToWorkUpStatus: listenToWorkUpStatus,
            pushNotification: pushNotification,
            clearNotifications: clearNotifications,
            setDashboardCallback: setDashboardCallback,
            notifyNotificationCenter: notifyNotificationCenter,
            listenToRenewStatus: listenToRenewStatus,
            listenToDataRefreshStatus: listenToDataRefreshStatus,
            listenToSocket: listenToSocket
        };

        return business;

        var dashboardCallback = undefined;
        function setDashboardCallback(obj) {
            dashboardCallback = obj;
        }

        function listenToSocket (token, userId) {
            var socketInterval = $interval(function () {
                if(!clientConfig.socketInfo.socket || clientConfig.socketInfo.socket.disconnected)
                {
                    clientConfig.socketInfo.doConnect();
                }

                logger.log('ListenToSocket token - ', token, ' - ', userId);
                clientConfig.socketInfo.context = {
                    token: token,
                    userId: userId
                };
                if(token && userId) {
                    clientConfig.socketInfo.socket.emit('init-socket', clientConfig.socketInfo.context,
                        function(data) {
                        }
                    );
                }

                checkForNotificationStatusFor15();

                if(isAllNotificationCompleted()) {
                    console.log('Inside isAllNotificationCompleted')
                    $interval.cancel(socketInterval);
                }

            }, 10000, token, userId);
        }

        function checkForNotificationStatusFor15() {
            console.log('Check for status');
           var notification = _.find(business.notifications, function(not) {
                if (not.status === 'in-process' && not.type === 'Create-WorkUp'){
                    return not;
                }
            });

           if (notification) {
                workupService.checkStatus(notification.id)
                             .then(function(data){
                                    console.log('CheckStatus Response ', data);
                                    console.log('Notification ', notification);
                                    if(parseInt(data.templateStatus.percentage) !== parseInt(notification.progress)) {
                                        console.log('Inside');
                                        notification.progress = parseInt(data.templateStatus.percentage);
                                    }

                                    console.log('After Set Notification ', notification);

                                    if (notification.progress === 100) {
                                        dialog.close();
                                        notification.status = 'complete';
                                        notification.disabled = false;
                                        notification.url = notification.projectId;
                                        $rootScope.toastTitle = 'WorkUp Creation Completed!';
                                        $rootScope.toastProjectId = notification.projectId;
                                        $mdToast.show({
                                            hideDelay: 8000,
                                            position: 'bottom right',
                                            controller: 'WorkUpToastController',
                                            templateUrl: 'app/main/components/workup/toast/workup.toast.html'
                                        });
                                    }
                });
           }
        }

        function isAllNotificationCompleted() {
           var inProcess = _.filter(business.notifications, function(not) {
                if(not.status === 'in-process') {
                    return not;
                }
            });
            return !inProcess || (inProcess && inProcess.length === 0);
        }


        function notifyNotificationCenter(notification, message) {
            commonBusiness.emitWithArgument(message, notification);
        }

        function initializeMessages(scope) {
            commonBusiness.onMsg('notify-renewal-workup-notification-center', scope, function (ev, data) {
                business.pushNotification(data);
            });

            commonBusiness.onMsg('notify-data-refresh-workup-notification-center', scope, function (ev, data) {
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
                var notification = _.find(business.notifications, function (not) {
                    if (not.id === data.id &&
                        not.type === data.type &&
                        data.type !== 'PDF-Download') {
                        return not;
                    }
                });

                if (notification) {
                    notification.status = data.status;
                    notification.progress = data.progress;
                    notification.disabled = data.disabled;
                    notification.istrackable = data.istrackable;
                    returnObj = notification;
                } else {
                    business.notifications.push(data);
                }
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
                            title: decodeURIComponent(response.projectName),
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
                    if (response.progress && response.progress === 100) {
                        dialog.close();
                        notification.status = 'complete';
                        notification.tooltip = 'PDF Generation complete';
                        notification.disabled = false;
                    } else if (response.progress && response.progress === -1) {
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
                console.log('create-workup-status ', response);

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
                    listenToWorkupRenewalStatus(notification, response, userId);
                }
            });
        }

        function listenToWorkupRenewalStatus(notification, response, userId) {

            var projectName;

            if(notification) {
                if(response.projectId && response.project_name) {
                    notification.status = 'complete';
                    notification.progress = 100;
                    notification.disabled = false;
                    notification.url = parseInt(response.projectId);
                } else {
                    notification.status = 'error';
                    notification.tooltip = 'Workup Renewal error';
                    notification.progress = 100;
                    notification.disabled = false;
                    toast.simpleToast("Issue with Workup Renewal. Please try again.");
                }
            } else {
                projectName = response.project_name || '';

                business.pushNotification({
                    id: parseInt(response.old_project_id),
                    title: decodeURIComponent(projectName),
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

        function listenToDataRefreshStatus(userId) {
            clientConfig.socketInfo.socket.on('notify-data-refresh-workup-status', function (response) {
                if (response) {
                    var notification = _.find(business.notifications, function (not) {
                        if (not.type === 'DataRefresh' &&
                            not.id === parseInt(response.projectId)) {
                            return not;
                        }
                    });
                    listenToDataWorkupStatus(notification, response, userId);
                }
            });
        }

        //Common method for Data Refresh
        function listenToDataWorkupStatus(notification, response, userId){

            var projectId = null;
            var projectName;
            var tooltip;

            if (notification) {
                if(notification.type === 'DataRefresh' &&
                    notification.id === parseInt(response.projectId)){
                    projectId = response.projectId;
                    projectName = response.projectName;
                    tooltip = 'Refreshing data';
                }
    
                notification.status = 'complete';
                notification.progress = 100;
                notification.disabled = false;
                notification.url = parseInt(response.projectId);
                if (projectName && projectName != '') {
                    notification.title = projectName;
                }
            } else {
                business.pushNotification({
                    id: parseInt(projectId),
                    title: decodeURIComponent(projectName),
                    type: 'DataRefresh',
                    icon: 'refresh',
                    progress: 100,
                    disabled: false,
                    tooltip: tooltip + ' still in-progress',
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
    }
})();
