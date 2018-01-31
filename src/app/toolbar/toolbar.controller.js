(function ()
{
    'use strict';

    angular
        .module('app.toolbar')
        .controller('ToolbarController', ToolbarController);

    /** @ngInject */
    function ToolbarController($scope, $mdSidenav, $interval, toast,
                               store, commonBusiness, notificationBusiness, msNavFoldService, overviewBusiness, newsBusiness)
    {
        var vm = this;
        vm.userName = '';
        vm.url = '';
        vm.menuIcon = '';
        vm.menuName = '';
        vm.companyId = null;
        vm.companyName = null;
        vm.workupName = null;
        vm.menuMode = '';

        var userDetails = store.get('user-info');
        var promiseSetupListener = null;

        console.log('UserDetails - ', userDetails);
        if(userDetails)
        {
            vm.userName = userDetails.fullName;
            notificationBusiness.listenToPDFDownloadStatus(userDetails.userId);
            notificationBusiness.listenToWorkUpStatus(userDetails.userId);
            notificationBusiness.listenToRenewStatus(userDetails.userId);
            notificationBusiness.listenToDataRefreshStatus(userDetails.userId);
        } else {
            promiseSetupListener = $interval(setupListeners, 1000);
        }

        commonBusiness.onMsg('inject-main-menu', $scope, function(ev, data) {
            vm.menuIcon = data.menuIcon;
            vm.menuName = data.menuName;
            vm.menuMode = data.menuMode;
            vm.companyId = data.companyId || null;
            vm.companyName = data.companyName || null;
            vm.workupName = data.workupName || null;
            vm.isProjectOverviewAllSelected = false;
            vm.isStepExpanded = false;
            vm.isProjectOverviewExpanded = false;

            // clear the content of an array in every navigation of the page, 
            // purposed for delete news attachment 
            newsBusiness.selectedArticles = [];

            switch (vm.menuMode){
                case 'Steps':
                    listenToStepMessages();
                    break;

                default:break;
            }
        });

        commonBusiness.onMsg('project-overview-set-selection', $scope, function(ev, data) {
            vm.isProjectOverviewAllSelected = data;
        });

        commonBusiness.onMsg('project-step-set-selection', $scope, function(ev, data) {
            vm.isPrintableAll = data;
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
        vm.dataRefresh = dataRefresh;
        vm.projectHistory = projectHistory;

        vm.previousStep = previousStep;
        vm.nextStep = nextStep;
        vm.stepSaveAll = stepSaveAll;
        vm.printableAll = printableAll;
        vm.stepToggleExpand = stepToggleExpand;
        vm.loadMore = loadMore;

        vm.downloadProjectHistory = downloadProjectHistory;


        //Download Project History
        function downloadProjectHistory(type){
            switch (type){
                case 'csv':
                    commonBusiness.emitMsg('project-history-download-csv');
                    break;

                case 'pdf':
                    break;

                default:
                    break;
            }
        }

        function loadMore(){
            commonBusiness.emitMsg('step-load-more');
        }

        function setupListeners() {
            var userDetails = store.get('user-info');

            if (userDetails) {
                vm.userName = userDetails.fullName;
                notificationBusiness.listenToPDFDownloadStatus(userDetails.userId);
                notificationBusiness.listenToWorkUpStatus(userDetails.userId);
                notificationBusiness.listenToRenewStatus(userDetails.userId);
                notificationBusiness.listenToDataRefreshStatus(userDetails.userId);
                $interval.cancel(promiseSetupListener);
            } else {
                console.log('[setupListeners]userId not available.');
            }
        }

        vm.isPrintableAll = false;
        vm.isStepExpanded = false;
        vm.isPrevDisabled = false;
        vm.isNextDisabled = false;
        function stepToggleExpand(){
            vm.isStepExpanded = !vm.isStepExpanded;
            commonBusiness.emitMsg('step-toggle-expand');
        }

        function listenToStepMessages(){
            console.log('Hey am hitting here');
            commonBusiness.onMsg('IsPrevDisabled', $scope, function(){
                console.log('Fired');
                console.log(commonBusiness.isPrevDisabled);
                vm.isPrevDisabled = commonBusiness.isPrevDisabled;
            });

            commonBusiness.onMsg('IsNextDisabled', $scope, function(){
                console.log('Fired');
                console.log(commonBusiness.isNextDisabled);
                vm.isNextDisabled = commonBusiness.isNextDisabled;
            });
        }

        function printableAll(){
            vm.isPrintableAll = !vm.isPrintableAll;
            if(vm.isPrintableAll){
                    toast.simpleToast('Section will show on pdf download');
                } else {
                    toast.simpleToast('Section will not show on pdf download');
                }
            commonBusiness.emitMsg('step-print-all');
        }

        function stepSaveAll(){
            commonBusiness.emitMsg('step-save-all');
            overviewBusiness.save(); 
            overviewBusiness.cancelPromise(); 
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
            
            //trigger save overview before pdf download to update the pdf content
            if(vm.menuMode === 'ProjectOverview'){
                commonBusiness.emitMsg('project-overview-save-all');
            }
            
            commonBusiness.emitMsg('pdf-download');
        }

        function renew(){
            //Clear all selected news articles for renewal purposed
            newsBusiness.bookmarkedArticles = [];
            commonBusiness.emitMsg('project-renew');
        }

        function dataRefresh(){
            commonBusiness.emitMsg('project-data-refresh');
        }

        function projectHistory(){
            commonBusiness.emitMsg('project-history');
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
