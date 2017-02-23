(function ()
{
    'use strict';

    angular
        .module('app.toolbar')
        .controller('ToolbarController', ToolbarController);

    /** @ngInject */
    function ToolbarController($rootScope, $scope, $mdSidenav, $stateParams, $location, $translate, $interval,
                               store, toast, Idle,
                               commonBusiness, authBusiness, notificationBusiness,
                               msNavFoldService, authService)
    {
        var vm = this;
        vm.userName = '';
        vm.url = '';
        vm.menuIcon = '';
        vm.menuName = '';
        vm.companyId = null;
        vm.companyName = null;

        var userDetails = store.get('user-info');
        var promiseSetupListener = null;

        if(userDetails)
        {
            vm.userName = userDetails.fullName;
            notificationBusiness.listenToPDFDownloadStatus(userDetails.userId);
            notificationBusiness.listenToWorkUpStatus(userDetails.userId);
            notificationBusiness.listenToRenewStatus(userDetails.userId);
        } else {
            promiseSetupListener = $interval(setupListeners, 1000);
        }

        commonBusiness.onMsg('UserFullName', $scope, function(ev, data) {
            vm.userName = data;
        });

        commonBusiness.onMsg('InjectMainMenu', $scope, function(ev, data) {
            vm.menuIcon = data.menuIcon;
            vm.menuName = data.menuName;
            vm.companyId = data.companyId || null;
            vm.companyName = data.companyName || null;
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
        vm.executeMenuAction = executeMenuAction;
        vm.checkForParentFunction = checkForParentFunction;

        function checkForParentFunction(){
            console.log('Hey toolbar controller');
        }

        function setupListeners() {
            var userDetails = store.get('user-info');

            if (userDetails) {
                vm.userName = userDetails.fullName;
                console.log('[setupListeners]Start background listeners with userDetails.userId. [' + userDetails.userId + ']');
                notificationBusiness.listenToPDFDownloadStatus(userDetails.userId);
                notificationBusiness.listenToWorkUpStatus(userDetails.userId);
                notificationBusiness.listenToRenewStatus(userDetails.userId);
                $interval.cancel(promiseSetupListener);
            } else {
                console.log('[setupListeners]userId not available.');
            }
        }

        function executeMenuAction(name, data){
            commonBusiness.emitWithArgument(name, data);
        }

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
