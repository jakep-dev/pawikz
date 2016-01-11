(function ()
{
    'use strict';

    angular
        .module('app.dashboard-project')
        .controller('DashboardProjectController', DashboardProjectController);

    /** @ngInject */
    function DashboardProjectController($rootScope, $mdSidenav, $stateParams,
                                        DTColumnDefBuilder, DTColumnBuilder,
                                        DTOptionsBuilder, dashboardService,
                                        authService, store)
    {
        $rootScope.title = 'Dashboard';
        $rootScope.passedUserId = $stateParams.userId;
        $rootScope.projectOverview = [];
        $rootScope.isBottomSheet = false;
        $rootScope.companyId = 0;
        $rootScope.userId = 0;
        $rootScope.isSearching = false;
        $rootScope.isOperation = false;

        var vm = this;
        vm.companyNames = [{ id: 0,  name: 'All', shortName:'All' }];
        vm.users = [{ id: 0,  name: 'All' }];

        // Methods
        vm.filterDashboard = filterDashboard;
        vm.searchClear = searchClear;
        vm.loadCompanyNames = loadCompanyNames;
        vm.loadUserNames = loadUserNames;
        vm.initialize = initialize;

        // Make Initial call
        vm.initialize($stateParams.isNav, $stateParams.token);

        // Methods
        vm.toggleSidenav = toggleSidenav;

        //Toggle Sidenav
        function toggleSidenav(sidenavId) {
            $mdSidenav(sidenavId).toggle();
        }

        // Action Html
        function actionHtml(data, type, full, meta)
        {
            return '<a ui-sref="app.overview({projectId:' + full.projectId + '})" href="/overview/'+ full.projectId  +'">' + data + '</a>';
        }

        // Load User Names
        function loadUserNames() {
            if (_.size(vm.users) === 1) {
                $rootScope.isSearching = true;
                dashboardService.getUsers($rootScope.passedUserId).then(function(data)
                {
                    if(angular.isDefined(data))
                    {
                        var result = data.list;

                        angular.forEach(result, function(row)
                        {
                            vm.users.push(row);
                        });
                    }

                    $rootScope.isSearching = false;

                });
            }
        }

        // Load Company Names
        function loadCompanyNames() {
            if (_.size(vm.companyNames) === 1) {
                $rootScope.isSearching = true;
                dashboardService.getCompanies($rootScope.passedUserId).then(function(data)
                {
                    if(angular.isDefined(data))
                    {
                        var result = data.list;

                        angular.forEach(result, function(row)
                        {
                            vm.companyNames.push(row);
                        });
                    }

                    $rootScope.isSearching = false;
                });
            }
        }

        //Filter Dashboard
        function filterDashboard() {
            $rootScope.isSearching = true;
            redrawDataTable();
        }

        // Clear search
        function searchClear() {
            $rootScope.isSearching = true;
            $rootScope.companyId = 0;
            $rootScope.userId = 0;
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

            console.log('searchCompanyId = ' + $rootScope.companyId);
            console.log('userId = ' + $rootScope.userId);

            dashboardService.get($stateParams.userId, $rootScope.userId, $rootScope.companyId,
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

                $rootScope.isSearching = false;

            });
        }


        // Initialize
        function initialize(isNav, token)
        {
            if(isNav === 'true')
            {
                store.set('x-session-token', token);
                authService.getUserInfo().then(function(response)
                {
                    console.log('----Additional User Info----');
                    $rootScope.userFullName = response.fullName;
                });
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
