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
    function LoginController($window, $location, $rootScope, clientConfig, authService, authBusiness, toast, store, Idle)
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
            authService.authenticate(userName, password).then(function(response)
            {
                if(angular.isDefined(response) &&
                   angular.isDefined(response.responseInfo) &&
                   angular.isDefined(response.userinfo))
                {

                    Idle.watch();

                    var token = response.userinfo.token;
                    var userId = response.userinfo.userId;

                    if(clientConfig.socketInfo.socket.disconnected)
                    {
                        clientConfig.socketInfo.socket.connect();
                    }

                    clientConfig.socketInfo.socket.emit('init-socket', {
                        token: response.userinfo.token,
                        userId: userId
                    }, function(data)
                    {
                        console.log('Return data');
                        console.log(data);
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