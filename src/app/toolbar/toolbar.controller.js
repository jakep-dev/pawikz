(function ()
{
    'use strict';

    angular
        .module('app.toolbar')
        .controller('ToolbarController', ToolbarController);

    /** @ngInject */
    function ToolbarController($rootScope, $mdSidenav, msNavFoldService, $location, $translate, store, authService, logger)
    {
        var vm = this;

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
               store.remove('userFullName');
               $location.url('/pages/auth/login');
               logger.simpleToast('Successfully logged out!', 'LogOut', 'info');
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
            logger.simpleToast('Language changed to ' + lang.title + '!', 'Language', 'info');
        }



    }

})();
