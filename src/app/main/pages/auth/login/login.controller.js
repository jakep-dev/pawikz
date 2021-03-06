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
    function LoginController($window, $location, $rootScope, clientConfig, authService,
                             authBusiness, toast, store, Idle, commonBusiness)
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
            $window.location.href = url;
        }

        function LogIn(userName, password)
        {
            authService.authenticate(userName, password).then(function(response)
            {
                if(response && response.responseInfo &&
                   response.userinfo)
                {

                    Idle.watch();

                    var token = response.userinfo.token;
                    var userId = response.userinfo.userId;
                    authBusiness.userInfo = response.userinfo;
                    authBusiness.userName = response.userinfo.fullName;
                    commonBusiness.emitWithArgument('UserFullName', response.userinfo.fullName);

                    store.set('user-info', authBusiness.userInfo);
                    store.set('x-session-token', token);

                    if(!clientConfig.socketInfo.socket || clientConfig.socketInfo.socket.disconnected)
                    {
                        clientConfig.socketInfo.doConnect();
                    }
                    clientConfig.socketInfo.context = {
                        token: response.userinfo.token,
                        userId: userId
                    };
                    clientConfig.socketInfo.socket.emit('init-socket', clientConfig.socketInfo.context,
                        function(data) {
                            if(data) {
                                var url = ('/dashboard/').concat(userId);
                                $location.url(url);
                                toast.simpleToast('Successfully logged in!');
                            } else {
                                toast.simpleToast('Cannot open multiple sessions!');
                                //dialog.status('app/main/pages/auth/login/dialog/login.dialog.html', false, false);
                            }
                        }
                    );
                }
            });
        }
    }
})();
