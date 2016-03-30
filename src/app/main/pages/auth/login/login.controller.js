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
    function LoginController($window, $location, $rootScope, authService, authBusiness, toast, store)
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
                console.log('Response of Authenticate --- ');
                console.log(response);

                if(angular.isDefined(response) &&
                   angular.isDefined(response.responseInfo) &&
                   angular.isDefined(response.userinfo))
                {
                    var token = response.userinfo.token;
                    var userId = response.userinfo.userId;

                    authBusiness.userInfo = response.userinfo;
                    authBusiness.userName = response.userinfo.fullName;

                    store.set('user-info', authBusiness.userInfo);
                    store.set('x-session-token', token);
                    var url = ('/dashboard/').concat(userId, '/', token, '/');
                    $location.url(url);
                    toast.simpleToast('Successfully logged in!');
                }
            });
        }
    }
})();