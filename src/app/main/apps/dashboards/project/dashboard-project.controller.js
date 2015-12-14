(function ()
{
    'use strict';

    angular
        .module('app.dashboard-project')
        .controller('DashboardProjectController', DashboardProjectController);



    /** @ngInject */
    function DashboardProjectController($rootScope, $mdSidenav, $stateParams,
                                        DTColumnDefBuilder, DTColumnBuilder,
                                        DTOptionsBuilder, DTInstanceFactory, dataservice)
    {
        $rootScope.title = 'Dashboard';
        $rootScope.passedUserId = $stateParams.userId;
        $rootScope.passedToken = $stateParams.token;
        $rootScope.projectOverview = [];

        console.log($rootScope.title);

        var vm = this;
        $rootScope.companyId = 0;
        $rootScope.userId = 0;
        $rootScope.isSearching = false;


        vm.companyNames = [{ id: 0,  name: 'All' }];
        vm.users = [{ id: 0,  name: 'All' }];

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
            .withPaginationType('full')
            .withDOM('<"top bottom"<"left"<"length"l>><"right"f>>rt<"bottom"<"left"<"info text-bold"i>><"right"<"pagination"p>>>');



        function serverData(sSource, aoData, fnCallback, oSettings)
        {

            console.log(aoData);

            var draw = aoData[0].value;
            var columns = aoData[1].value;
            var sortOrder = aoData[2].value[0].dir;
            var sortFilterIndex = aoData[2].value[0].column;
            var sortFilter = columns[sortFilterIndex].data;
            var start = aoData[3].value;
            var length = aoData[4].value;

            console.log(aoData[2].value);



            console.log('Draw='+ draw + ' sortOrder=' + sortOrder +' sortFilterIndex=' + sortFilterIndex +
                ' sortFilter=' + sortFilter +
                ' start=' + start + ' length=' + length);

            console.log('searchCompanyId = ' + $rootScope.companyId);
            console.log('userId = ' + $rootScope.userId);

            dataservice.getDashboard($stateParams.userId, $rootScope.userId, $rootScope.companyId,
                start, length, sortOrder, sortFilter).then(function(data)
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
                    recordsTotal: angular.isDefined(data.paging) ? data.paging.totalResults : 0,
                    recordsFiltered: angular.isDefined(data.paging) ? data.paging.totalResults   : 0,
                    data: angular.isDefined(data.projects) && data.projects !== null ? data.projects : blankData
                };

                console.log(records);

                fnCallback(records);

                $rootScope.isSearching = false;

            });
        }


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

        // Methods
        vm.toggleSidenav = toggleSidenav;

        //Toggle Sidenav
        function toggleSidenav(sidenavId) {
            $mdSidenav(sidenavId).toggle();
        }

        function actionHtml(data, type, full, meta)
        {
            //console.log('data = ');
            //console.log(data);
            //console.log('type = ');
            //console.log(type);
            //console.log('full = ');
            //console.log(full);
            //console.log('meta = ');
            //console.log(meta);

            return '<a ui-sref="app.overview({projectId:' + full.projectId + '})" href="/overview/'+ full.projectId  +'">' + data + '</a>';
        }

        // Methods
        vm.filterDashboard = filterDashboard;
        vm.searchClear = searchClear;
        vm.loadCompanyNames = loadCompanyNames;
        vm.loadUserNames = loadUserNames;

        // Load User Names
        function loadUserNames() {
            if (_.size(vm.users) === 1) {
                $rootScope.isSearching = true;

                dataservice.getDashboardUsers().then(function(data)
                {
                    var result = data.list;

                    angular.forEach(result, function(row)
                    {
                        vm.users.push(row);
                    });
                    $rootScope.isSearching = false;

                });
            }
        }

        // Load Company Names
        function loadCompanyNames() {
            if (_.size(vm.companyNames) === 1) {
                $rootScope.isSearching = true;
                dataservice.getDashboardCompanies().then(function(data)
                {
                    var result = data.list;

                    angular.forEach(result, function(row)
                    {
                        vm.companyNames.push(row);
                    });
                    $rootScope.isSearching = false;
                });
            }
        }

        //Filter Dashboard
        function filterDashboard() {
            $rootScope.isSearching = true;
            var oTable = $('#dashBoardDetails').dataTable();
            oTable.fnClearTable();
            oTable.fnDraw();
        }

        // Clear search
        function searchClear() {
            $rootScope.isSearching = true;
            $rootScope.companyId = 0;
            $rootScope.userId = 0;
            var oTable = $('#dashBoardDetails').dataTable();
            oTable.fnClearTable();
            oTable.fnDraw();
        }

    }

})();
