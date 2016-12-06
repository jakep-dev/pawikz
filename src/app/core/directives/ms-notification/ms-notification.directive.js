(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('MsNotificationController', msNotificationController)
        .directive('msNotification', msNotificationDirective);

    /** @ngInject */
    function msNotificationController(toast,
                                      $location, $interval, $scope, 
                                      commonBusiness, templateBusiness, notificationBusiness
                                     )
    {
        var vm = this;

        //Variables.
        vm.notifications = notificationBusiness.notifications;

        //Functions
        vm.processNotification = processNotification;
        vm.close = close;

        //Refresh binding to immediately show pdf status changes
        commonBusiness.onMsg('update-notification-binding', $scope, function () {
            $scope.$apply();
        });

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
            else if(not == 0)
            {
                notificationBusiness.notifications.splice(not, 1);
            }

        }

        function processNotification(notification)
        {
            switch (notification.type)
            {
                case 'Renewal':
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
        }
    }

})();