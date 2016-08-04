/**
 * Created by sherindharmarajan on 11/12/15.
 */

(function ()
{
    'use strict';

    angular
        .module('app.pages.auth.login')
        .controller('LoginController', LoginController);

    /** @ngInject */
    function LoginController($window, $location, $rootScope, $scope, authService, authBusiness, toast, store, Idle, Keepalive)
    {
        var vm = this;

        $rootScope.isOperation = false;
        vm.LogIn = LogIn;
        vm.goUrl = goUrl;

        vm.textDetail = {
            value:'Html Variables',
            isdisabled:false
        };

        function goUrl(url)
        {
            console.log(url);
            $window.location.href = url;
        }

        function LogIn(userName, password)
        {

            var socket = io.connect();
            authService.authenticate(userName, password).then(function(response)
            {
                if(angular.isDefined(response) &&
                   angular.isDefined(response.responseInfo) &&
                   angular.isDefined(response.userinfo))
                {

                    Idle.watch();

                    var token = response.userinfo.token;
                    var userId = response.userinfo.userId;

                    socket.emit('init-socket', response.userinfo.token, function(data)
                    {
                        if(data)
                        {
                            authBusiness.userInfo = response.userinfo;
                            authBusiness.userName = response.userinfo.fullName;

                            console.log('authBusiness.userInfo');
                            console.log(authBusiness.userInfo);

                            store.set('user-info', authBusiness.userInfo);
                            store.set('x-session-token', token);
                            var url = ('/dashboard/').concat(userId);
                            $location.url(url);
                            toast.simpleToast('Successfully logged in!');
                        }
                        else {
                            toast.simpleToast('Cannot open multiple sessions!');
                        }
                    });
                }
            });
        }
    }
})();