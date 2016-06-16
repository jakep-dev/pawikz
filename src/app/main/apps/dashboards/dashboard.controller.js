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
                             breadcrumbBusiness, dashboardBusiness, store)
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

    console.log('Common Business UserId -' + commonBusiness.userId);

    // Methods
    vm.reload = reload;
    vm.initialize = initialize;
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

    //commonBusiness.defineBottomSheet('','',false);

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

        console.log('Draw='+ draw + ' sortOrder=' + sortOrder +' sortFilterIndex=' + sortFilterIndex +
            ' sortFilter=' + sortFilter +
            ' start=' + start + ' length=' + length +
            ' searchFilter=' + searchFilter);

        console.log('searchCompanyId = ' + vm.companyId);
        console.log('userId = ' + vm.userId);

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

            console.log("-- Dashboard Data ---")
            console.log(data);

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
                console.log('User Details - ');
                response.token = token;
                store.set('user-info', response);
                console.log(response);
                authBusiness.userName = response.fullName;
            });
        }
        else {
            authBusiness.userName  = authBusiness.userName
        }

        dataTableConfiguration();
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
            .withOption('paging', true)
            .withOption('autoWidth', true)
            .withOption('responsive', true)
            .withOption('stateSave', true)
            .withOption('order',[4, 'desc'])
            .withPaginationType('full')
            .withDOM('<"top padding-10" <"left"<"length"l>><"right"f>>rt<"top"<"left"<"info text-bold"i>><"right"<"pagination"p>>>');

        //Defining column definitions
        vm.dtColumnDefs = [
            DTColumnDefBuilder.newColumnDef(1).renderWith(actionHtml)
        ];

        //Defining columns for dashboard
        vm.dtColumns = [
            DTColumnBuilder.newColumn('companyName', 'Company Name'),
            DTColumnBuilder.newColumn('projectName', 'Project Name'),
            DTColumnBuilder.newColumn('status', 'Status'),
            // DTColumnBuilder.newColumn('projectHistory', 'Project History'),
            DTColumnBuilder.newColumn('createdBy', 'Created By'),
            DTColumnBuilder.newColumn('lastUpdateDate', 'Last Updated')
        ];
    }
}
