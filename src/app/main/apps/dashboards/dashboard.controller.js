(function ()
{
    'use strict';

    angular
        .module('app.dashboard')
        .controller('DashboardController', DashboardController);


})();
/** @ngInject */
function DashboardController($rootScope, $scope, $mdSidenav, $mdMenu, $stateParams,
                             $compile, $location, $interval, $mdToast,
                             DTColumnDefBuilder, DTColumnBuilder, DTOptionsBuilder,
                             store, dialog, clientConfig,
                             commonBusiness, notificationBusiness,
                             breadcrumbBusiness, dashboardBusiness, workupBusiness,
                             dashboardService, authService)
{
    var vm = this;
    vm.companyId = 0;
    vm.userId = 0;
    vm.isRedrawFromDelete = false;
    vm.selectedProjectId = null;
    vm.searches = [];

    $rootScope.passedUserId = $stateParams.userId;
    if ($stateParams.token != '') {
        $rootScope.passedToken = $stateParams.token;
    }
    breadcrumbBusiness.title = 'My Work-ups';
    $rootScope.projectOverview = [];
    commonBusiness.userId = $stateParams.userId;

    // Methods
    vm.reload = reload;
    vm.initialize = initialize;
    vm.renewTemplate = renewTemplate;
    vm.toggleSidenav = toggleSidenav;
    vm.filterAgain = filterAgain;
    defineMenuActions();

    function defineMenuActions(){
        "use strict";
        commonBusiness.emitWithArgument("inject-main-menu", {
            menuName: 'My Work-ups',
            menuIcon: 'fa fa-folder-open-o s16',
            menuMode: 'Dashboard'
        });

        commonBusiness.onMsg("dashboard-reload", $scope, function(){
           reload();
        });
    }



    function filterAgain(name){
        if(vm.searches.length === 0){
            vm.companyId = 0;
            vm.userId = 0;
            commonBusiness.emitWithArgument("ClearFilter", {type: 'All'});

        }
        else{
            var combinedStr = '';
            _.each(vm.searches, function(search){
                combinedStr += search;
            });

            if(!combinedStr.includes('Company')){
                vm.companyId = 0;
                commonBusiness.emitWithArgument("ClearFilter", {type: 'Company'});
            }

            if(!combinedStr.includes('User')){
                vm.userId = 0;
                commonBusiness.emitWithArgument("ClearFilter", {type: 'User'});
            }
        }

        redrawDataTable();
    }



    // Make Initial call
    vm.initialize($stateParams.isNav, $stateParams.token);

    commonBusiness.onMsg('FilterMyWorkUp', $scope, function(ev, data) {
        if(data) {
            vm.companyId = data.companyId;
            vm.userId = data.userId;
            vm.searches = [];
            if(parseInt(vm.companyId) !== 0){
                vm.searches.push("Company: " + data.companyName);
            }

            if(parseInt(vm.userId) !== 0){
                vm.searches.push("User: " + data.userName);
            }
            redrawDataTable();
        }
    });

    commonBusiness.onMsg('notify-create-workup-notification-center', $scope, function(ev, data) {
        console.log('notify-create-workup-notification-center');
        notificationBusiness.pushNotification(data);
    });

    function deleteWorkup(projectId, projectName)
    {
        dialog.confirm(clientConfig.messages.dashboardDelete.title,
            projectName + clientConfig.messages.dashboardDelete.content,
            null, {
                ok: {
                    callBack: function () {
                        vm.selectedProjectId = projectId;
                        toggleRedraw();
                        redrawDataTable();
                    }
                },
                cancel:{
                    callBack:function(){
                        return false;
                    }
                }
            }, null, false);
    }

    function toggleRedraw()
    {
        vm.isRedrawFromDelete = !vm.isRedrawFromDelete;
    }

    function recompileHtml(row, data, dataIndex) {
        $compile(angular.element(row).contents())($scope);
    }

    function autoResize(){
        $(window).on("resize", function () {
            var elem = $("#dashBoardDetails");
            if(elem && elem.length > 0){
                var tableRow = $("#dashBoardDetails").get(0).rows;
                $compile(angular.element(tableRow).contents())($scope);
            }
        });
    }

    function renewTemplate()
    {
        $('.renewStyle').click(function()
        {
            var obj = $(this);
            var row = obj.closest('tr');

            if(!row.hasClass('not-active'))
            {
                row.addClass('not-active');
                if(obj)
                {
                    var projectId = obj[0].attributes['projectId'].value;
                    var projectName = obj[0].attributes['projectName'].value;
                    workupBusiness.renewFromDashboard($stateParams.userId, parseInt(projectId), projectName);
                }
            }
        });

        $('.overviewStyle').click(function()
        {
            var obj = $(this);
            var row = obj.closest('tr');

            if(!row.hasClass('not-active') && obj) {
                var projectId = obj[0].attributes['projectId'].value;
                $location.url('/overview/' + projectId);
            }
        });

        $('.deleteWorkupStyle').unbind('click');
        $('.deleteWorkupStyle').click(function(event)
        {
            var obj = $(this);
            var row = obj.closest('tr');

            if(!row.hasClass('not-active') && obj) {
                var projectId = obj[0].attributes['projectId'].value;
                var projectName = obj[0].attributes['projectName'].value;
                deleteWorkup(projectId, projectName);
            }
        });


        if($('#dashBoardDetails tbody tr:first td').length > 0) {
            $('#dashBoardDetails tbody tr[role="row"]').click(function()
            {
               var overviewPromise = $interval(function()
               {
                   if($('.overviewStyle').length > 0)
                   {
                       $('.overviewStyle').click(function()
                       {
                           var obj = $(this);
                           var row = obj.closest('tr');

                           if(!row.hasClass('not-active') && obj) {
                               var projectId = obj[0].attributes['projectId'].value;
                               $location.url('/overview/' + projectId);
                           }
                       });
                       $interval.cancel(overviewPromise);
                   }
               }, 100);



                var renewPromise = $interval(function()
                {
                    if($('.renewStyle').length > 0)
                    {
                        $('.renewStyle').click(function()
                        {
                            var obj = $(this);
                            var row = obj.closest('tr');

                            if(!row.hasClass('not-active'))
                            {
                                row.addClass('not-active');
                                if(obj)
                                {
                                    var projectId = obj[0].attributes['projectId'].value;
                                    var projectName = obj[0].attributes['projectName'].value;
                                    workupBusiness.renewFromDashboard($stateParams.userId, parseInt(projectId), projectName);
                                }
                            }
                        });
                        $interval.cancel(renewPromise);
                    }
                }, 100);

                var deletePromise = $interval(function()
               {
                   if($('.deleteWorkupStyle').length > 0)
                   {
                       $('.deleteWorkupStyle').unbind('click');
                       $('.deleteWorkupStyle').click(function()
                       {
                           var obj = $(this);
                           var row = obj.closest('tr');

                           if(!row.hasClass('not-active') && obj) {
                                var projectId = obj[0].attributes['projectId'].value;
                                var projectName = obj[0].attributes['projectName'].value;
                                deleteWorkup(projectId, projectName);
                           }
                       });
                       $interval.cancel(deletePromise);
                   }
               }, 100);

            });
        }



        var token = store.get('x-session-token');

        clientConfig.socketInfo.socket.emit("init-workup", {
            token: token
        }, function(response)
        {
            if(response && response.length)
            {
                workUpStatus(response);
            }
        });
        autoResize();
    }

    //Toggle Sidenav
    function toggleSidenav(sidenavId) {
        $mdSidenav(sidenavId).toggle();
        $mdMenu.hide();
    }

    // Clear search
    function reload() {
        vm.companyId = 0;
        vm.userId = 0;
        vm.searches = [];
        commonBusiness.emitWithArgument("ClearFilter", {type: 'All'});
        redrawDataTable();
        $mdMenu.hide();
    }

    // Redraw datatable
    function redrawDataTable()
    {
        var oTable = $('#dashBoardDetails').dataTable();
        //oTable.fnClearTable();
        oTable.fnDraw();
    }

    //search only when hitting enter key
    function searchOnEnter()
    {
        $('#dashBoardDetails_filter input').unbind();
        $('#dashBoardDetails_filter input').bind('keyup input propertychange', function(e) {
            if(e.keyCode == 13 || this.value.length == 0) {
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

        if(!vm.isRedrawFromDelete)
        {
            dashboardService.get($stateParams.userId, vm.userId, vm.companyId,
                start, length, sortOrder, sortFilter, searchFilter, $rootScope.projectId).then(function(data)
            {
                var blankData = {
                    companyName: '',
                    projectName: '',
                    status: '',
                    createdBy: '',
                    createdDate: '',
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
        else {

            //Get projectId, filterParam (which is basically dashboard)
            //Call Dashboard processRemoveWorkUp
            //Result from processRemoveWorkup will have filterDashboard result
            //Call fnCallback(records);
            var filterParam = {
                userId: $stateParams.userId,
                searchUserId: vm.userId,
                searchCompanyId: vm.companyId,
                rowNum: start,
                perPage: length,
                sortOrder: sortOrder,
                sortFilter: sortFilter,
                searchFilter: searchFilter,
                projectId: $rootScope.projectId
            };

            dashboardService.processRemoveWorkUp(vm.selectedProjectId, filterParam).then(function(results)
            {
                vm.selectedProjectId = null;

                var data = results.dashboard;
                var deleted = results.delete;
                var blankData = {
                    companyName: '',
                    projectName: '',
                    status: '',
                    createdBy: '',
                    createdDate: '',
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

                toggleRedraw();
                fnCallback(records);
            });
        }

    }


    // Initialize
    function initialize(isNav, token)
    {
        notificationBusiness.initializeMessages($scope);
        if(isNav)
        {
            store.set('x-session-token', token);
            authService.getUserInfo().then(function(response)
            {
                response.token = token;
                store.set('user-info', response);
                commonBusiness.emitWithArgument('UserFullName', response.fullName);
            });
        }
        dataTableConfiguration();
        autoResize();
    }

    function initComplete()
    {

    }

    // DataTable configuration
    function dataTableConfiguration()
    {
        //Defining column definitions
        vm.dtColumnDefs = [
            DTColumnDefBuilder.newColumnDef(1).renderWith(dashboardBusiness.getWorkupHtml),
            DTColumnDefBuilder.newColumnDef(5).renderWith(dashboardBusiness.getPlatformHtml),
            DTColumnDefBuilder.newColumnDef(6).renderWith(dashboardBusiness.getActionButtonsHtml).notSortable()
        ];

        // render data for browser resizing
        var responsive = {details :
                { renderer : dashboardBusiness.renderHtml }
            };

        //Dashboard DataTable Configuration
        vm.dtOptions = DTOptionsBuilder
            .newOptions()
            .withFnServerData(serverData)
            .withDataProp('data')
            .withOption('processing', true)
            .withOption('serverSide', true)
            .withOption('initComplete', initComplete)
            .withOption('drawCallback', renewTemplate)
            .withOption('createdRow', recompileHtml)
            .withOption('paging', true)
            .withOption('autoWidth', true)
            .withOption('responsive', responsive)
            .withOption('stateSave', true)
            .withOption('order',[4, 'desc'])
            .withPaginationType('full')
            .withDOM('<"top padding-10" <"left"<"length"l>><"right"f>>rt<"top padding-10"<"left"<"info text-bold"i>><"right"<"pagination"p>>>');

        //Defining columns for dashboard
        vm.dtColumns = [
            DTColumnBuilder.newColumn('companyName', 'Company Name'),
            DTColumnBuilder.newColumn('projectName', 'Work-up Name'),
            DTColumnBuilder.newColumn('createdBy', 'Created By'),
            DTColumnBuilder.newColumn('createdDate', 'Created Date'),
            DTColumnBuilder.newColumn('lastUpdateDate', 'Last Updated'),
            DTColumnBuilder.newColumn('isNewFramework', 'Platform'),
            DTColumnBuilder.newColumn('action', 'Action')
        ];
        autoResize();
    }

    function dashboardRenewalUpdate(data) {
        if(data.project_name) {
            $rootScope.toastTitle = 'WorkUp Renewal Completed!';
            $rootScope.toastProjectId = data.projectId;
            $mdToast.show({
                hideDelay: 5000,
                position: 'bottom right',
                controller: 'WorkUpToastController',
                templateUrl: 'app/main/components/workup/toast/workup.toast.html'
            });    
        }
        var obj = $('.renewStyle[projectId="' + data.old_project_id + '"]');
        var row = obj.closest('tr');
        row.removeClass('not-active');

        console.log('Renewal WorkUp');
        console.log(data);
    }
    notificationBusiness.setDashboardCallback(dashboardRenewalUpdate);

    ///Work-Up Status
    function workUpStatus(data)
    {
        console.log('Workup Status - ');
        console.log(data);

        var workups = [];
        if(data) {
			if(data.length > 0) {
				workups.push.apply(workups, data);
			}
		}

        if(workups && _.size(workups) > 0)
        {
            _.each(workups, function(workUp)
            {
                var obj = $('.renewStyle[projectId="'+ workUp.projectId +'"]');
                var row = obj.closest('tr');

                switch (workUp.status)
                {
                    case 'in-process':
                    case 'delete':
                    case 'renewal':
                        row.removeClass('not-active');
                        row.addClass('not-active');
                        break;
                    case 'DataRefresh':
                        row.removeClass('not-active');
                        row.addClass('not-active');
                        break;
                    case 'complete':
                        row.removeClass('not-active');
                        break;
                }
            });
        }
    }

    if(clientConfig.socketInfo.socket) {
        clientConfig.socketInfo.socket.on('workup-room-message', 
            function(response)
            {
                if(response)
                {
                    switch (response.type)
                    {
                        case 'workup-info':
                            workUpStatus(response.data);
                            break;
                    }
                }
            }
        );
    }
}
