(function ()
{
    'use strict';

    angular
        .module('app.dashboard')
        .controller('DashboardController', DashboardController);


})();
/** @ngInject */
function DashboardController($rootScope, $scope, $mdSidenav, $mdMenu, $stateParams,
                             DTColumnDefBuilder, DTColumnBuilder,
                             DTOptionsBuilder, dashboardService,
                             authService, authBusiness, commonBusiness,
                             breadcrumbBusiness, dashboardBusiness, workupService, store, toast, $mdToast, clientConfig)
{
    var vm = this;
    vm.companyId = 0;
    vm.userId = 0;
    $rootScope.passedUserId = $stateParams.userId;
    if ($stateParams.token != '') {
        $rootScope.passedToken = $stateParams.token;
    }
    breadcrumbBusiness.title = 'My Workups';
    $rootScope.projectOverview = [];


    commonBusiness.userId = $stateParams.userId;

    // Methods
    vm.reload = reload;
    vm.initialize = initialize;
    vm.renewTemplate = renewTemplate;
    vm.toggleSidenav = toggleSidenav;

    // Make Initial call
    vm.initialize($stateParams.isNav, $stateParams.token);

    commonBusiness.onMsg('FilterDashboard', $scope, function() {
        if(dashboardBusiness.isFilterDasboard){
            vm.companyId = dashboardBusiness.searchCompanyId;
            vm.userId = dashboardBusiness.searchUserId;
        }
        else {
            vm.companyId = 0;
            vm.userId = 0;
        }
        redrawDataTable();
    });

    function renewTemplate()
    {
        alert('Clicked');
        //toast.simpleToast(projectName);
        ////workupService.renew($stateParams.userId, projectId);
    }

    //Toggle Sidenav
    function toggleSidenav(sidenavId) {
        $mdSidenav(sidenavId).toggle();
        $mdMenu.hide()
    }

    // Action Html
    function actionHtml(data, type, full, meta)
    {
        return '<a  ui-sref="app.overview({projectId:' + full.projectId + '})" href="/overview/'+ full.projectId  +'">' + data + '</a>';
    }

    function renewHtml(data, type, full, meta)
    {
        return '<input class="renewStyle" ' +
            'type="button" projectId="'+ full.projectId +'" projectName="'+ full.projectName +'" value="Renew" />';
    }

    // Clear search
    function reload() {
        vm.companyId = 0;
        vm.userId = 0;
        dashboardBusiness.isClearDashboard = true;
        redrawDataTable();
        $mdMenu.hide();
    }

    // Redraw datatable
    function redrawDataTable()
    {
        var oTable = $('#dashBoardDetails').dataTable();
        oTable.fnClearTable();
        oTable.fnDraw();
    }

    //search only when hitting enter key
    function searchOnEnter()
    {
        $('#dashBoardDetails_filter input').unbind();
        $('#dashBoardDetails_filter input').bind('keyup', function(e) {
            if(e.keyCode == 13) {
                var oTable = $('#dashBoardDetails').dataTable();
                oTable.fnFilter(this.value);
            }
        });
    }

    // Server Data callback for pagination
    function serverData(sSource, aoData, fnCallback, oSettings)
    {

        searchOnEnter();

        var draw = aoData[0].value;
        var columns = aoData[1].value;
        var sortOrder = aoData[2].value[0].dir;
        var sortFilterIndex = aoData[2].value[0].column;
        var sortFilter = columns[sortFilterIndex].data;
        var start = aoData[3].value;
        var length = aoData[4].value;
        var searchFilter = aoData[5].value.value;

        dashboardService.get($stateParams.userId, vm.userId, vm.companyId,
            start, length, sortOrder, sortFilter, searchFilter).then(function(data)
        {

            var blankData = {
                companyName: '',
                projectName: '',
                status: '',
                createdBy: '',
                lastUpdateDate: ''
            };

            var records = {
                draw: draw,
                recordsTotal: angular.isDefined(data) && angular.isDefined(data.paging) &&
                (data.paging !== null) ? data.paging.totalResults : 0,
                recordsFiltered: angular.isDefined(data) && angular.isDefined(data.paging) &&
                (data.paging !== null) ? data.paging.totalResults   : 0,
                data: angular.isDefined(data) && angular.isDefined(data.projects)
                && data.projects !== null ? data.projects : blankData
            };

            fnCallback(records);
        });
    }


    // Initialize
    function initialize(isNav, token)
    {
        if(isNav)
        {
            store.set('x-session-token', token);
            authService.getUserInfo().then(function(response)
            {
                response.token = token;
                store.set('user-info', response);
                authBusiness.userName = response.fullName;
            });
        }
        else {
            authBusiness.userName  = authBusiness.userName
        }

        dataTableConfiguration();
    }

    function initComplete()
    {
        $('.renewStyle').click(function()
        {
            var obj = $(this);
            var row = obj.closest('tr');

            console.log('Nearest Row - ');
            console.log(row);

            if(obj)
            {
                var projectId = obj[0].attributes['projectId'].value;
                var projectName = obj[0].attributes['projectName'].value;
                workupService.renew($stateParams.userId, projectId);
                toast.simpleToast(projectName + ' getting ready for renewal');
            }
        });
    }

    // DataTable configuration
    function dataTableConfiguration()
    {
        //Dashboard DataTable Configuration
        vm.dtOptions = DTOptionsBuilder
            .newOptions()
            .withFnServerData(serverData)
            .withDataProp('data')
            .withOption('processing', true)
            .withOption('serverSide', true)
            .withOption('initComplete', initComplete)
            .withOption('paging', true)
            .withOption('autoWidth', true)
            .withOption('responsive', true)
            .withOption('stateSave', true)
            .withOption('order',[4, 'desc'])
            .withPaginationType('full')
            .withDOM('<"top padding-10" <"left"<"length"l>><"right"f>>rt<"top"<"left"<"info text-bold"i>><"right"<"pagination"p>>>');

        //Defining column definitions
        vm.dtColumnDefs = [
            DTColumnDefBuilder.newColumnDef(1).renderWith(actionHtml),
            DTColumnDefBuilder.newColumnDef(5).renderWith(renewHtml)
        ];

        //Defining columns for dashboard
        vm.dtColumns = [
            DTColumnBuilder.newColumn('companyName', 'Company Name'),
            DTColumnBuilder.newColumn('projectName', 'Project Name'),
            DTColumnBuilder.newColumn('status', 'Status'),
            DTColumnBuilder.newColumn('createdBy', 'Created By'),
            DTColumnBuilder.newColumn('lastUpdateDate', 'Last Updated'),
            DTColumnBuilder.newColumn('renew', 'Renew')
        ];
    }


    clientConfig.socketInfo.on('notify-renew-workup-status', function(data)
    {
        $rootScope.toastTitle = 'WorkUp Renewal Completed!';
        $rootScope.toastProjectId = data.projectId;
        $mdToast.show({
            hideDelay: 5000,
            position: 'bottom right',
            controller: 'WorkUpToastController',
            templateUrl: 'app/main/components/workup/toast/workup.toast.html'
        });
    });
}
