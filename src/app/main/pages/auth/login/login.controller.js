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
    function LoginController($window, $location, authService)
    {
        var vm = this;

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
                    if(response.responseInfo.code === 401)
                    {
                        $location.url('/dashboard-project/25357/testToken');
                    }
                }
                else {

                }
            });

            console.log(userName);
            console.log(password);
        }
    }
})();