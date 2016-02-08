(function ()
{
    'use strict';

    angular
        .module('app.toolbar')
        .controller('ToolbarController', ToolbarController);

    /** @ngInject */
    function ToolbarController($rootScope, $scope, $mdSidenav, msNavFoldService, $location,
                               $translate, store, authService, commonBusiness, authBusiness, toast)
    {
        var vm = this;
        vm.userName = '';

        //Set user-name
        commonBusiness.onMsg('UserName', $scope, function() {
            console.log('UserName Emit');
            vm.userName = authBusiness.userName;
        });

        vm.selectedLanguage = {
            'title'      : 'English',
            'translation': 'TOOLBAR.ENGLISH',
            'code'       : 'en',
            'flag'       : 'gb'
        };

        // Data
        $rootScope.global = {
            search: ''
        };

        vm.languages = [
            {
                'title'      : 'English',
                'translation': 'TOOLBAR.ENGLISH',
                'code'       : 'en',
                'flag'       : 'gb'
            },
            {
                'title'      : 'Spanish',
                'translation': 'TOOLBAR.SPANISH',
                'code'       : 'es',
                'flag'       : 'es'
            }
        ];


        // Methods
        vm.toggleSidenav = toggleSidenav;
        vm.toggleNavigationSidenavFold = toggleNavigationSidenavFold;
        vm.logout = logout;
        vm.setUserStatus = setUserStatus;
        vm.changeLanguage = changeLanguage;

        //////////

        /**
         * Toggle sidenav
         *
         * @param sidenavId
         */
        function toggleSidenav(sidenavId)
        {
            $mdSidenav(sidenavId).toggle();
        }

        /**
         * Toggle navigation sidenav fold
         */
        function toggleNavigationSidenavFold(event)
        {
            event.preventDefault();

            msNavFoldService.toggleFold();
        }

        /**
         * Sets User Status
         * @param status
         */
        function setUserStatus(status)
        {
            vm.userStatus = status;
        }

        /**
         * Logout Function
         * Remove the stored token and navigate to login page
         */
        function logout()
        {
           authService.logout().then(function(response)
           {
               store.remove('x-session-token');
               store.remove('x-session-user');
               $location.url('/pages/auth/login');
               toast.simpleToast('Successfully logged out!');
           })
        }

        /**
         * Change Language
         */
        function changeLanguage(lang)
        {
            vm.selectedLanguage = lang;
            //Change the language
            $translate.use(lang.code);
            toast.simpleToast('Language changed to ' + lang.title + '!');
        }
    }

})();
