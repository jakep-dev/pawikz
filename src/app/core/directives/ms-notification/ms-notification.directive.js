(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('MsNotificationController', msNotificationController)
        .directive('msNotification', msNotificationDirective);

    /** @ngInject */
    function msNotificationController(templateBusiness, $location, $interval, $scope, toast, commonBusiness)
    {
        var vm = this;

        //Variables.
        vm.notifications = templateBusiness.notifications;

        //Functions
        vm.processNotification = processNotification;
        vm.close = close;

        //Refresh binding to immediately show pdf status changes
        commonBusiness.onMsg('update-notification-binding', $scope, function () {
            $scope.$apply();
        });

        function close(notification)
        {
           var not = _.findIndex(templateBusiness.notifications, function(notify)
           {
               console.log(parseInt(notify.id));
               console.log(parseInt(notification.id));
               if(notify.id === notification.id)
               {
                   return notify;
               }
           });

            if(not >= 0)
            {
                delete templateBusiness.notifications[not];
                commonBusiness.emitMsg('update-notification-binding');
            }

            if(_.size(templateBusiness.notifications) === 0)
            {
                templateBusiness.notifications = [];
            }

        }

        function processNotification(notification)
        {
            notification.status = 'close';
            switch (notification.type)
            {
                case 'Renewal':
                case 'Create-WorkUp':
                    $location.url('/overview/' + notification.url);
                    break;

                case 'PDF-Download':
                    if(notification.status === 'complete')
                    {
                        templateBusiness.downloadTemplatePdf(notification.requestId, notification.title);
                    }
                    else if (notification.status === 'error') {
                        toast.simpleToast("Issue with PDF Download. Please try again.");
                    }
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