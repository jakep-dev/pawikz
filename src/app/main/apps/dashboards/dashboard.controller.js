(function ()
{
    'use strict';

    angular
        .module('app.dashboard')
        .controller('DashboardController', DashboardController);

    /** @ngInject */
    function DashboardController($rootScope, $scope, $mdSidenav, $stateParams,
                                        DTColumnDefBuilder, DTColumnBuilder,
                                        DTOptionsBuilder, dashboardService,
                                        authService, authBusiness, commonBusiness,
                                        breadcrumbBusiness, dashboardBusiness, store)
    {
        var vm = this;
        vm.companyId = 0;
        vm.userId = 0;

        $rootScope.passedUserId = $stateParams.userId;
        breadcrumbBusiness.title = 'Dashboard';
        $rootScope.projectOverview = [];
        $rootScope.isBottomSheet = false;

        commonBusiness.userId = $stateParams.userId;

        // Methods
        vm.reload = reload;
        vm.initialize = initialize;

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

        // Action Html
        function actionHtml(data, type, full, meta)
        {
            return '<a ui-sref="app.overview({projectId:' + full.projectId + '})" href="/overview/'+ full.projectId  +'">' + data + '</a>';
        }

        // Clear search
        function reload() {
            vm.companyId = 0;
            vm.userId = 0;
            dashboardBusiness.isClearDashboard = true;
            redrawDataTable();
        }

        // Redraw datatable
        function redrawDataTable()
        {
            var oTable = $('#dashBoardDetails').dataTable();
            oTable.fnClearTable();
            oTable.fnDraw();
        }

        // Server Data callback for pagination
        function serverData(sSource, aoData, fnCallback, oSettings)
        {
            var draw = aoData[0].value;
            var columns = aoData[1].value;
            var sortOrder = aoData[2].value[0].dir;
            var sortFilterIndex = aoData[2].value[0].column;
            var sortFilter = columns[sortFilterIndex].data;
            var start = aoData[3].value;
            var length = aoData[4].value;

            console.log('Draw='+ draw + ' sortOrder=' + sortOrder +' sortFilterIndex=' + sortFilterIndex +
                ' sortFilter=' + sortFilter +
                ' start=' + start + ' length=' + length);

            console.log('searchCompanyId = ' + vm.companyId);
            console.log('userId = ' + vm.userId);

            dashboardService.get($stateParams.userId, vm.userId, vm.companyId,
                start, length, sortOrder, sortFilter).then(function(data)
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

                console.log(records);

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
                    authBusiness.userName = response.fullName;;
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
                .withOption('stateSave', false)
                .withOption('order',[4, 'desc'])
                .withPaginationType('full')
                .withDOM('<"top bottom"<"left"<"length"l>><"right"f>>rt<"bottom"<"left"<"info text-bold"i>><"right"<"pagination"p>>>');

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

})();
