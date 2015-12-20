(function ()
{
    'use strict';

    angular
        .module('fuse')
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider, $urlRouterProvider, $locationProvider)
    {
        $locationProvider.html5Mode(true);

        $urlRouterProvider.otherwise('/dashboard-project/{userId}/{token}');

        //$urlRouterProvider.otherwise('/overview/100145066');

        $stateProvider
            .state('app', {
                abstract: true,
                views   : {
                    'main@'         : {
                        templateUrl: 'app/core/layouts/default.html'
                    },
                    'toolbar@app': {
                        templateUrl: 'app/toolbar/toolbar.html',
                        controller : 'ToolbarController as vm'
                    },
                    'navigation@app': {
                        templateUrl: 'app/sidenav/navigation/navigation.html',
                        controller : 'NavigationController as vm'
                    },
                    'breadcrumb@app': {
                      templateUrl: 'app/breadcrumb/breadcrumb.html',
                      controller : 'BreadcrumbController as vm'
                    },
                    'bottomsheet@app': {
                        templateUrl: 'app/bottomsheet/bottomsheet.html',
                        controller : 'BottomsheetController as vm'
                    }
                }
            });
    }

})();
