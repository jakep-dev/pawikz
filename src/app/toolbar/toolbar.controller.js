(function ()
{
    'use strict';

    angular
        .module('app.toolbar')
        .controller('ToolbarController', ToolbarController);

    /** @ngInject */
    function ToolbarController($rootScope, $scope, $mdSidenav, msNavFoldService, $location,
                               $translate, store, authService, commonBusiness, authBusiness, toast, Idle)
    {
        var vm = this;
        vm.userName = '';

        var userDetails = store.get('user-info');

        if(userDetails)
        {
            vm.userName = userDetails.fullName;
        }

        //Set user-name
        commonBusiness.onMsg('UserName', $scope, function() {
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
            authBusiness.logOut();
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
