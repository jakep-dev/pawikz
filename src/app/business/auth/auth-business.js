/**
 * Created by sherindharmarajan on 1/4/16.
 */
(function() {
    'use strict';

    angular
        .module('app.auth.business', [])
        .service('authBusiness', authBusiness);

    /* @ngInject */
    function authBusiness($location, $mdDialog,
                          Idle, toast, store, dialog,
                          clientConfig, commonBusiness, authService, notificationBusiness) {
        this.userInfo = null;
        var userName = null;

        Object.defineProperty(this, 'userName', {
            enumerable: true,
            configurable: false,
            get: function() {
                return userName || store.get('x-session-user');
            },
            set: function(value) {
                userName = value;
                //store.set('x-session-user', userName);
                //commonBusiness.emitMsg('UserName');
            }
        });

        var business = {
            initIdle: initIdle,
            logOut: logOut
        };

        return business;

        function logOut()
        {
            Idle.unwatch();
            authService.logout().then(function(response)
            {
                clientConfig.socketInfo.socket.disconnect();
                store.remove('x-session-token');
                store.remove('user-info');
                $location.url('/pages/auth/login');
                toast.simpleToast('Successfully logged out!');
            });
            notificationBusiness.clearNotifications();
        }


        function initIdle($scope)
        {
            ///When user in Idle mode
            $scope.$on('IdleStart', function () {
                 dialog.status('app/main/pages/timeout/timeout.html', false, false);
            });


            ///Event fires when user start using the app
            $scope.$on('IdleEnd', function () {
                dialog.close();
            });


            ///Event fires when on timeout.
            $scope.$on('IdleTimeout', function () {
                dialog.close();
                logOut();
            });
        }
    }
})();