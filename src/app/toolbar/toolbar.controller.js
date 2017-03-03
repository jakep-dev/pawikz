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
        vm.menuMode = '';

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

        commonBusiness.onMsg('inject-main-menu', $scope, function(ev, data) {
            vm.menuIcon = data.menuIcon;
            vm.menuName = data.menuName;
            vm.menuMode = data.menuMode;
            vm.companyId = data.companyId || null;
            vm.companyName = data.companyName || null;
        });




        // Methods
        vm.toggleSidenav = toggleSidenav;
        vm.toggleNavigationSidenavFold = toggleNavigationSidenavFold;
        vm.dashboardReload = dashboardReload;
        vm.saveAllProjectOverview = saveAllProjectOverview;
        vm.flipProjectOverView = flipProjectOverView;
        vm.toggleExpandProjectOverview = toggleExpandProjectOverview;
        vm.flipSelectionOverview = flipSelectionOverview;
        vm.pdfDownload = pdfDownload;
        vm.renew = renew;

        vm.previousStep = previousStep;
        vm.nextStep = nextStep;
        vm.stepSaveAll = stepSaveAll;
        vm.printableAll = printableAll;
        vm.stepToggleExpand = stepToggleExpand;

        function setupListeners() {
            var userDetails = store.get('user-info');

            if (userDetails) {
                vm.userName = userDetails.fullName;
                notificationBusiness.listenToPDFDownloadStatus(userDetails.userId);
                notificationBusiness.listenToWorkUpStatus(userDetails.userId);
                notificationBusiness.listenToRenewStatus(userDetails.userId);
                $interval.cancel(promiseSetupListener);
            } else {
                console.log('[setupListeners]userId not available.');
            }
        }

        vm.isPrintableAll = false;
        vm.isStepExpanded = false;
        function stepToggleExpand(){
            vm.isStepExpanded = !vm.isStepExpanded;
            commonBusiness.emitMsg('step-toogle-expand');
        }

        function printableAll(){
            vm.isPrintableAll = !vm.isPrintableAll;
            commonBusiness.emitMsg('step-print-all');
        }

        function stepSaveAll(){
            commonBusiness.emitMsg('step-save-all');
        }

        function previousStep(){
            commonBusiness.emitMsg('prev-step');
        }

        function nextStep(){
            commonBusiness.emitMsg('next-step');
        }

        function dashboardReload(){
            commonBusiness.emitMsg('dashboard-reload');
        }

        vm.isStepTabletMode = false;
        vm.isProjectOverviewExpanded = false;
        vm.isProjectOverviewAllSelected = false;
        function saveAllProjectOverview(){
            commonBusiness.emitMsg('project-overview-save-all');
        }

        function flipProjectOverView(){
            vm.isStepTabletMode = !vm.isStepTabletMode;
            commonBusiness.emitMsg('project-overview-flip');
        }

        function toggleExpandProjectOverview(){
            vm.isProjectOverviewExpanded = !vm.isProjectOverviewExpanded;
            commonBusiness.emitMsg('project-overview-toggle-expand');
        }

        function flipSelectionOverview(){
            vm.isProjectOverviewAllSelected = !vm.isProjectOverviewAllSelected;
            commonBusiness.emitMsg('project-overview-flip-selection');
        }

        function pdfDownload(){
            console.log('emit pdf download')
            commonBusiness.emitMsg('pdf-download');
        }

        function renew(){
            commonBusiness.emitMsg('project-renew');
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
    }

})();
