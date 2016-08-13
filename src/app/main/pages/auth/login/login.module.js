/**
 * Created by sherindharmarajan on 11/12/15.
 */


(function ()
{
    'use strict';

    angular
        .module('app.pages.auth.login', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider)
    {
        // State
        $stateProvider.state('app.pages_auth_login', {
            url      : '/pages/auth/login',
            views    : {
                'main@'                          : {
                    templateUrl: 'app/core/layouts/content-only.html'
                },
                'content@app.pages_auth_login': {
                    templateUrl: 'app/main/pages/auth/login/login.html',
                    controller : 'LoginController as vm'
                }
            },
            bodyClass: 'login-v2'
        });

        // Translation
        $translatePartialLoaderProvider.addPart('app/main/pages/auth/login');
    }

})();