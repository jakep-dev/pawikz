/**
 * Created by sherindharmarajan on 1/4/16.
 */
(function() {
    'use strict';

    angular
        .module('app.business')
        .service('authBusiness', authBusiness);

    /* @ngInject */
    function authBusiness(commonBusiness, dialog,
                          $location, authService, Idle, toast, store, clientConfig, $mdDialog) {
        this.userInfo = null;
        var userName = null;

        Object.defineProperty(this, 'userName', {
            enumerable: true,
            configurable: false,
            get: function() {
                console.log('auth get!');
                return userName || store.get('x-session-user');
            },
            set: function(value) {
                userName = value;
                store.set('x-session-user', userName);
                commonBusiness.emitMsg('UserName');
                console.log('auth set!');
            }
        });

        var business = {
            initIdle: initIdle
        };

        return business;

        function initIdle($scope)
        {
            ///When user in Idle mode
            $scope.$on('IdleStart', function () {
                console.log('Idle Start');
                 dialog.status('app/main/pages/timeout/timeout.html', false, false);
            });


            ///Event fires when user start using the app
            $scope.$on('IdleEnd', function () {
                dialog.close();
            });


            ///Event fires when on timeout.
            $scope.$on('IdleTimeout', function () {
                Idle.unwatch();
                authService.logout().then(function (response) {
                    dialog.close();
                    store.remove('x-session-token');
                    store.remove('user-info');
                    $location.url('/pages/auth/login');
                    toast.simpleToast('Session timed out');
                });

            });
        }
    }
})();
