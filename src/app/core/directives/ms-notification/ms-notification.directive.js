(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('MsNotificationController', msNotificationController)
        .directive('msNotification', msNotificationDirective);

    /** @ngInject */
    function msNotificationController(toast,
                                      $location, $interval, $scope, $window,
                                      commonBusiness, templateBusiness, notificationBusiness, overviewBusiness
                                     )
    {
        var vm = this;

        //Variables.
        vm.notifications = notificationBusiness.notifications;
        vm.isNotification = false;
        vm.navClass = '';

        //Functions
        vm.processNotification = processNotification;
        vm.showNotifications = showNotifications;
        vm.close = close;

        //Refresh binding to immediately show pdf status changes
        commonBusiness.onMsg('update-notification-binding', $scope, function () {
            $scope.$apply();
        });

        function showNotifications(){
            vm.isNotification = !vm.isNotification;
            vm.navClass = vm.isNotification ? 'nav-active' : '';
        }

        function close(notification)
        {
            var not = _.findIndex(notificationBusiness.notifications, function (notify)
           {
               console.log(parseInt(notify.id));
               console.log(parseInt(notification.id));
               if(notify.id === notification.id)
               {
                   return notify;
               }
           });

            if(not > 0)
            {
                notificationBusiness.notifications.splice(not, not);
            }
            else if(not === 0)
            {
                notificationBusiness.notifications.splice(not, 1);
            }

        }

        //Process Notification based on type
        function processNotification(notification)
        {
            if(notification.progress >= 100){
                switch (notification.type)
                {
                    case 'Renewal':
                    case 'DataRefresh':
                    case 'Create-WorkUp':
                        $location.url('/overview/' + notification.url);
                        notification.status = 'close';
                        break;

                    case 'PDF-Download':
                        if(notification.status === 'complete')
                        {
                            templateBusiness.downloadTemplatePdf(notification.requestId, notification.title);
                        }
                        else if (notification.status === 'error') {
                            toast.simpleToast("Issue with PDF Download. Please try again.");
                        }
                        notification.status = 'close';
                        break;
                }
            }
            else{
                toast.simpleToast(notification.type + ' in-progress.');
            }
        }
    }

    /** @ngInject */
    function msNotificationDirective(toast)
    {
        return {
            restrict: 'E',
            scope:{

            },
            controller: 'MsNotificationController',
            controllerAs: 'vm',
            templateUrl: 'app/core/directives/ms-notification/ms-notification.html'
        };
    }

})();