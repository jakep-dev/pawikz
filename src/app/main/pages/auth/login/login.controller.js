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
    function LoginController($window, $location, $rootScope, authService, logger, store)
    {
        var vm = this;

        $rootScope.isOperation = false;
        vm.LogIn = LogIn;
        vm.goUrl = goUrl;

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

                if(angular.isDefined(response) && angular.isDefined(response.responseInfo))
                {
                    if(response.responseInfo.code === 200 && angular.isDefined(response.userinfo))
                    {
                        var token = response.userinfo.token;
                        var userId = response.userinfo.userId;
                        $rootScope.userFullName = response.userinfo.fullName;

                        store.set('x-session-token', token);
                        var url = ('/dashboard-project/').concat(userId, '/', token, '/', false);
                        $location.url(url);
                        logger.simpleToast('Successfully logged in!', 'Login', 'info');
                    }
                    else {
                        logger.actionToast('Invalid UserName or Password!', 'Authenticate', 'error');
                    }
                }
                else {
                    logger.actionToast('Invalid UserName or Password!', 'Authenticate', 'error');
                }

            });
        }
    }
})();